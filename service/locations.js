import Constants from '../constants.js';

import AppService from './index.js';

class LocationsService extends AppService {
	constructor() {
		super();

		this._repositoryLocations = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryLocations = this._injector.getService(Constants.InjectorKeys.REPOSITORY_LOCATIONS);
		
		this._serviceChecklists = this._injector.getService(Constants.InjectorKeys.SERVICE_CHECKLISTS);
		this._serviceLaunches = this._injector.getService(Constants.InjectorKeys.SERVICE_LAUNCHES);
	}

	async delete(correlationId, user, id) {
		this._enforceNotNull('LocationsService', 'delete', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			const responseLookup = await this._repositoryLocations.retrieveSecurity(correlationId, user.id, id);
			if (this._hasFailed(responseLookup))
				return responseLookup;

			if (this._isPublic(correlationId, user, responseLookup.results)) {
				// TODO: SECURITY: Check for admin if its a public
			}
			else {
				// SECURITY: Check is the owner
				if (!this._isOwner(correlationId, user, responseLookup.results))
					return this._securityErrorResponse(correlationId, 'LocationsService', 'delete');
			}

			// See if its used in a checklist
			const checklistResponse = this._serviceChecklists.hasLocation(correlationId, user, id);
			if (this._hasFailed(checklistResponse))
				return checklistResponse;
			// See if its used in a launch
			const launchResponse = this._serviceLaunches.hasLocation(correlationId, user, id);
			if (this._hasFailed(launchResponse))
				return launchResponse;
	
			return await this._repositoryLocations.delete(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('LocationsService', 'delete', null, err, null, null, correlationId);
		}
	}

	async refreshSearchName(correlationId) {
		return await this._repositoryLocations.refreshSearchName(correlationId);
	}

	async retrieve(correlationId, user, id) {
		this._enforceNotNull('LocationsService', 'retrieve', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryLocations.retrieve(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('LocationsService', 'retrieve', null, err, null, null, correlationId);
		}
	}

	async search(correlationId, user, params) {
		this._enforceNotNull('LocationsService', 'search', 'user', user, correlationId);
		
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.locationsParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryLocations.search(correlationId, user.id, params);
		}
		catch (err) {
			return this._error('LocationsService', 'search', null, err, null, null, correlationId);
		}
	}

	async update(correlationId, user, locationUpdate) {
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationChecklistResponse = this._serviceValidation.check(correlationId, this._serviceValidation.locations, locationUpdate);
			if (this._hasFailed(validationChecklistResponse))
				return validationChecklistResponse;
	
			const fetchRespositoryResponse = await this._repositoryLocations.retrieve(correlationId, user.id, locationUpdate.id);
			if (this._hasFailed(fetchRespositoryResponse))
				return fetchRespositoryResponse;

			const responseLookup = await this._repositoryLocations.retrieveSecurity(correlationId, user.id, locationUpdate.id);
			if (this._hasFailed(responseLookup))
				return responseLookup;

			if (this._isPublic(correlationId, user, responseLookup.results)) {
				// TODO: SECURITY: Check for admin if its a public
			}
			else {
				// SECURITY: Check is the owner
				if (!this._isOwner(correlationId, user, responseLookup.results))
					return this._securityErrorResponse(correlationId, 'LocationsService', 'update');
			}
	
			const location = fetchRespositoryResponse.results;
			if (!location) {
				const validResponse = this._checkUpdatedTimestamp(correlationId, locationUpdate, location, 'location');
				if (this._hasFailed(validResponse))
					return validResponse;
			}
			
			return await this._repositoryLocations.update(correlationId, user.id, locationUpdate);
		}
		catch (err) {
			return this._error('LocationsService', 'update', null, err, null, null, correlationId);
		}
	}
}

export default LocationsService;
