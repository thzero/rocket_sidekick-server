import Constants from '../../constants.js';

import BaseRoute from '@thzero/library_server_fastify/routes/index.js';

class ApiRoute extends BaseRoute {
	constructor(prefix) {
		super(prefix ? prefix : '');
	}

	async init(injector, app, config) {
		await super.init(injector, app, config);
		
		this._inject(app, injector, Constants.InjectorKeys.SERVICE_API, Constants.InjectorKeys.SERVICE_API);
	}

	get id() {
		return 'app';
	}

	_initializeRoutes(router) {
		router.get(this._join('/initialize'),
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[Constants.InjectorKeys.SERVICE_API].initialize(request.correlationId)).check(request);
				this._jsonResponse(reply, response);
			}
		);
	}
}

export default ApiRoute;
