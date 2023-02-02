import Constants from '../../constants.js';
// import LibraryServerUtility from '@thzero/library_server/constants.js';

import BaseRoute from '@thzero/library_server_fastify/routes/index.js';

class ApiRoute extends BaseRoute {
	constructor(prefix) {
		super(prefix ? prefix : '');
	}

	async init(injector, app, config) {
		await super.init(injector, app, config);
		
		this._inject(app, injector, Constants.InjectorKeys.SERVICE_API, Constants.InjectorKeys.SERVICE_API);
		// this._inject(app, injector, LibraryServerUtility.InjectorKeys.SERVICE_UTILITY, LibraryServerUtility.InjectorKeys.SERVICE_UTILITY);
	}

	get id() {
		return 'app';
	}

	// _initializeRoutes(router) {
	// }
}

export default ApiRoute;
