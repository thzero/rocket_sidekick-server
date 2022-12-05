import Constants from '../../constants.js';

import BaseRoute from '@thzero/library_server_fastify/routes/index.js';

class SyncRoute extends BaseRoute {
	constructor(prefix) {
		super(prefix ? prefix : '');
	}

	async init(injector, app, config) {
		await super.init(injector, app, config);
		
		this._inject(app, injector, Constants.InjectorKeys.SERVICE_SYNC, Constants.InjectorKeys.SERVICE_SYNC);
	}

	get id() {
		return 'app';
	}

	_initializeRoutes(router) {
		router.post(this._join('/sync'),
			// authentication(true),
			// authorization('sync'),
			{
				preHandler: router.auth([
					router.authenticationDefault,
					router.authorizationDefault
				], 
				{ 
					relation: 'and',
					roles: [ 'sync' ]
				}),
			},
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[Constants.InjectorKeys.SERVICE_SYNC].syncFrom(request.correlationId, request.user, request.body)).check(request);
				this._jsonResponse(reply, response);
			}
		);
	}
}

export default SyncRoute;
