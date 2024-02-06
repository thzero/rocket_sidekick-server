import AppConstants from '../constants.js';

import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

import AppService from './index.js';

class RocketsService extends AppService {
	constructor() {
		super();

		this._repositoryRockets = null;
		this._serviceUsers = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryRockets = this._injector.getService(AppConstants.InjectorKeys.REPOSITORY_ROCKETS);
		
		this._serviceChecklists = this._injector.getService(AppConstants.InjectorKeys.SERVICE_CHECKLISTS);
		this._serviceLaunches = this._injector.getService(AppConstants.InjectorKeys.SERVICE_LAUNCHES);
	}

	async copy(correlationId, user, params) {
		this._enforceNotNull('RocketsService', 'copy', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketsCopyParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			const responseLookup = await this._repositoryRockets.retrieveSecurity(correlationId, user.id, params.id);
			if (this._hasFailed(responseLookup))
				return responseLookup;
			
			// SECURITY: Check is the owner
			if (!this._isOwner(correlationId, user, responseLookup.results))
				return this._securityErrorResponse(correlationId, 'RocketsService', 'copy');
	
			const response = await this._repositoryRockets.retrieve(correlationId, user.id, params.id);
			if (this._hasFailed(validationResponse))
				return response;
	
			const results = response.results;
			results.id = LibraryCommonUtility.generateId();
			delete results.createdTimestamp;
			delete results.createdUserId;
			delete results.updatedTimestamp;
			delete results.updatedUserId;
			results.public = false;
			results.name = params.name;
	
			return await this._repositoryRockets.update(correlationId, user.id, results);
		}
		catch (err) {
			return this._error('RocketsService', 'copy', null, err, null, null, correlationId);
		}
	}

	async delete(correlationId, user, id) {
		this._enforceNotNull('RocketsService', 'delete', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			const responseLookup = await this._repositoryLaunches.retrieveSecurity(correlationId, user.id, id);
			if (this._hasFailed(responseLookup))
				return responseLookup;
			
			// SECURITY: Check is the owner
			if (!this._isOwner(correlationId, user, responseLookup.results))
				return this._securityErrorResponse(correlationId, 'RocketsService', 'delete');

			// See if its used in a checklist
			const checklistResponse = this._serviceChecklists.hasRocket(correlationId, user, id);
			if (this._hasFailed(checklistResponse))
				return checklistResponse;
			// See if its used in a launch
			const launchResponse = this._serviceLaunches.hasRocket(correlationId, user, id);
			if (this._hasFailed(launchResponse))
				return launchResponse;
	
			return await this._repositoryRockets.delete(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('RocketsService', 'delete', null, err, null, null, correlationId);
		}
	}

	async hasPart(correlationId, user, id) {
		this._enforceNotNull('RocketsService', 'hasPart', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.partId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			return await this._repositoryRockets.hasPart(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('RocketsService', 'hasPart', null, err, null, null, correlationId);
		}
	}

	async refreshSearchName(correlationId) {
		return await this._repositoryRockets.refreshSearchName(correlationId);
	}

	async retrieve(correlationId, user, id) {
		this._enforceNotNull('RocketsService', 'retrieve', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryRockets.retrieve(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('RocketsService', 'retrieve', null, err, null, null, correlationId);
		}
	}

	async retrieveGallery(correlationId, id) {
		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryRockets.retrieveGallery(correlationId, id);
		}
		catch (err) {
			return this._error('RocketsService', 'retrieveGallery', null, err, null, null, correlationId);
		}
	}

	async search(correlationId, user, params) {
		this._enforceNotNull('RocketsService', 'search', 'user', user, correlationId);
		
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketsParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryRockets.search(correlationId, user.id, params);
		}
		catch (err) {
			return this._error('RocketsService', 'search', null, err, null, null, correlationId);
		}
	}

	async searchGallery(correlationId, params) {
		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketsParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryRockets.searchGallery(correlationId, params);
		}
		catch (err) {
			return this._error('RocketsService', 'searchGallery', null, err, null, null, correlationId);
		}
	}

	async update(correlationId, user, rocketUpdate) {
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationChecklistResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocket, rocketUpdate);
			if (this._hasFailed(validationChecklistResponse))
				return validationChecklistResponse;
	
			const fetchRespositoryResponse = await this._repositoryRockets.retrieve(correlationId, user.id, rocketUpdate.id);
			if (this._hasFailed(fetchRespositoryResponse))
				return fetchRespositoryResponse;

			// SECURITY: Check is the owner
			if (!this._isOwner(correlationId, user, fetchRespositoryResponse.results))
				return this._securityErrorResponse(correlationId, 'RocketsService', 'update');
	
			const rocket = fetchRespositoryResponse.results;
			if (!rocket) {
				const validResponse = this._checkUpdatedTimestamp(correlationId, rocketUpdate, rocket, 'rocket');
				if (this._hasFailed(validResponse))
					return validResponse;
			}
			
			return await this._repositoryRockets.update(correlationId, user.id, rocketUpdate);
		}
		catch (err) {
			return this._error('RocketsService', 'update', null, err, null, null, correlationId);
		}
	}
}

export default RocketsService;
