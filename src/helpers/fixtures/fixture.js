import { test as base } from '@playwright/test';
import { Api } from '../../services/api.service';

export const test = base.extend({
	token: async ({ request }, use) => {
		let token = process.env.X_CHALLENGER_TOKEN;

		if (!token) {
			const response = await request.post('/challenger');
			const headers = response.headers();
			token = headers['x-challenger'];
		}

		await use(token);
	},

	// Facade fixture — each test gets its own fresh challenger session.
	// This guarantees full test isolation and safe parallel execution.
	api: async ({ request }, use) => {
		const response = await request.post('/challenger');
		const headers = response.headers();
		const token = headers['x-challenger'];

		const api = new Api(request, token);
		await use(api);
	},
});
