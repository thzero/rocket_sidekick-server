import Constants from '../constants.js';

import Service from '@thzero/library_server/service/index.js';

class ChecklistsService extends Service {
	constructor() {
		super();

		this._repositoryChecklists = null;
		this._serviceUsers = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryChecklists = this._injector.getService(Constants.InjectorKeys.REPOSITORY_CHECKLISTS);
	}

	async listing(correlationId, params) {
		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistsParams, params);
		if (this._hasFailed(validationResponse))
			return validationResponse;

		return await this._repositoryChecklists.listing(correlationId, params);
	}

	async retrieve(correlationId, id) {
		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistsId, id);
		if (this._hasFailed(validationResponse))
			return validationResponse;

		return await this._repositoryChecklists.retrieve(correlationId, id);
	}
}

export default ChecklistsService;
