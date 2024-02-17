import AppConstants from '../../constants.js';
import LibraryCommonnConstants from '@thzero/library_common/constants.js';

import BaseRoute from '@thzero/library_server_fastify/routes/index.js';

class InventoryRoute extends BaseRoute {
	constructor(prefix) {
		super(prefix ? prefix : '');
	}

	async init(injector, app, config) {
		await super.init(injector, app, config);
		
		this._inject(app, injector, AppConstants.InjectorKeys.SERVICE_INVENTORY, AppConstants.InjectorKeys.SERVICE_INVENTORY);
	}

	_initializeRoutes(router) {
		super._initializeRoutes(router);

		router.get(this._join('/inventory'),
			{
				preHandler: router.auth([
					router.authenticationDefault,
					router.authorizationDefault
				], 
				{ 
					relation: LibraryCommonnConstants.Security.logicalAnd,
					roles: [ 'rockets' ]
				}),
			},
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[AppConstants.InjectorKeys.SERVICE_INVENTORY].retrieve(request.correlationId, request.user)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
		router.post(this._join('/inventory'),
			{
				preHandler: router.auth([
					router.authenticationDefault,
					router.authorizationDefault
				], 
				{ 
					relation: LibraryCommonnConstants.Security.logicalAnd,
					roles: [ 'rockets' ]
				}),
			},
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[AppConstants.InjectorKeys.SERVICE_INVENTORY].update(request.correlationId, request.user, request.body)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
	}
}

export default InventoryRoute;
