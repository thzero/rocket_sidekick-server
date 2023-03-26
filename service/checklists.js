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

	async listing(correlationId, user, params) {
		this._enforceNotNull('ChecklistsService', 'retrieveUser', 'user', user, correlationId);

		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistsParams, params);
		if (this._hasFailed(validationResponse))
			return validationResponse;

		return await this._repositoryChecklists.listing(correlationId, user.id, params);
	}

	async retrieve(correlationId, user, id) {
		this._enforceNotNull('ChecklistsService', 'retrieveUser', 'user', user, correlationId);

		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistsId, id);
		if (this._hasFailed(validationResponse))
			return validationResponse;

		return await this._repositoryChecklists.retrieve(correlationId, user.id, id);
	}
}

export default ChecklistsService;
