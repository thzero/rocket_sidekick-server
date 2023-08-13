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
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
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
	
			return await this._repositoryParts.update(correlationId, user.id, results);
		}
		catch (err) {
			return this._error('PartsService', 'copy', null, err, null, null, correlationId);
		}
	}

	async delete(correlationId, user, id) {
		this._enforceNotNull('PartsService', 'delete', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.partId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			const fetchRespositoryResponse = await this._repositoryParts.retrieve(correlationId, user.id, id);
			if (this._hasFailed(fetchRespositoryResponse))
				return fetchRespositoryResponse;

			// TODO: SECURITY: Check for admin if its a default otherwise is the owner
	
			const part = fetchRespositoryResponse.results;
			if (!part) {
				// TODO: SECURITY: Check admin security...
				// if (part.public)
				// 	return this._error('PartsService', 'delete', null, null, AppSharedConstants.ErrorCodes.Parts.UpdatePublic, null, correlationId);
			}
	
			return await this._repositoryParts.delete(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('PartsService', 'delete', null, err, null, null, correlationId);
		}
	}

	async refreshSearchName(correlationId) {
		return await this._repositoryParts.refreshSearchName(correlationId);
	}

	async retrieve(correlationId, user, id) {
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.partId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryParts.retrieve(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('PartsService', 'retrieve', null, err, null, null, correlationId);
		}
	}

	async search(correlationId, user, params) {
		this._enforceNotNull('PartsService', 'search', params, 'params', correlationId);
		this._enforceNotEmpty('PartsService', 'search', params.typeId, 'params.typeId', correlationId);
		
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
				
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.partsParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
			
			const validationChecklistResponse2 = this._serviceValidation.check(correlationId, this._determinePartValidationParams(correlationId, params.typeId), params);
			if (this._hasFailed(validationChecklistResponse2))
				return validationChecklistResponse2;

			// TODO: probably need to do diameter or other types of mesurement filtering here, to be able to translate everything
			// from the stored measurement unit (which could vary by part) to the user provided search...
	
			const response = await this._repositoryParts.search(correlationId, user.id, params);
			return response;
		}
		catch (err) {
			return this._error('PartsService', 'search', null, err, null, null, correlationId);
		}
	}

	async searchAltimeters(correlationId, user, params) {
		this._enforceNotNull('PartsService', 'searchAltimeters', params, 'params', correlationId);
		
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
				
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.partsParamsSearchAltimeters, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			// TODO: probably need to do diameter or other types of mesurement filtering here, to be able to translate everything
			// from the stored measurement unit (which could vary by part) to the user provided search...
			
			const response = await this._repositoryParts.searchSetsAltimeters(correlationId, user.id, params);
			return response;
		}
		catch (err) {
			return this._error('PartsService', 'searchAltimeters', null, err, null, null, correlationId);
		}
	}

	async searchRecovery(correlationId, user, params) {
		this._enforceNotNull('PartsService', 'searchRecovery', params, 'params', correlationId);
		
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
				
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.partsParamsSearchRecovery, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			// TODO: probably need to do diameter or other types of mesurement filtering here, to be able to translate everything
			// from the stored measurement unit (which could vary by part) to the user provided search...
			
			const response = await this._repositoryParts.searchSetsRecovery(correlationId, user.id, params);
			return response;
		}
		catch (err) {
			return this._error('PartsService', 'searchRecovery', null, err, null, null, correlationId);
		}
	}

	async searchTrackers(correlationId, user, params) {
		this._enforceNotNull('PartsService', 'searchTrackers', params, 'params', correlationId);
		
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
				
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.partsParamsSearchTrackers, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			// TODO: probably need to do diameter or other types of mesurement filtering here, to be able to translate everything
			// from the stored measurement unit (which could vary by part) to the user provided search...
			
			const response = await this._repositoryParts.searchSetsTrackers(correlationId, user.id, params);
			return response;
		}
		catch (err) {
			return this._error('PartsService', 'searchTrackers', null, err, null, null, correlationId);
		}
	}

	async update(correlationId, user, partsUpdate) {
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationChecklistResponse = this._serviceValidation.check(correlationId, this._serviceValidation.parts, partsUpdate);
			if (this._hasFailed(validationChecklistResponse))
				return validationChecklistResponse;
			
			const validationChecklistResponse2 = this._serviceValidation.check(correlationId, this._determinePartValidation(correlationId, partsUpdate.typeId), partsUpdate);
			if (this._hasFailed(validationChecklistResponse2))
				return validationChecklistResponse2;
	
			const fetchRespositoryResponse = await this._repositoryParts.retrieve(correlationId, user.id, partsUpdate.id);
			if (this._hasFailed(fetchRespositoryResponse))
				return fetchRespositoryResponse;

			// TODO: SECURITY: Check for admin if its a default otherwise is the owner
	
			const part = fetchRespositoryResponse.results;
			if (part) {
				// TODO: SECURITY: Check admin security...
				// if (part.public)
				// 	return this._error('PartsService', 'update', null, null, AppSharedConstants.ErrorCodes.Parts.UpdatePublic, null, correlationId);
	
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

	_determinePartValidation(correlationId, typeId) {
		if (typeId === AppSharedConstants.Rocketry.PartTypes.altimeter)
			return this._serviceValidation.partsAltimeter;
		if (typeId === AppSharedConstants.Rocketry.PartTypes.chuteProtector)
			return this._serviceValidation.partsChuteProtector;
		if (typeId === AppSharedConstants.Rocketry.PartTypes.chuteRelease)
			return this._serviceValidation.partsChuteRelease;
		if (typeId === AppSharedConstants.Rocketry.PartTypes.deploymentBag)
			return this._serviceValidation.partsDeploymentBag;
		if (typeId === AppSharedConstants.Rocketry.PartTypes.motor)
			return this._serviceValidation.partsMotor;
		if (typeId === AppSharedConstants.Rocketry.PartTypes.motorCase)
			return this._serviceValidation.partsMotorCase;
		if (typeId === AppSharedConstants.Rocketry.PartTypes.parachute)
			return this._serviceValidation.partsParachute;
		if (typeId === AppSharedConstants.Rocketry.PartTypes.streamer)
			return this._serviceValidation.partsStreamer;
		if (typeId === AppSharedConstants.Rocketry.PartTypes.tracker)
			return this._serviceValidation.partsTracker;

		return null;
	}

	_determinePartValidationParams(correlationId, typeId) {
		if (typeId === AppSharedConstants.Rocketry.PartTypes.altimeter)
			return this._serviceValidation.partsParamsAltimeter;
		if (typeId === AppSharedConstants.Rocketry.PartTypes.chuteProtector)
			return this._serviceValidation.partsParamsChuteProtector;
		if (typeId === AppSharedConstants.Rocketry.PartTypes.chuteRelease)
			return this._serviceValidation.partsParamsChuteRelease;
		if (typeId === AppSharedConstants.Rocketry.PartTypes.deploymentBag)
			return this._serviceValidation.partsParamsDeploymentBag;
		if (typeId === AppSharedConstants.Rocketry.PartTypes.motor)
			return this._serviceValidation.partsParamsMotor;
		if (typeId === AppSharedConstants.Rocketry.PartTypes.motorCase)
			return this._serviceValidation.partsParamsMotorCase;
		if (typeId === AppSharedConstants.Rocketry.PartTypes.parachute)
			return this._serviceValidation.partsParamsParachute;
		if (typeId === AppSharedConstants.Rocketry.PartTypes.streamer)
			return this._serviceValidation.partsParamsStreamer;
		if (typeId === AppSharedConstants.Rocketry.PartTypes.tracker)
			return this._serviceValidation.partsParamsTracker;

		return null;
	}
}

export default PartsService;
