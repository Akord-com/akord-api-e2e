require('dotenv').config();
import { spec, request } from 'pactum';

const FILE_ID_REGEXP = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
const TX_ID_REGEXP = /[0-9a-zA-Z-]+$/i;

const GATEWAY_URL_REGEXP = /^https:\/\/akrd\.net\/[0-9a-zA-Z-]+$/i;
const ARIO_GATEAY_URL_REGEXP = /^https:\/\/arewaave\.net\/[0-9a-zA-Z-]+$/i;;
const VIEWBLOCK_URL_REGEXP = /^https:\/\/viewblock\.io\/arweave\/tx\/[0-9a-zA-Z-]+$/i;
const FILE_STATUS_URL_REGEXP = /^https:\/\/api\.akord\.com\/files\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/status$/i;
const FILE_URL_REGEXP = /^https:\/\/api\.akord\.com\/files\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const DOCS_URL = 'https://docs.akord.com/api-and-dev-tools/build/akord-api/files';
const INFO_TEXT = "Transaction is visible on the blockchain indexers when in the \"committed\" status.";

describe('Files API', () => {
    before(async () => {
        request.setDefaultTimeout(20000);
    });


    it('should return 401 uploading file without authorization', async () => {
        await spec()
            .post(`${process.env.BASE_URL}/files`)
            .withFile('./tests/data/1b.txt')
            .expectStatus(401);
    });

    it('should return 401 uploading file with invalid api key', async () => {
        await spec()
            .post(`${process.env.BASE_URL}/files`)
            .withHeaders({ 'api-key': 'invalid' })
            .withFile('./tests/data/1b.txt')
            .expectStatus(401);
    });

    it('should return 201 uploading file with valid api key', async () => {
        await spec()
            .post(`${process.env.BASE_URL}/files`)
            .withHeaders({ 'api-key': process.env.API_KEY })
            .withFile('./tests/data/1b.txt')
            .expectStatus(201)
            .expectJsonSchema({
                type: 'object',
            });
    });

    // in progress
    it.skip('should return 201 uploading file with valid api key with tags in query', async () => {
        const firstTagName = 'lowercase-tag-name';
        const firstTagValue = 'some tag';
        const secondTagName = 'Uppercase-Tag-Name';
        const secondTagValue = 'Other Tag';

        await spec()
            .post(`${process.env.BASE_URL}/files`)
            .withQueryParams({ [`tag-${firstTagName}`]: firstTagValue, [`Tag-${secondTagName}`]: secondTagValue })
            .withHeaders({ 
                'api-key': process.env.API_KEY
            })
            .withFile('./tests/data/1b.txt')
            .expectStatus(201)
            .expectJsonLike({
                id: FILE_ID_REGEXP,
                mime_type: 'text/plain',
                size_in_bytes: 437432,
                cloud: {
                    uri: FILE_ID_REGEXP,
                    url: FILE_URL_REGEXP,
                    requires_authorization: true
                },
                tx: {
                    id: TX_ID_REGEXP,
                    status: "scheduled",
                    tags: [
                        {
                            name: firstTagName,
                            value: firstTagValue
                        },
                        {
                            name: secondTagName,
                            value: secondTagValue
                        }
                    ],
                    status_url: FILE_STATUS_URL_REGEXP,
                    gateway_url: GATEWAY_URL_REGEXP,
                    ario_gateway_url: ARIO_GATEAY_URL_REGEXP,
                    viewblock_url: VIEWBLOCK_URL_REGEXP,
                    info_url: DOCS_URL,
                    info: INFO_TEXT
                }
            })
        });


        it('should return 404 when checking status of non existing file', async () => {
            await spec()
                .get(`${process.env.BASE_URL}/files/missing_file/status`)
                .expectStatus(404);
        });
    });