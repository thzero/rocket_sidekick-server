import AppConstants from '../../constants.js';
import LibraryCommonnConstants from '@thzero/library_common/constants.js';

import BaseRoute from '@thzero/library_server_fastify/routes/index.js';

class LaunchesRoute extends BaseRoute {
	constructor(prefix) {
		super(prefix ? prefix : '');
	}

	async init(injector, app, config) {
		await super.init(injector, app, config);
		
		this._inject(app, injector, AppConstants.InjectorKeys.SERVICE_LAUNCHES, AppConstants.InjectorKeys.SERVICE_LAUNCHES);
	}

	_initializeRoutes(router) {
		super._initializeRoutes(router);

		router.delete(this._join('/launches/:id'),
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
				const response = (await router[AppConstants.InjectorKeys.SERVICE_LAUNCHES].delete(request.correlationId, request.user, request.params.id)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
		router.get(this._join('/launches/:id'),
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
				const response = (await router[AppConstants.InjectorKeys.SERVICE_LAUNCHES].retrieve(request.correlationId, request.user, request.params.id)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
		router.post(this._join('/launches/search'),
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
				const response = (await router[AppConstants.InjectorKeys.SERVICE_LAUNCHES].search(request.correlationId, request.user, request.body)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
		router.post(this._join('/launches'),
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
				const response = (await router[AppConstants.InjectorKeys.SERVICE_LAUNCHES].update(request.correlationId, request.user, request.body)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
		router.get(this._join('/launches/refresh'),
		// 	{
		// 		preHandler: router.auth([
		// 			router.authenticationDefault,
		// 			router.authorizationDefault
		// 		], 
		// 		{ 
		// 			relation: LibraryCommonnConstants.Security.logicalAnd,
		// 			roles: [ 'rockets' ]
		// 		}),
		// 	},
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[AppConstants.InjectorKeys.SERVICE_LAUNCHES].refreshSearchName(request.correlationId)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
	}
}

export default LaunchesRoute;
