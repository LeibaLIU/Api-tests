import { ChallengerService } from './challenger.service';
import { TodosService } from './todos.service';
import { ChallengesService } from './challenges.service';

// Facade — encapsulates all service controllers behind a single API object
export class Api {
	constructor(request, token) {
		this.challenger = new ChallengerService(request);
		this.todos = new TodosService(request, token);
		this.challenges = new ChallengesService(request, token);
	}
}
