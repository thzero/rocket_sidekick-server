import Constants from '../constants.js';
import AppSharedConstants from 'rocket_sidekick_common/constants.js';

import Utility from '@thzero/library_common/utility/index.js';

import Service from '@thzero/library_server/service/index.js';

class PartsService extends Service {
	constructor() {
		super();

		this._repositoryParts = null;
		this._serviceUsers = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryParts = this._injector.getService(Constants.InjectorKeys.REPOSITORY_PARTS);
	}

	async copy(correlationId, user, params) {
		this._enforceNotNull('PartsService', 'copy', 'user', user, correlationId);

		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.partsCopyParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			const response = await this._repositoryParts.retrieve(correlationId, user.id, params.id);
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
	
			return await this._repositoryParts.updateUser(correlationId, user.id, results);
		}
		catch (err) {
			return this._error('PartsService', 'copy', null, err, null, null, correlationId);
		}
	}

	async delete(correlationId, user, id) {
		this._enforceNotNull('PartsService', 'delete', 'user', user, correlationId);

		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.partId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			const fetchRespositoryResponse = await this._repositoryParts.retrieve(correlationId, user.id, id);
			if (this._hasFailed(fetchRespositoryResponse))
				return fetchRespositoryResponse;

			// TODO: SECURITY: Check for admin if its a default otherwise is the owner
	
			const part = fetchRespositoryResponse.results;
			if (!part) {
				// TODO: Check admin security...
				if (part.public)
					return this._error('PartsService', 'delete', null, null, AppSharedConstants.ErrorCodes.Parts.UpdatePublic, null, correlationId);
			}
	
			return await this._repositoryParts.delete(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('PartsService', 'delete', null, err, null, null, correlationId);
		}
	}

	async listing(correlationId, params) {
		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.partsParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryParts.listing(correlationId, params);
		}
		catch (err) {
			return this._error('PartsService', 'listing', null, err, null, null, correlationId);
		}
	}

	async retrieve(correlationId, id) {
		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.partsId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryParts.retrieve(correlationId, id);
		}
		catch (err) {
			return this._error('PartsService', 'retrieve', null, err, null, null, correlationId);
		}
	}

	async update(correlationId, user, partsUpdate) {
		try {
			const validationResponse = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponse))
				return validationResponse;
				
			const validationChecklistResponse = this._serviceValidation.check(correlationId, this._serviceValidation.parts, partsUpdate);
			if (this._hasFailed(validationChecklistResponse))
				return validationChecklistResponse;
	
			const fetchRespositoryResponse = await this._repositoryParts.retrieve(correlationId, user.id, partsUpdate.id);
			if (this._hasFailed(fetchRespositoryResponse))
				return fetchRespositoryResponse;

			// TODO: SECURITY: Check for admin if its a default otherwise is the owner
	
			const part = fetchRespositoryResponse.results;
			if (!part) {
				// TODO: Check admin security...
				if (part.public)
					return this._error('PartsService', 'update', null, null, AppSharedConstants.ErrorCodes.Parts.UpdatePublic, null, correlationId);
	
				const validResponse = this._checkUpdatedTimestamp(correlationId, partsUpdate, part, 'part');
				if (this._hasFailed(validResponse))
					return validResponse;
			}
			
			return await this._repositoryParts.update(correlationId, user.id, partsUpdate);
		}
		catch (err) {
			return this._error('PartsService', 'update', null, err, null, null, correlationId);
		}
	}
}

export default PartsService;
