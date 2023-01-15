import Constants from '../../constants.js';
// import LibraryConstants from '@thzero/library_server/constants.js';

import BaseRoute from '@thzero/library_server_fastify/routes/index.js';

class ApiRoute extends BaseRoute {
	constructor(prefix) {
		super(prefix ? prefix : '');
	}

	async init(injector, app, config) {
		await super.init(injector, app, config);
		
		this._inject(app, injector, Constants.InjectorKeys.SERVICE_API, Constants.InjectorKeys.SERVICE_API);
		// this._inject(app, injector, LibraryConstants.InjectorKeys.SERVICE_UTILITY, LibraryConstants.InjectorKeys.SERVICE_UTILITY);
	}

	get id() {
		return 'app';
	}

	// _initializeRoutes(router) {
	// }
}

export default ApiRoute;
