import Constants from '../../constants.js';
import LibraryConstants from '@thzero/library_server/constants.js';

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

	_initializeRoutes(router) {
		router.post(this._join('/reset'),
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
				const response = (await router[LibraryConstants.InjectorKeys.SERVICE_UTILITY].syncFrom(request.correlationId)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
	}
}

export default ApiRoute;
