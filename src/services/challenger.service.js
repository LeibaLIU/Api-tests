export class ChallengerService {
	constructor(request) {
		this.request = request;
	}

	async post() {
		const response = await this.request.post('/challenger');
		const headers = response.headers();
		return headers['x-challenger'];
	}
}
