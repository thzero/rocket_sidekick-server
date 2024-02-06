import AppConstants from '../constants.js';

import AppService from './index.js';

class LaunchesService extends AppService {
	constructor() {
		super();

		this._repositoryLaunches = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryLaunches = this._injector.getService(AppConstants.InjectorKeys.REPOSITORY_LAUNCHES);
		
		this._serviceChecklists = this._injector.getService(AppConstants.InjectorKeys.SERVICE_CHECKLISTS);
	}

	async delete(correlationId, user, id) {
		this._enforceNotNull('LaunchesService', 'delete', 'user', user, correlationId);

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
				return this._securityErrorResponse(correlationId, 'LaunchesService', 'delete');

			// See if its used in a checklist
			const checklistResponse = this._serviceChecklists.hasLaunch(correlationId, user, id);
			if (this._hasFailed(checklistResponse))
				return checklistResponse;
	
			return await this._repositoryLaunches.delete(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('LaunchesService', 'delete', null, err, null, null, correlationId);
		}
	}

	async hasLocation(correlationId, user, id) {
		this._enforceNotNull('LaunchesService', 'hasLaunch', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.locationId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			return await this._repositoryLaunches.hasLocation(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('LaunchesService', 'hasLocation', null, err, null, null, correlationId);
		}
	}

	async hasRocket(correlationId, user, id) {
		this._enforceNotNull('LaunchesService', 'hasRocket', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			return await this._repositoryLaunches.hasRocket(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('LaunchesService', 'hasRocket', null, err, null, null, correlationId);
		}
	}

	async hasRocketSetup(correlationId, user, id) {
		this._enforceNotNull('LaunchesService', 'hasRocketSetup', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketSetupId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			return await this._repositoryLaunches.hasRocket(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('LaunchesService', 'hasRocketSetup', null, err, null, null, correlationId);
		}
	}

	async refreshSearchName(correlationId) {
		return await this._repositoryLaunches.refreshSearchName(correlationId);
	}

	async retrieve(correlationId, user, id) {
		this._enforceNotNull('LaunchesService', 'retrieve', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryLaunches.retrieve(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('LaunchesService', 'retrieve', null, err, null, null, correlationId);
		}
	}

	async search(correlationId, user, params) {
		this._enforceNotNull('LaunchesService', 'search', 'user', user, correlationId);
		
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.launchesParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryLaunches.search(correlationId, user.id, params);
		}
		catch (err) {
			return this._error('LaunchesService', 'search', null, err, null, null, correlationId);
		}
	}

	async update(correlationId, user, launchUpdate) {
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationChecklistResponse = this._serviceValidation.check(correlationId, this._serviceValidation.launches, launchUpdate);
			if (this._hasFailed(validationChecklistResponse))
				return validationChecklistResponse;
	
			const fetchRespositoryResponse = await this._repositoryLaunches.retrieve(correlationId, user.id, launchUpdate.id);
			if (this._hasFailed(fetchRespositoryResponse))
				return fetchRespositoryResponse;

			// SECURITY: Check is the owner
			if (!this._isOwner(correlationId, user, fetchRespositoryResponse.results))
				return this._securityErrorResponse(correlationId, 'LaunchesService', 'update');
	
			const launch = fetchRespositoryResponse.results;
			if (!launch) {
				const validResponse = this._checkUpdatedTimestamp(correlationId, launchUpdate, launch, 'launch');
				if (this._hasFailed(validResponse))
					return validResponse;
			}
			
			return await this._repositoryLaunches.update(correlationId, user.id, launchUpdate);
		}
		catch (err) {
			return this._error('LaunchesService', 'update', null, err, null, null, correlationId);
		}
	}
}

export default LaunchesService;
