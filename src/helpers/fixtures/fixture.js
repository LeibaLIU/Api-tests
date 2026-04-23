import { test as base } from '@playwright/test';
import { Api } from '../../services/api.service';
import fs from 'fs';

const getToken = () => {
	return JSON.parse(fs.readFileSync('auth.json', 'utf-8')).token;
};

export const test = base.extend({
	token: async ({}, use) => {
		await use(getToken());
	},

	// Facade fixture — uses a single shared token created in globalSetup.
	// Cleans up todos created during each test to avoid the 20-todo limit.
	api: async ({ request }, use) => {
		const token = getToken();
		const api = new Api(request, token);

		// Snapshot todo IDs before the test
		const beforeResp = await api.todos.getAll();
		const beforeBody = await beforeResp.json();
		const initialIds = new Set(beforeBody.todos.map((t) => t.id));

		await use(api);

		// Teardown: delete any todos created during this test
		const afterResp = await api.todos.getAll();
		const afterBody = await afterResp.json();
		for (const todo of afterBody.todos) {
			if (!initialIds.has(todo.id)) {
				await api.todos.delete(todo.id);
			}
		}
	},
});
