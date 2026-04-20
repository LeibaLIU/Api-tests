export class ChallengesService {
	constructor(request, token) {
		this.request = request;
		this.token = token;
	}

	get headers() {
		return { 'X-CHALLENGER': this.token };
	}

	async getAll() {
		return this.request.get('/challenges', { headers: this.headers });
	}
}
