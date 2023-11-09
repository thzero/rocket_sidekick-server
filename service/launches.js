import Constants from '../constants.js';

import Service from '@thzero/library_server/service/index.js';

class LaunchesService extends Service {
	constructor() {
		super();

		this._repositoryLaunches = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryLaunches = this._injector.getService(Constants.InjectorKeys.REPOSITORY_LAUNCHES);
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

			// TODO: See if its used in a checklist

			// TODO: SECURITY: Check for admin if its a default otherwise is the owner
	
			return await this._repositoryLaunches.delete(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('LaunchesService', 'delete', null, err, null, null, correlationId);
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

			// TODO: SECURITY: Check for admin if its a default otherwise is the owner
	
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
