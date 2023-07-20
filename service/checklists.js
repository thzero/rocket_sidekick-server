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
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistCopyParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			const response = await this._repositoryChecklists.retrieve(correlationId, user.id, params.id);
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

	async delete(correlationId, user, id) {
		this._enforceNotNull('ChecklistsService', 'delete', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			// TODO: SECURITY: Check for admin if its a default otherwise is the owner
	
			return await this._repositoryChecklists.delete(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('ChecklistsService', 'delete', null, err, null, null, correlationId);
		}
	}

	async retrieve(correlationId, user, id) {
		this._enforceNotNull('ChecklistsService', 'retrieve', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryChecklists.retrieve(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('ChecklistsService', 'retrieve', null, err, null, null, correlationId);
		}
	}

	async search(correlationId, user, params) {
		this._enforceNotNull('ChecklistsService', 'search', 'user', user, correlationId);
		
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklistsParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryChecklists.search(correlationId, user.id, params);
		}
		catch (err) {
			return this._error('ChecklistsService', 'search', null, err, null, null, correlationId);
		}
	}

	async update(correlationId, user, checklistUpdate) {
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationChecklistResponse = this._serviceValidation.check(correlationId, this._serviceValidation.checklist, checklistUpdate);
			if (this._hasFailed(validationChecklistResponse))
				return validationChecklistResponse;
	
			const fetchRespositoryResponse = await this._repositoryChecklists.retrieveUser(correlationId, user.id, checklistUpdate.id);
			if (this._hasFailed(fetchRespositoryResponse))
				return fetchRespositoryResponse;

			// TODO: SECURITY: Check for admin if its a default otherwise is the owner
	
			const checklist = fetchRespositoryResponse.results;
			if (!checklist) {
				const validResponse = this._checkUpdatedTimestamp(correlationId, checklistUpdate, checklist, 'checklist');
				if (this._hasFailed(validResponse))
					return validResponse;
			}
			
			return await this._repositoryChecklists.update(correlationId, user.id, checklistUpdate);
		}
		catch (err) {
			return this._error('ChecklistsService', 'update', null, err, null, null, correlationId);
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
