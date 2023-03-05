import Constants from '../constants.js';

import Service from '@thzero/library_server/service/index.js';

class ManufacturersService extends Service {
	constructor() {
		super();

		this._repositoryManufacturers = null;
		this._serviceUsers = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryManufacturers = this._injector.getService(Constants.InjectorKeys.REPOSITORY_MANUFACTURERS);
	}

	async listing(correlationId, params) {
		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.manufacturersParams, params);
		if (this._hasFailed(validationResponse))
			return validationResponse;

		return await this._repositoryManufacturers.listing(correlationId, params);
	}

	async retrieve(correlationId, id) {
		const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.manufacturersId, id);
		if (this._hasFailed(validationResponse))
			return validationResponse;

		return await this._repositoryManufacturers.retrieve(correlationId, id);
	}
}

export default ManufacturersService;
