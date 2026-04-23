export class TodoBuilder {
	constructor() {
		this.data = {
			title: 'Default Todo',
			doneStatus: false,
			description: '',
		};
	}

	withTitle(title) {
		this.data.title = title;
		return this;
	}

	withDoneStatus(status) {
		this.data.doneStatus = status;
		return this;
	}

	withDescription(description) {
		this.data.description = description;
		return this;
	}

	build() {
		return { ...this.data };
	}
}
