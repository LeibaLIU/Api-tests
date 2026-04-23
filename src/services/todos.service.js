export class TodosService {
	constructor(request, token) {
		this.request = request;
		this.token = token;
	}

	get headers() {
		return { 'X-CHALLENGER': this.token };
	}

	async getAll(params) {
		return this.request.get('/todos', { headers: this.headers, params });
	}

	async getById(id) {
		return this.request.get(`/todos/${id}`, { headers: this.headers });
	}

	async create(data) {
		return this.request.post('/todos', { headers: this.headers, data });
	}

	async amend(id, data) {
		return this.request.post(`/todos/${id}`, { headers: this.headers, data });
	}

	async update(id, data) {
		return this.request.put(`/todos/${id}`, { headers: this.headers, data });
	}

	async patch(id, data) {
		return this.request.patch(`/todos/${id}`, { headers: this.headers, data });
	}

	async delete(id) {
		return this.request.delete(`/todos/${id}`, { headers: this.headers });
	}

	async head() {
		return this.request.head('/todos', { headers: this.headers });
	}

	async headById(id) {
		return this.request.head(`/todos/${id}`, { headers: this.headers });
	}

	async options() {
		return this.request.fetch('/todos', { method: 'OPTIONS', headers: this.headers });
	}

	async optionsById(id) {
		return this.request.fetch(`/todos/${id}`, { method: 'OPTIONS', headers: this.headers });
	}
}
