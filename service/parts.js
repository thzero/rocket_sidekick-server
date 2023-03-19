import Constants from '../constants.js';

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

	async listing(correlationId, params) {
		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.partsParams, params);
		if (this._hasFailed(validationResponse))
			return validationResponse;

		return await this._repositoryParts.listing(correlationId, params);
	}

	async retrieve(correlationId, id) {
		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.partsId, id);
		if (this._hasFailed(validationResponse))
			return validationResponse;

		return await this._repositoryParts.retrieve(correlationId, id);
	}
}

export default PartsService;
