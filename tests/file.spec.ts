require('dotenv').config();
import { spec, request } from 'pactum';

describe('Files API', () => {
	before(async () => {
		request.setDefaultTimeout(10000);
	});

    it('should return 401 uploading file without authorization', async () => {
		const resp = await spec()
			.post(`${process.env.BASE_URL}/files`)
            .withBody({ path: 'tests/data/1b.txt' })
			.expectStatus(401);
	});

	it('should return 404 when checking status of non existing file', async () => {
		const resp = await spec()
			.get(`${process.env.BASE_URL}/files/missing_file/status`)
			.expectStatus(404);
	});
});