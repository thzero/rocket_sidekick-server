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

	async listing(correlationId, user, params) {
		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.manufacturersParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryManufacturers.listing(correlationId, params);
		}
		catch (err) {
			return this._error('ManufacturersService', 'listing', null, err, null, null, correlationId);
		}
	}

	async retrieve(correlationId, user, id) {
		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.manufacturersId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryManufacturers.retrieve(correlationId, id);
		}
		catch (err) {
			return this._error('ManufacturersService', 'retrieve', null, err, null, null, correlationId);
		}
	}
}

export default ManufacturersService;
