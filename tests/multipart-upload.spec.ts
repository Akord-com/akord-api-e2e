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

describe('Files API', () => {
    before(async () => {
        request.setDefaultTimeout(20000);
        request.setBaseUrl(process.env.BASE_URL as string);
    });

    it.skip('should upload file to ACS (Akord Cloud Storage) usnig multipart upload', async () => {
    });
});