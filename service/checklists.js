import Constants from '../constants.js';

import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

import AppService from './index.js';

class ChecklistsService extends AppService {
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

			const responseLookup = await this._repositoryChecklists.retrieveSecurity(correlationId, user.id, params.id);
			if (this._hasFailed(responseLookup))
				return responseLookup;

			if (!this._isDefault(correlationId, user, responseLookup.results) && !this._isPublic(correlationId, user, responseLookup.results)) {
				// SECURITY: Check is the owner
				if (!this._isOwner(correlationId, user, responseLookup.results))
					return this._securityErrorResponse(correlationId, 'ChecklistsService', 'copy');
			}
	
			const response = await this._repositoryChecklists.retrieve(correlationId, user.id, params.id);
			if (this._hasFailed(validationResponse))
				return response;
	
			const results = response.results;
			results.id = LibraryCommonUtility.generateId();
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

			const responseLookup = await this._repositoryChecklists.retrieveSecurity(correlationId, user.id, id);
			if (this._hasFailed(responseLookup))
				return responseLookup;

			if (this._isDefault(correlationId, user, responseLookup.results)) {
				// TODO: SECURITY: Check for admin if its a public
			}
			else {
				// SECURITY: Check is the owner
				if (!this._isOwner(correlationId, user, responseLookup.results))
					return this._securityErrorResponse(correlationId, 'ChecklistsService', 'delete');
			}
	
			return await this._repositoryChecklists.delete(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('ChecklistsService', 'delete', null, err, null, null, correlationId);
		}
	}

	async hasLaunch(correlationId, user, id) {
		this._enforceNotNull('ChecklistsService', 'hasLaunch', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.launchId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			return await this._repositoryChecklists.hasLaunch(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('ChecklistsService', 'hasLaunch', null, err, null, null, correlationId);
		}
	}

	async hasLocation(correlationId, user, id) {
		this._enforceNotNull('ChecklistsService', 'hasLocation', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.locationId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			return await this._repositoryChecklists.hasLocation(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('ChecklistsService', 'hasLocation', null, err, null, null, correlationId);
		}
	}

	async hasRocket(correlationId, user, id) {
		this._enforceNotNull('ChecklistsService', 'hasRocket', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			return await this._repositoryChecklists.hasRocket(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('ChecklistsService', 'hasRocket', null, err, null, null, correlationId);
		}
	}

	async hasRocketSetup(correlationId, user, id) {
		this._enforceNotNull('ChecklistsService', 'hasRocketSetup', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketSetupId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			return await this._repositoryChecklists.hasRocket(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('ChecklistsService', 'hasRocketSetup', null, err, null, null, correlationId);
		}
	}

	async refreshSearchName(correlationId) {
		return await this._repositoryChecklists.refreshSearchName(correlationId);
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

			const responseLookup = await this._repositoryChecklists.retrieveSecurity(correlationId, user.id, checklistUpdate.id);
			if (this._hasFailed(responseLookup))
				return responseLookup;

			if (this._isDefault(correlationId, user, responseLookup.results)) {
				// TODO: SECURITY: Check for admin if its a public
			}
			else {
				// SECURITY: Check is the owner
				if (!this._isOwner(correlationId, user, responseLookup.results))
					return this._securityErrorResponse(correlationId, 'ChecklistsService', 'update');
			}
	
			const fetchRespositoryResponse = await this._repositoryChecklists.retrieveUser(correlationId, user.id, checklistUpdate.id);
			if (this._hasFailed(fetchRespositoryResponse))
				return fetchRespositoryResponse;
	
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
