import { test } from '../src/helpers/fixtures/fixture';
import { expect } from '@playwright/test';
import { TodoBuilder } from '../src/helpers/builders/index';

// ─────────────────────────────────────────────
// GET /todos  (8 тестов)
// ─────────────────────────────────────────────

test('@GET получить список всех todos', async ({ api }) => {
	const response = await api.todos.getAll();

	expect(response.status()).toEqual(200);

	const body = await response.json();

	expect(Array.isArray(body.todos)).toBe(true);
	expect(body.todos.length).toBeGreaterThan(0);
});

test('@GET проверить структуру todo объекта', async ({ api }) => {
	const response = await api.todos.getAll();
	const body = await response.json();
	const todo = body.todos[0];

	expect(typeof todo.id).toBe('number');
	expect(typeof todo.title).toBe('string');
	expect(todo.title.length).toBeGreaterThan(0);
	expect(typeof todo.doneStatus).toBe('boolean');
	expect(typeof todo.description).toBe('string');
});

test('@GET получить todo по ID', async ({ api }) => {
	const payload = new TodoBuilder()
		.withTitle('Todo for GET by ID')
		.withDoneStatus(false)
		.withDescription('test description')
		.build();

	const created = await api.todos.create(payload);
	const { id } = await created.json();

	const response = await api.todos.getById(id);

	expect(response.status()).toEqual(200);

	const body = await response.json();

	expect(body.todos[0].id).toEqual(id);
	expect(body.todos[0].title).toEqual(payload.title);
	expect(body.todos[0].doneStatus).toEqual(payload.doneStatus);
	expect(body.todos[0].description).toEqual(payload.description);
});

test('@GET несуществующий todo возвращает 404', async ({ api }) => {
	const response = await api.todos.getById(999999);

	expect(response.status()).toEqual(404);
});

test('@GET фильтрация todos по doneStatus=true', async ({ api }) => {
	const payload = new TodoBuilder()
		.withTitle('Completed task filter')
		.withDoneStatus(true)
		.build();
	await api.todos.create(payload);

	const response = await api.todos.getAll({ doneStatus: true });

	expect(response.status()).toEqual(200);

	const body = await response.json();

	expect(body.todos.length).toBeGreaterThan(0);
	expect(body.todos.every((t) => t.doneStatus === true)).toBe(true);
});

test('@GET фильтрация todos по doneStatus=false', async ({ api }) => {
	const response = await api.todos.getAll({ doneStatus: false });

	expect(response.status()).toEqual(200);

	const body = await response.json();

	expect(body.todos.every((t) => t.doneStatus === false)).toBe(true);
});

test('@GET фильтрация todos по title', async ({ api }) => {
	const uniqueTitle = 'UniqueFilterTitle_XYZ_123';
	await api.todos.create({ title: uniqueTitle });

	const response = await api.todos.getAll({ title: uniqueTitle });

	expect(response.status()).toEqual(200);

	const body = await response.json();

	expect(body.todos.length).toBeGreaterThan(0);
	expect(body.todos.every((t) => t.title === uniqueTitle)).toBe(true);
});

test('@GET проверить Content-Type ответа', async ({ api }) => {
	const response = await api.todos.getAll();

	expect(response.status()).toEqual(200);
	expect(response.headers()['content-type']).toContain('application/json');
});

// ─────────────────────────────────────────────
// GET другие эндпоинты (2 теста)
// ─────────────────────────────────────────────

test('@GET список challenges', async ({ api }) => {
	const response = await api.challenges.getAll();

	expect(response.status()).toEqual(200);

	const body = await response.json();

	expect(Array.isArray(body.challenges)).toBe(true);
	expect(body.challenges.length).toBeGreaterThan(0);
});

test('@GET все todo id в списке уникальны', async ({ api }) => {
	const response = await api.todos.getAll();
	const body = await response.json();
	const ids = body.todos.map((t) => t.id);

	expect(new Set(ids).size).toEqual(ids.length);
});

// ─────────────────────────────────────────────
// HEAD /todos  (4 теста)
// ─────────────────────────────────────────────

test('@HEAD заголовки для списка todos', async ({ api }) => {
	const response = await api.todos.head();

	expect(response.status()).toEqual(200);
	expect(response.headers()['content-type']).toContain('application/json');
});

