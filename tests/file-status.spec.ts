require('dotenv').config();
import { spec, request } from 'pactum';

describe('Files status endpoint', () => {
    before(async () => {
        request.setDefaultTimeout(20000);
        request.setBaseUrl(process.env.BASE_URL as string);
    });

    it('should return 401 uploading file without authorization', async () => {
        await spec()
            .get('/files')
            .expectStatus(401);
    });

    it('should return 401 uploading file with invalid api key', async () => {
        await spec()
            .get('/files/missing_file/status')
            .withHeaders({ 'api-key': 'invalid' })
            .expectStatus(401);
    });

    it('should return 404 uploading file without authorization', async () => {
        await spec()
            .get('/files/missing_file/status')
            .withHeaders({ 'api-key': process.env.API_KEY })
            .expectStatus(404);
    });
});