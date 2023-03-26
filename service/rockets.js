import Constants from '../constants.js';

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

	async listing(correlationId, params) {
		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketsParams, params);
		if (this._hasFailed(validationResponse))
			return validationResponse;

		return await this._repositoryRockets.listing(correlationId, params);
	}

	async listingUser(correlationId, user, params) {
		this._enforceNotNull('RocketsService', 'retrieveUser', 'user', user, correlationId);
		
		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketsParams, params);
		if (this._hasFailed(validationResponse))
			return validationResponse;

			return await this._repositoryRockets.listingUser(correlationId, user.id, params);
	}

	async retrieve(correlationId, id) {
		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketsId, id);
		if (this._hasFailed(validationResponse))
			return validationResponse;

		return await this._repositoryRockets.retrieve(correlationId, id);
	}

	async retrieveUser(correlationId, user, id) {
		this._enforceNotNull('RocketsService', 'retrieveUser', 'user', user, correlationId);

		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketsId, id);
		if (this._hasFailed(validationResponse))
			return validationResponse;

		return await this._repositoryRockets.retrieveUser(correlationId, user.id, id);
	}
}

export default RocketsService;
