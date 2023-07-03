import Constants from '../constants.js';

import Utility from '@thzero/library_common/utility/index.js';

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

	async copy(correlationId, user, params) {
		this._enforceNotNull('ChecklistsService', 'copy', 'user', user, correlationId);

		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistCopyParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			const response = await this._repositoryChecklists.retrieveUser(correlationId, user.id, params.id);
			if (this._hasFailed(validationResponse))
				return response;
	
			const results = response.results;
			results.id = Utility.generateId();
			delete results.createdTimestamp;
			delete results.createdUserId;
			delete results.updatedTimestamp;
			delete results.updatedUserId;
			results.isDefault = false;
			this._clearChecklist(correlationId, results);
			results.name = params.name;
	
			return await this._repositoryChecklists.updateUser(correlationId, user.id, results);
		}
		catch (err) {
			return this._error('ChecklistsService', 'copy', null, err, null, null, correlationId);
		}
	}

	async deleteUser(correlationId, user, id) {
		this._enforceNotNull('ChecklistsService', 'deleteUser', 'user', user, correlationId);

		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryChecklists.deleteUser(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('ChecklistsService', 'deleteUser', null, err, null, null, correlationId);
		}
	}

	async listingShared(correlationId, user, params) {
		this._enforceNotNull('ChecklistsService', 'listingShared', 'user', user, correlationId);

		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistsParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryChecklists.listingShared(correlationId, user.id, params);
		}
		catch (err) {
			return this._error('ChecklistsService', 'listingShared', null, err, null, null, correlationId);
		}
	}

	async listingUser(correlationId, user, params) {
		this._enforceNotNull('ChecklistsService', 'listingUser', 'user', user, correlationId);
		
		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistsParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryChecklists.listingUser(correlationId, user.id, params);
		}
		catch (err) {
			return this._error('ChecklistsService', 'listingUser', null, err, null, null, correlationId);
		}
	}

	async retrieveShared(correlationId, user, id) {
		this._enforceNotNull('ChecklistsService', 'retrieveShared', 'user', user, correlationId);

		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryChecklists.retrieveShared(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('ChecklistsService', 'retrieveShared', null, err, null, null, correlationId);
		}
	}

	async retrieveUser(correlationId, user, id) {
		this._enforceNotNull('ChecklistsService', 'retrieveUser', 'user', user, correlationId);

		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryChecklists.retrieveUser(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('ChecklistsService', 'retrieveUser', null, err, null, null, correlationId);
		}
	}

	async updateUser(correlationId, user, checklistUpdate) {
		try {
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
			
			return await this._repositoryChecklists.updateUser(correlationId, user.id, checklistUpdate);
		}
		catch (err) {
			return this._error('ChecklistsService', 'updateUser', null, err, null, null, correlationId);
		}
	}

	_clearChecklist(correlationId, value) {
		for(let item in value.steps) {
			delete item.completed;
			delete item.completedTimestamp;
			delete item.completedUserId;

			this._clearChecklist(correlationId, item);
		}
	}
}

export default ChecklistsService;