test('@HEAD заголовки для конкретного todo', async ({ api }) => {
	const payload = new TodoBuilder().withTitle('Todo for HEAD').build();
	const created = await api.todos.create(payload);
	const { id } = await created.json();

	const response = await api.todos.headById(id);

	expect(response.status()).toEqual(200);
});

test('@HEAD несуществующий todo возвращает 404', async ({ api }) => {
	const response = await api.todos.headById(999999);

	expect(response.status()).toEqual(404);
});

test('@HEAD проверить Content-Type заголовок', async ({ api }) => {
	const response = await api.todos.head();
	const headers = response.headers();

	expect(response.status()).toEqual(200);
	expect(headers['content-type']).toBeDefined();
	expect(headers['content-type']).toContain('application/json');
});

// ─────────────────────────────────────────────
// POST /todos  (13 тестов)
// ─────────────────────────────────────────────

test('@POST создать todo со всеми полями', async ({ api }) => {
	const payload = new TodoBuilder()
		.withTitle('Buy groceries')
		.withDoneStatus(false)
		.withDescription('Milk, bread, eggs')
		.build();

	const response = await api.todos.create(payload);

	expect(response.status()).toEqual(201);

	const todo = await response.json();

	expect(todo.id).toBeTruthy();
	expect(todo.title).toEqual(payload.title);
	expect(todo.doneStatus).toEqual(payload.doneStatus);
	expect(todo.description).toEqual(payload.description);
});

test('@POST создать todo только с title', async ({ api }) => {
	const response = await api.todos.create({ title: 'Minimal todo' });

	expect(response.status()).toEqual(201);

	const todo = await response.json();

	expect(todo.id).toBeTruthy();
	expect(todo.title).toEqual('Minimal todo');
	expect(todo.doneStatus).toEqual(false);
});

test('@POST нельзя создать todo без title', async ({ api }) => {
	const response = await api.todos.create({ doneStatus: false, description: 'No title here' });

	expect(response.status()).toEqual(400);

	const body = await response.json();

	expect(body.errorMessages).toBeDefined();
	expect(body.errorMessages.length).toBeGreaterThan(0);
});

test('@POST нельзя создать todo с пустым title', async ({ api }) => {
	const response = await api.todos.create({ title: '', doneStatus: false });

	expect(response.status()).toEqual(400);

	const body = await response.json();

	expect(body.errorMessages).toBeDefined();
});

test('@POST title длиннее 50 символов возвращает 400', async ({ api }) => {
	const response = await api.todos.create({ title: 'A'.repeat(51) });

	expect(response.status()).toEqual(400);

	const body = await response.json();

	expect(body.errorMessages).toBeDefined();
	expect(body.errorMessages.length).toBeGreaterThan(0);
});

test('@POST description длиннее 200 символов возвращает 400', async ({ api }) => {
	const payload = new TodoBuilder()
		.withTitle('Valid title')
		.withDescription('D'.repeat(201))
		.build();

	const response = await api.todos.create(payload);

	expect(response.status()).toEqual(400);

	const body = await response.json();

	expect(body.errorMessages).toBeDefined();
	expect(body.errorMessages.length).toBeGreaterThan(0);
});

test('@POST создать todo с doneStatus=true', async ({ api }) => {
	const payload = new TodoBuilder()
		.withTitle('Already done task')
		.withDoneStatus(true)
		.build();

	const response = await api.todos.create(payload);

	expect(response.status()).toEqual(201);

	const todo = await response.json();

	expect(todo.doneStatus).toBe(true);
});

test('@POST невалидный тип doneStatus возвращает 400', async ({ api }) => {
	const response = await api.todos.create({ title: 'Test todo', doneStatus: 'yes' });

	expect(response.status()).toEqual(400);

	const body = await response.json();

	expect(body.errorMessages).toBeDefined();
	expect(body.errorMessages.length).toBeGreaterThan(0);
});

test('@POST создать todo с пустым description', async ({ api }) => {
	const payload = new TodoBuilder()
		.withTitle('No description todo')
		.withDescription('')
		.build();

	const response = await api.todos.create(payload);

	expect(response.status()).toEqual(201);

	const todo = await response.json();

	expect(todo.title).toEqual(payload.title);
	expect(todo.description).toEqual('');
});

test('@POST title ровно 50 символов — граничное значение', async ({ api }) => {
	const title = 'A'.repeat(50);
	const response = await api.todos.create({ title });

	expect(response.status()).toEqual(201);

	const todo = await response.json();

	expect(todo.title.length).toEqual(50);
});

