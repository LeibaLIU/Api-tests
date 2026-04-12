import { test as base } from '@playwright/test';

export const test = base.extend({
	token: async ({ request }, use) => {
		const response = await request.post('/challenger');
		const headers = response.headers();
		const token = headers['x-challenger'];
		await use(token);
	},
});
