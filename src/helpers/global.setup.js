import { request } from '@playwright/test';
import fs from 'fs';

async function globalSetup() {
	const context = await request.newContext({
		baseURL: 'https://apichallenges.eviltester.com',
	});

	const response = await context.post('/challenger');
	const headers = response.headers();
	const token = headers['x-challenger'];

	fs.writeFileSync('auth.json', JSON.stringify({ token }));

	console.log(`\n✔ Challenger token: ${token}`);
	console.log(`✔ Progress: https://apichallenges.eviltester.com/gui/challenges/${token}\n`);

	await context.dispose();
}

export default globalSetup;
