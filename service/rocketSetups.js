import Constants from '../constants.js';

import Utility from '@thzero/library_common/utility/index.js';

import Service from '@thzero/library_server/service/index.js';

class RocketSetupsService extends Service {
	constructor() {
		super();

		this._repositoryRocketSetups = null;
		this._serviceUsers = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryRocketSetups = this._injector.getService(Constants.InjectorKeys.REPOSITORY_ROCKETSETUPS);
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
	
			const response = await this._repositoryRocketSetups.retrieve(correlationId, user.id, params.id);
			if (this._hasFailed(validationResponse))
				return response;
	
			const results = response.results;
			results.id = Utility.generateId();
			delete results.createdTimestamp;
			delete results.createdUserId;
			delete results.updatedTimestamp;
			delete results.updatedUserId;
			results.public = false;
			results.name = params.name;
	
			return await this._repositoryRocketSetups.update(correlationId, user.id, results);
		}
		catch (err) {
			return this._error('RocketSetupsService', 'copy', null, err, null, null, correlationId);
		}
	}

	async delete(correlationId, user, id) {
		this._enforceNotNull('RocketSetupsService', 'delete', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			const fetchRespositoryResponse = await this._repositoryParts.retrieve(correlationId, user.id, id);
			if (this._hasFailed(fetchRespositoryResponse))
				return fetchRespositoryResponse;

			// TODO: SECURITY: Check for admin if its a default otherwise is the owner
	
			return await this._repositoryRocketSetups.delete(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('RocketSetupsService', 'delete', null, err, null, null, correlationId);
		}
	}

	async refreshSearchName(correlationId) {
		return await this._repositoryRocketSetups.refreshSearchName(correlationId);
	}

	async retrieve(correlationId, user, id) {
		this._enforceNotNull('RocketSetupsService', 'retrieve', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryRocketSetups.retrieve(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('RocketSetupsService', 'retrieve', null, err, null, null, correlationId);
		}
	}

	async search(correlationId, user, params) {
		this._enforceNotNull('RocketSetupsService', 'search', 'user', user, correlationId);
		
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketsParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryRocketSetups.search(correlationId, user.id, params);
		}
		catch (err) {
			return this._error('RocketSetupsService', 'search', null, err, null, null, correlationId);
		}
	}

	async update(correlationId, user, rocketsUpdate) {
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationChecklistResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocket, rocketsUpdate);
			if (this._hasFailed(validationChecklistResponse))
				return validationChecklistResponse;
	
			const fetchRespositoryResponse = await this._repositoryRocketSetups.retrieve(correlationId, user.id, rocketsUpdate.id);
			if (this._hasFailed(fetchRespositoryResponse))
				return fetchRespositoryResponse;

			// TODO: SECURITY: Check for admin if its a default otherwise is the owner
	
			const rocket = fetchRespositoryResponse.results;
			if (!rocket) {
				const validResponse = this._checkUpdatedTimestamp(correlationId, rocketsUpdate, rocket, 'rocket');
				if (this._hasFailed(validResponse))
					return validResponse;
			}
			
			return await this._repositoryRocketSetups.update(correlationId, user.id, rocketsUpdate);
		}
		catch (err) {
			return this._error('RocketSetupsService', 'update', null, err, null, null, correlationId);
		}
	}
}

export default RocketSetupsService;