test('@POST description ровно 200 символов — граничное значение', async ({ api }) => {
	const description = 'D'.repeat(200);
	const payload = new TodoBuilder()
		.withTitle('Boundary desc test')
		.withDescription(description)
		.build();

	const response = await api.todos.create(payload);

	expect(response.status()).toEqual(201);

	const todo = await response.json();

	expect(todo.description.length).toEqual(200);
});

test('@POST передать id в теле запроса возвращает 400', async ({ api }) => {
	const response = await api.todos.create({ id: 1, title: 'Todo with id in body' });

	expect(response.status()).toEqual(400);

	const body = await response.json();

	expect(body.errorMessages).toBeDefined();
});

test('@POST новый todo появляется в GET списке', async ({ api }) => {
	const uniqueTitle = 'Appears In List Test';
	const created = await api.todos.create({ title: uniqueTitle });
	const { id } = await created.json();

	const listResponse = await api.todos.getAll();
	const body = await listResponse.json();

	const found = body.todos.find((t) => t.id === id);

	expect(found).toBeDefined();
	expect(found.title).toEqual(uniqueTitle);
});

// ─────────────────────────────────────────────
// POST /todos/:id  (7 тестов)
// ─────────────────────────────────────────────

test('@POST изменить title существующего todo', async ({ api }) => {
	const payload = new TodoBuilder().withTitle('Original title').build();
	const created = await api.todos.create(payload);
	const { id } = await created.json();

	const response = await api.todos.amend(id, { title: 'Updated title' });

	expect(response.status()).toEqual(200);

	const todo = await response.json();

	expect(todo.title).toEqual('Updated title');
	expect(todo.id).toEqual(id);
});

test('@POST изменить doneStatus существующего todo', async ({ api }) => {
	const payload = new TodoBuilder().withTitle('Status test').withDoneStatus(false).build();
	const created = await api.todos.create(payload);
	const { id } = await created.json();

	const response = await api.todos.amend(id, { doneStatus: true });

	expect(response.status()).toEqual(200);

	const todo = await response.json();

	expect(todo.doneStatus).toBe(true);
});

test('@POST изменить description существующего todo', async ({ api }) => {
	const payload = new TodoBuilder().withTitle('Desc test').withDescription('Old desc').build();
	const created = await api.todos.create(payload);
	const { id } = await created.json();

	const response = await api.todos.amend(id, { description: 'New desc' });

	expect(response.status()).toEqual(200);

	const todo = await response.json();

	expect(todo.description).toEqual('New desc');
});

test('@POST изменить несуществующий todo возвращает 404', async ({ api }) => {
	const response = await api.todos.amend(999999, { title: 'Ghost' });

	expect(response.status()).toEqual(404);
});

test('@POST изменить todo с невалидным doneStatus возвращает 400', async ({ api }) => {
	const payload = new TodoBuilder().withTitle('Amend doneStatus test').build();
	const created = await api.todos.create(payload);
	const { id } = await created.json();

	const response = await api.todos.amend(id, { doneStatus: 'not-a-bool' });

	expect(response.status()).toEqual(400);

	const body = await response.json();

	expect(body.errorMessages).toBeDefined();
});

test('@POST изменить todo с title длиннее 50 символов возвращает 400', async ({ api }) => {
	const payload = new TodoBuilder().withTitle('Amend long title test').build();
	const created = await api.todos.create(payload);
	const { id } = await created.json();

	const response = await api.todos.amend(id, { title: 'T'.repeat(51) });

	expect(response.status()).toEqual(400);

	const body = await response.json();

	expect(body.errorMessages).toBeDefined();
});

test('@POST частичное обновление сохраняет остальные поля', async ({ api }) => {
	const payload = new TodoBuilder()
		.withTitle('Original title')
		.withDoneStatus(true)
		.withDescription('Original desc')
		.build();
	const created = await api.todos.create(payload);
	const { id } = await created.json();

	const response = await api.todos.amend(id, { title: 'Only title changed' });

	expect(response.status()).toEqual(200);

	const todo = await response.json();

	expect(todo.title).toEqual('Only title changed');
	expect(todo.doneStatus).toEqual(true);
	expect(todo.description).toEqual('Original desc');
});

// ─────────────────────────────────────────────
// PUT /todos/:id  (4 теста)
// ─────────────────────────────────────────────

