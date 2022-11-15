// import Constants from '../constants.js';
import LibraryConstants from '@thzero/library_server/constants.js';

import Service from '@thzero/library_server/service/index.js';

class ApiService extends Service {
	constructor() {
		super();
	}

	async init(injector) {
		await super.init(injector);

		this._servicePlans = this._injector.getService(LibraryConstants.InjectorKeys.SERVICE_PLANS);
		this._serviceVersion = this._injector.getService(LibraryConstants.InjectorKeys.SERVICE_VERSION);
	}

	async initialize(correlationId) {
		const response = this._initResponse(correlationId);
		response.results = {};

		const responsePlans = await this._servicePlans.listing(correlationId);
		if (this._hasFailed(responsePlans))
			return responsePlans;

		response.results.plans = responsePlans.results;

		const responseVersion = await this._serviceVersion.version(correlationId);
		if (this._hasFailed(responseVersion))
			return responseVersion;

		response.results.version = responseVersion.results;
		return response;
	}
}

export default ApiService;
