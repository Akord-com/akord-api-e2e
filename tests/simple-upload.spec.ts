require('dotenv').config();
import { spec, request } from 'pactum';
import { gt, regex } from 'pactum-matchers';

const FILE_ID_REGEXP = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
const TX_ID_REGEXP = /[a-zA-Z0-9_-]+$/i;

const GATEWAY_URL_REGEXP = /^https:\/\/akrd\.net\/[a-zA-Z0-9_-]+$/i;
const ARIO_GATEAY_URL_REGEXP = /^https:\/\/arweave\.net\/[a-zA-Z0-9_-]+$/i;
const VIEWBLOCK_URL_REGEXP = /^https:\/\/viewblock\.io\/arweave\/tx\/[a-zA-Z0-9_-]+$/i;
const FILE_STATUS_URL_REGEXP = /^https:\/\/api\.akord\.com\/files\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/status$/i;
const FILE_URL_REGEXP = /^https:\/\/api\.akord\.com\/files\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const DOCS_URL = 'https://docs.akord.com/api-and-dev-tools/build/akord-api/files';
const INFO_TEXT = "Transaction is visible on the blockchain indexers when in the \"committed\" status.";


const firstTagName = 'lowercase-tag-name';
const firstTagValue = 'some tag';
const secondTagName = 'Uppercase-Tag-Name';
const secondTagValue = 'Other Tag';

const contentTypeStandardTagName = 'Content-Type';
const contentTypeStandardTagValue = 'text/plain';

const tags = [
    {
        "name": firstTagName,
        "value": firstTagValue
    },
    {
        "name": secondTagName,
        "value": secondTagValue
    },
    {
        "name": contentTypeStandardTagName,
        "value": contentTypeStandardTagValue
    }
]

const tagsBase64Encoded = Buffer.from(JSON.stringify(tags)).toString('base64');

const APS_response_with_tags = {
    "id": regex(FILE_ID_REGEXP),
    "mimeType": 'text/plain',
    "sizeInBytes": gt(0),
    "cloud": {
        uri: regex(FILE_ID_REGEXP),
        url: regex(FILE_URL_REGEXP)
    },
    "tx": {
        "id": regex(TX_ID_REGEXP),
        "status": "scheduled",
        "tags": tags,
        "statusUrl": regex(FILE_STATUS_URL_REGEXP),
        "gatewayUrl": regex(GATEWAY_URL_REGEXP),
        "arioGatewayUrl": regex(ARIO_GATEAY_URL_REGEXP),
        "viewblockUrl": regex(VIEWBLOCK_URL_REGEXP),
        "infoUrl": DOCS_URL,
        "info": INFO_TEXT
    }
}

const ACS_response = {
    "id": regex(FILE_ID_REGEXP),
    "mimeType": 'text/plain',
    "sizeInBytes": gt(0),
    "cloud": {
        uri: regex(FILE_ID_REGEXP),
        url: regex(FILE_URL_REGEXP)
    }
}

describe('Files endpoint', () => {
    before(async () => {
        request.setDefaultTimeout(20000);
        request.setBaseUrl(process.env.BASE_URL as string);
    });


    it('should return 401 uploading file without authorization', async () => {
        await spec()
            .post('/files')
            .withFile('./tests/data/1b.txt')
            .expectStatus(401);
    });

    it('should return 401 uploading file with invalid api key', async () => {
        await spec()
            .post('/files')
            .withHeaders({ 'api-key': 'invalid' })
            .withFile('./tests/data/1b.txt')
            .expectStatus(401);
    });

    it('should return 201 uploading file with valid api key', async () => {
        await spec()
            .post('/files')
            .withHeaders({ 'api-key': process.env.API_KEY })
            .withFile('./tests/data/1b.txt')
            .expectStatus(201)
            .expectJsonSchema({
                type: 'object',
            });
    });

    it('should return 201 uploading file to APS (Akord Permanent Storage) with tags in query', async () => {
        await spec()
            .post('/files')
            .withQueryParams({ [`tag-${firstTagName}`]: firstTagValue, [`Tag-${secondTagName}`]: secondTagValue, [`Tag-${contentTypeStandardTagName}`]: contentTypeStandardTagValue })
            .withHeaders({
                'api-key': process.env.API_KEY
            })
            .withFile('./tests/data/1b.txt')
            .expectStatus(201)
            .expectJsonMatch(APS_response_with_tags)
    });

    it('should return 201 uploading file to APS (Akord Permanent Storage) with encoded tags in query', async () => {
        await spec()
            .post('/files')
            .withQueryParams({ tags: tagsBase64Encoded })
            .withHeaders({
                'api-key': process.env.API_KEY
            })
            .withFile('./tests/data/1b.txt')
            .expectStatus(201)
            .expectJsonMatch(APS_response_with_tags)
    });

    it('should return 201 uploading file to APS (Akord Permanent Storage) with encoded tags in header', async () => {
        await spec()
            .post('/files')
            .withHeaders({
                'api-key': process.env.API_KEY,
                'tags': tagsBase64Encoded
            })
            .withFile('./tests/data/1b.txt')
            .expectStatus(201)
            .expectJsonMatch(APS_response_with_tags)
    });

    it('should return 201 when uploading file to ACS (Akord Cloud Storage)', async () => {
        await spec()
            .post('/files')
            .withQueryParams({ tags: tagsBase64Encoded })
            .withHeaders({
                'api-key': process.env.API_KEY
            })
            .withFile('./tests/data/1b.txt')
            .expectStatus(201)
            .expectJsonMatch(ACS_response)
    });
});