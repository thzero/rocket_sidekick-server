import Constants from '../constants.js';

import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

import AppService from './index.js';

import RocketSetupStageData from 'rocket_sidekick_common/data/rockets/setups/stage.js';

class RocketSetupsService extends AppService {
	constructor() {
		super();

		this._repositoryRocketSetups = null;
		this._serviceUsers = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryRocketSetups = this._injector.getService(Constants.InjectorKeys.REPOSITORY_ROCKETSETUPS);
		
		this._serviceChecklists = this._injector.getService(Constants.InjectorKeys.SERVICE_CHECKLISTS);
		this._serviceLaunches = this._injector.getService(Constants.InjectorKeys.SERVICE_LAUNCHES);
	}

	async copy(correlationId, user, params) {
		this._enforceNotNull('RocketSetupsService', 'copy', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketSetupsCopyParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			const responseLookup = this._repositoryRocketSetups.retrieveSecurity(correlationId, user.id, params.id);
			if (this._hasFailed(responseLookup))
				return responseLookup;
			
			// SECURITY: Check is the owner
			if (!this._isOwner(correlationId, user, responseLookup.results))
				return this._securityErrorResponse(correlationId, 'RocketSetupsService', 'copy');
	
			const response = await this._repositoryRocketSetups.retrieve(correlationId, user.id, params.id);
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
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketSetupId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			const responseLookup = this._repositoryLaunches.retrieveSecurity(correlationId, user.id, id);
			if (this._hasFailed(responseLookup))
				return responseLookup;
			
			// SECURITY: Check is the owner
			if (!this._isOwner(correlationId, user, responseLookup.results))
				return this._securityErrorResponse(correlationId, 'RocketSetupsService', 'delete');

			// See if its used in a checklist
			const checklistResponse = this._serviceChecklists.hasRocketSetup(correlationId, user, id);
			if (this._hasFailed(checklistResponse))
				return checklistResponse;
			// See if its used in a launch
			const launchResponse = this._serviceLaunches.hasRocketSetup(correlationId, user, id);
			if (this._hasFailed(launchResponse))
				return launchResponse;
	
			return await this._repositoryRocketSetups.delete(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('RocketSetupsService', 'delete', null, err, null, null, correlationId);
		}
	}

	async hasPart(correlationId, user, id) {
		this._enforceNotNull('RocketSetupsService', 'hasPart', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.partId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			return await this._repositoryRocketSetups.hasPart(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('RocketSetupsService', 'hasPart', null, err, null, null, correlationId);
		}
	}

	async hasRocket(correlationId, user, id) {
		this._enforceNotNull('RocketSetupsService', 'hasRocket', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;

			return await this._repositoryRocketSetups.hasRocket(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('RocketSetupsService', 'hasRocket', null, err, null, null, correlationId);
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
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketSetupId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			const response = await this._repositoryRocketSetups.retrieve(correlationId, user.id, id);
			if (this>this._hasFailed(response))
				return response;

			const rocketSetup = response.results;
			if (!rocketSetup.stages)
				rocketSetup.stages = [];

			// sync up rocket and rocketsetup stages
			const tempStages = [];
			if (rocketSetup.rocket && rocketSetup.rocket.stages) {
				let rocketSetupStage;
				for (const item of rocketSetup.rocket.stages) {
					rocketSetupStage = rocketSetup.stages.find(l => l.rocketStageId === item.id);
					if (rocketSetupStage) {
						rocketSetupStage.index = item.index;
						rocketSetupStage.fromRocket = item;
						tempStages.push(rocketSetupStage);
						continue;
					}

					rocketSetupStage = new RocketSetupStageData();
					rocketSetupStage.rocketSetupId = rocketSetup.id;
					rocketSetupStage.rocketStageId = item.id;
					rocketSetupStage.index = item.index;
					rocketSetupStage.enabled = true;
					rocketSetupStage.fromRocket = item;
					tempStages.push(rocketSetupStage);
				}
			}
			rocketSetup.stages = tempStages;

			response.results = rocketSetup;

			return response;
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
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketSetupsParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryRocketSetups.search(correlationId, user.id, params);
		}
		catch (err) {
			return this._error('RocketSetupsService', 'search', null, err, null, null, correlationId);
		}
	}

	async update(correlationId, user, rocketSetupUpdate) {
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationChecklistResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketSetup, rocketSetupUpdate);
			if (this._hasFailed(validationChecklistResponse))
				return validationChecklistResponse;
	
			let fetchRespositoryResponse = await this._repositoryRocketSetups.retrieve(correlationId, user.id, rocketSetupUpdate.id);
			if (this._hasFailed(fetchRespositoryResponse))
				return fetchRespositoryResponse;

			// SECURITY: Check is the owner
			if (!this._isOwner(correlationId, user, fetchRespositoryResponse.results))
				return this._securityErrorResponse(correlationId, 'RocketSetupsService', 'update');
	
			const rocketSetup = fetchRespositoryResponse.results;
			if (!rocketSetup) {
				const validResponse = this._checkUpdatedTimestamp(correlationId, rocketSetupUpdate, rocketSetup, 'rocket');
				if (this._hasFailed(validResponse))
					return validResponse;
			}
			
			const responseU = await this._repositoryRocketSetups.update(correlationId, user.id, rocketSetupUpdate);
			if (this._hasFailed(responseU))
				return responseU;

			fetchRespositoryResponse = await this.retrieve(correlationId, user, rocketSetupUpdate.id);
			return fetchRespositoryResponse;
		}
		catch (err) {
			return this._error('RocketSetupsService', 'update', null, err, null, null, correlationId);
		}
	}
}

export default RocketSetupsService;