test('@PUT полностью заменить todo', async ({ api }) => {
	const original = new TodoBuilder().withTitle('Original').withDoneStatus(false).build();
	const created = await api.todos.create(original);
	const { id } = await created.json();

	const updated = new TodoBuilder()
		.withTitle('Replaced title')
		.withDoneStatus(true)
		.withDescription('Brand new description')
		.build();

	const response = await api.todos.update(id, updated);

	expect(response.status()).toEqual(200);

	const todo = await response.json();

	expect(todo.title).toEqual(updated.title);
	expect(todo.doneStatus).toEqual(updated.doneStatus);
	expect(todo.description).toEqual(updated.description);
});

test('@PUT без обязательного поля title возвращает 400', async ({ api }) => {
	const original = new TodoBuilder().withTitle('To be replaced').build();
	const created = await api.todos.create(original);
	const { id } = await created.json();

	const response = await api.todos.update(id, { doneStatus: true, description: 'No title' });

	expect(response.status()).toEqual(400);

	const body = await response.json();

	expect(body.errorMessages).toBeDefined();
});

test('@PUT несуществующий todo возвращает 400', async ({ api }) => {
	const payload = new TodoBuilder().withTitle('Ghost todo').build();
	const response = await api.todos.update(999999, payload);

	expect(response.status()).toEqual(400);
});

test('@PUT заменить todo с doneStatus=true', async ({ api }) => {
	const original = new TodoBuilder().withTitle('Original false').withDoneStatus(false).build();
	const created = await api.todos.create(original);
	const { id } = await created.json();

	const replacement = new TodoBuilder()
		.withTitle('Now done')
		.withDoneStatus(true)
		.build();

	const response = await api.todos.update(id, replacement);

	expect(response.status()).toEqual(200);

	const todo = await response.json();

	expect(todo.doneStatus).toBe(true);
	expect(todo.title).toEqual('Now done');
});

// ─────────────────────────────────────────────
// PATCH /todos/:id  (1 тест)
// ─────────────────────────────────────────────

test('@PATCH метод не поддерживается возвращает 405', async ({ api }) => {
	const payload = new TodoBuilder().withTitle('To be patched').build();
	const created = await api.todos.create(payload);
	const { id } = await created.json();

	const response = await api.todos.patch(id, { title: 'Patched' });

	expect(response.status()).toEqual(405);
});

// ─────────────────────────────────────────────
// DELETE /todos/:id  (4 теста)
// ─────────────────────────────────────────────

test('@DELETE удалить todo по ID', async ({ api }) => {
	const payload = new TodoBuilder().withTitle('Todo to delete').withDoneStatus(false).build();
	const created = await api.todos.create(payload);
	const { id } = await created.json();

	const response = await api.todos.delete(id);

	expect(response.status()).toEqual(200);
});

test('@DELETE после удаления todo недоступен', async ({ api }) => {
	const payload = new TodoBuilder().withTitle('Verify deleted').build();
	const created = await api.todos.create(payload);
	const { id } = await created.json();

	await api.todos.delete(id);

	const getResponse = await api.todos.getById(id);

	expect(getResponse.status()).toEqual(404);
});

test('@DELETE несуществующего todo возвращает 404', async ({ api }) => {
	const response = await api.todos.delete(999999);

	expect(response.status()).toEqual(404);
});

test('@DELETE повторное удаление того же todo возвращает 404', async ({ api }) => {
	const payload = new TodoBuilder().withTitle('Double delete test').build();
	const created = await api.todos.create(payload);
	const { id } = await created.json();

	await api.todos.delete(id);

	const secondDelete = await api.todos.delete(id);

	expect(secondDelete.status()).toEqual(404);
});

// ─────────────────────────────────────────────
// OPTIONS  (2 теста)
// ─────────────────────────────────────────────

test('@OPTIONS /todos возвращает список поддерживаемых методов', async ({ api }) => {
	const response = await api.todos.options();

	expect(response.status()).toEqual(200);

	const allowHeader = response.headers()['allow'];

	expect(allowHeader).toBeDefined();
	expect(allowHeader).toContain('GET');
});

test('@OPTIONS /todos/:id возвращает список поддерживаемых методов', async ({ api }) => {
	const payload = new TodoBuilder().withTitle('Options by id test').build();
	const created = await api.todos.create(payload);
	const { id } = await created.json();

	const response = await api.todos.optionsById(id);

	expect([200, 204]).toContain(response.status());

	const allowHeader = response.headers()['allow'];

	expect(allowHeader).toBeDefined();
	expect(allowHeader).toContain('GET');
});
