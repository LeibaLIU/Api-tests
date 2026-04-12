import { test as base } from '@playwright/test';

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
});
