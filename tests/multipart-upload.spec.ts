require('dotenv').config();
import { spec, request } from 'pactum';
import fs from 'fs';
import { arrayBuffer } from 'node:stream/consumers';

const firstTagName = 'lowercase-tag-name';
const firstTagValue = 'some tag';

const tags = [
    {
        "name": firstTagName,
        "value": firstTagValue
    }
]
const tagsBase64Encoded = Buffer.from(JSON.stringify(tags)).toString('base64');

const CHUNK_SIZE = 1024 * 1024 * 5; // 5MB
const FILE_PATH = './tests/data/20mb.pdf';

describe('Files API', () => {
    before(async () => {
        request.setDefaultTimeout(30000);
        request.setBaseUrl(process.env.BASE_URL as string);
    });

    it('should upload file to ACS (Akord Cloud Storage) usnig multipart upload', async () => {
        // Get total file size
        const stats = await fs.promises.stat(FILE_PATH);
        const fileSize = stats.size;

        const uploadChunk = async (start: number, end: number, headers: HeadersInit = {}) => {
            const chunkStream = fs.createReadStream('./tests/data/20mb.pdf', { start: start, end: end });
            const chunk = await arrayBuffer(chunkStream)
            console.log(chunk.byteLength)
            const response = await fetch(`${process.env.BASE_URL}/files?tags=${tagsBase64Encoded}`, {
                method: 'POST',
                headers: {
                    'Api-Key': process.env.API_KEY as string,
                    'Content-Type': 'application/pdf',
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    ...headers
                },
                body: chunk
            });
            console.log("Uploaded chunk: " + `bytes ${start}-${end}/${fileSize}`)

            if (response.status !== 202) {
                throw new Error('Failed to upload first chunk of the file. Status code: ' + response.status);
            }
            return response;
        }
        // Upload first chunk of the file
        const response = await uploadChunk(0, CHUNK_SIZE);

        // Read location of the multipart upload
        const contentLocation = response.headers.get('Content-Location');
        if (!contentLocation) {
            throw new Error('Content-Location header is missing');
        }

        // Upload middle chunks of the file using 'Content-Location' & 'Content-Range' - can be done concurrently
        let sourceOffset = CHUNK_SIZE;
        while (sourceOffset + CHUNK_SIZE < fileSize) {
            await uploadChunk(sourceOffset, sourceOffset + CHUNK_SIZE, { 'Content-Location': contentLocation });
            sourceOffset += CHUNK_SIZE;
        }

        // Upload last chunk of the file to complete the multipart upload
        await uploadChunk(sourceOffset, fileSize, { 'Content-Location': contentLocation });
    });
});