import Constants from '../constants.js';
// import AppSharedConstants from 'rocket_sidekick_common/constants.js';

import Utility from '@thzero/library_common/utility/index.js';

import Service from '@thzero/library_server/service/index.js';

class RocketsService extends Service {
	constructor() {
		super();

		this._repositoryRockets = null;
		this._serviceUsers = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryRockets = this._injector.getService(Constants.InjectorKeys.REPOSITORY_ROCKETS);
	}

	async copy(correlationId, user, params) {
		this._enforceNotNull('RocketsService', 'copy', 'user', user, correlationId);

		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketsCopyParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			const response = await this._repositoryRockets.retrieveUser(correlationId, user.id, params.id);
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
	
			return await this._repositoryRockets.updateUser(correlationId, user.id, results);
		}
		catch (err) {
			return this._error('RocketsService', 'copy', null, err, null, null, correlationId);
		}
	}

	async delete(correlationId, user, id) {
		this._enforceNotNull('PartsService', 'delete', 'user', user, correlationId);

		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			const fetchRespositoryResponse = await this._repositoryParts.retrieve(correlationId, user.id, id);
			if (this._hasFailed(fetchRespositoryResponse))
				return fetchRespositoryResponse;
	
			return await this._repositoryRockets.delete(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('RocketsService', 'delete', null, err, null, null, correlationId);
		}
	}

	async listing(correlationId, params) {
		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketsParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryRockets.listing(correlationId, params);
		}
		catch (err) {
			return this._error('RocketsService', 'listing', null, err, null, null, correlationId);
		}
	}

	async listingUser(correlationId, user, params) {
		this._enforceNotNull('RocketsService', 'listingUser', 'user', user, correlationId);
		
		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketsParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryRockets.listingUser(correlationId, user.id, params);
		}
		catch (err) {
			return this._error('RocketsService', 'listingUser', null, err, null, null, correlationId);
		}
	}

	async retrieve(correlationId, id) {
		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryRockets.retrieve(correlationId, id);
		}
		catch (err) {
			return this._error('RocketsService', 'delretrieveeteUser', null, err, null, null, correlationId);
		}
	}

	async retrieveUser(correlationId, user, id) {
		this._enforceNotNull('RocketsService', 'retrieveUser', 'user', user, correlationId);

		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryRockets.retrieveUser(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('RocketsService', 'retrieveUser', null, err, null, null, correlationId);
		}
	}

	async update(correlationId, user, rocketsUpdate) {
		try {
			const validationResponse = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponse))
				return validationResponse;
				
			const validationChecklistResponse = this._serviceValidation.check(correlationId, this._serviceValidation.parts, rocketsUpdate);
			if (this._hasFailed(validationChecklistResponse))
				return validationChecklistResponse;
	
			const fetchRespositoryResponse = await this._repositoryRockets.retrieve(correlationId, user.id, rocketsUpdate.id);
			if (this._hasFailed(fetchRespositoryResponse))
				return fetchRespositoryResponse;
	
			const rocket = fetchRespositoryResponse.results;
			if (!rocket) {
				const validResponse = this._checkUpdatedTimestamp(correlationId, rocketsUpdate, rocket, 'rocket');
				if (this._hasFailed(validResponse))
					return validResponse;
			}
			
			return await this._repositoryRockets.update(correlationId, user.id, rocketsUpdate);
		}
		catch (err) {
			return this._error('RocketsService', 'update', null, err, null, null, correlationId);
		}
	}
}

export default RocketsService;
