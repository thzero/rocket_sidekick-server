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
		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketParams, params);
		if (this._hasFailed(validationResponse))
			return validationResponse;


		const response = this._initResponse(correlationId);
		return response;
	}

	async listingUser(correlationId, user, params) {
		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketParams, params);
		if (this._hasFailed(validationResponse))
			return validationResponse;

		const response = this._initResponse(correlationId);
		return response;
	}
}

export default RocketsService;
