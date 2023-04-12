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

	async listingShared(correlationId, user, params) {
		this._enforceNotNull('ChecklistsService', 'retrieveUser', 'user', user, correlationId);

		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistsParams, params);
		if (this._hasFailed(validationResponse))
			return validationResponse;

		return await this._repositoryChecklists.listingShared(correlationId, user.id, params);
	}

	async listingUser(correlationId, user, params) {
		this._enforceNotNull('ChecklistsService', 'listingUser', 'user', user, correlationId);
		
		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistsParams, params);
		if (this._hasFailed(validationResponse))
			return validationResponse;

		return await this._repositoryChecklists.listingUser(correlationId, user.id, params);
	}

	async retrieveShared(correlationId, user, id) {
		this._enforceNotNull('ChecklistsService', 'retrieveShared', 'user', user, correlationId);

		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistId, id);
		if (this._hasFailed(validationResponse))
			return validationResponse;

		return await this._repositoryChecklists.retrieveShared(correlationId, user.id, id);
	}

	async retrieveUser(correlationId, user, id) {
		this._enforceNotNull('ChecklistsService', 'retrieveUser', 'user', user, correlationId);

		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistId, id);
		if (this._hasFailed(validationResponse))
			return validationResponse;

		return await this._repositoryChecklists.retrieveUser(correlationId, user.id, id);
	}

	async updateUser(correlationId, user, checklistUpdate) {
		const validationResponse = this._validateUser(correlationId, user);
		if (this._hasFailed(validationResponse))
			return validationResponse;
			
		const validationChecklistResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklist, checklistUpdate);
		if (this._hasFailed(validationChecklistResponse))
			return validationChecklistResponse;

		const fetchRespositoryResponse = await this._repositoryChecklists.retrieveUser(correlationId, user.id, checklistUpdate.id);
		if (this._hasFailed(fetchRespositoryResponse))
			return fetchRespositoryResponse;

		const checklist = fetchRespositoryResponse.results;

		if (!checklist) {
			const validResponse = this._checkUpdatedTimestamp(correlationId, checklistUpdate, checklist, 'checklist');
			if (this._hasFailed(validResponse))
				return validResponse;
		}
		
		const respositoryResponse = await this._repositoryChecklists.updateUser(correlationId, user.id, checklistUpdate);
		return respositoryResponse;
	}
}

export default ChecklistsService;
