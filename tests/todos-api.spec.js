import { test } from '../src/helpers/fixtures/fixture';
import { expect } from '@playwright/test';
import { TodoBuilder } from '../src/helpers/builders/index';

test('@GET получить список всех todos', async ({ request, token }) => {
	const response = await request.get('/todos', {
		headers: { 'X-CHALLENGER': token },
	});

	expect(response.status()).toEqual(200);

	const body = await response.json();

	expect(Array.isArray(body.todos)).toBe(true);
	expect(body.todos.length).toBeGreaterThan(0);

	const todo = body.todos[0];
	expect(typeof todo.id).toBe('number');
	expect(typeof todo.title).toBe('string');
	expect(todo.title.length).toBeGreaterThan(0);
	expect(typeof todo.doneStatus).toBe('boolean');
});

test('@GET получить todo по ID', async ({ request, token }) => {
	const payload = new TodoBuilder()
		.withTitle('Todo for GET by ID')
		.withDoneStatus(false)
		.withDescription('test')
		.build();

	const created = await request.post('/todos', {
		headers: { 'X-CHALLENGER': token },
		data: payload,
	});
	const { id } = await created.json();

	const response = await request.get(`/todos/${id}`, {
		headers: { 'X-CHALLENGER': token },
	});

	expect(response.status()).toEqual(200);

	const body = await response.json();

	expect(body.todos[0].id).toEqual(id);
	expect(body.todos[0].title).toEqual(payload.title);
	expect(body.todos[0].doneStatus).toEqual(payload.doneStatus);
	expect(body.todos[0].description).toEqual(payload.description);
});

test('@POST создать новый todo', async ({ request, token }) => {
	const payload = new TodoBuilder()
		.withTitle('Buy groceries')
		.withDoneStatus(false)
		.withDescription('Milk, bread, eggs')
		.build();

	const response = await request.post('/todos', {
		headers: { 'X-CHALLENGER': token },
		data: payload,
	});

	expect(response.status()).toEqual(201);

	const todo = await response.json();

	expect(todo.id).toBeTruthy();
	expect(todo.title).toEqual(payload.title);
	expect(todo.doneStatus).toEqual(payload.doneStatus);
	expect(todo.description).toEqual(payload.description);
});

test('@POST нельзя создать todo без title', async ({ request, token }) => {
	const response = await request.post('/todos', {
		headers: { 'X-CHALLENGER': token },
		data: { doneStatus: false, description: 'No title here' },
	});

	expect(response.status()).toEqual(400);

	const body = await response.json();

	expect(body.errorMessages).toBeDefined();
	expect(body.errorMessages.length).toBeGreaterThan(0);
});

test('@DELETE удалить todo по ID', async ({ request, token }) => {
	const payload = new TodoBuilder()
		.withTitle('Todo to delete')
		.withDoneStatus(false)
		.build();

	const created = await request.post('/todos', {
		headers: { 'X-CHALLENGER': token },
		data: payload,
	});
	const { id } = await created.json();

	const deleteResponse = await request.delete(`/todos/${id}`, {
		headers: { 'X-CHALLENGER': token },
	});

	expect(deleteResponse.status()).toEqual(200);

	const getResponse = await request.get(`/todos/${id}`, {
		headers: { 'X-CHALLENGER': token },
	});
	expect(getResponse.status()).toEqual(404);
});

test('@DELETE несуществующего todo возвращает 404', async ({ request, token }) => {
	const response = await request.delete('/todos/999999', {
		headers: { 'X-CHALLENGER': token },
	});

	expect(response.status()).toEqual(404);
});
