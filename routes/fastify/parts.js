import Constants from '../../constants.js';
import LibraryCommonnConstants from '@thzero/library_common/constants.js';

import BaseRoute from '@thzero/library_server_fastify/routes/index.js';

class PartsRoute extends BaseRoute {
	constructor(prefix) {
		super(prefix ? prefix : '');
	}

	async init(injector, app, config) {
		await super.init(injector, app, config);
		
		this._inject(app, injector, Constants.InjectorKeys.SERVICE_PARTS, Constants.InjectorKeys.SERVICE_PARTS);
	}

	_initializeRoutes(router) {
		super._initializeRoutes(router);

		router.delete(this._join('/parts/:id'),
			{
				preHandler: router.auth([
					router.authenticationDefault,
					router.authorizationDefault
				], 
				{ 
					relation: LibraryCommonnConstants.Security.logicalAnd,
					roles: [ 'parts' ]
				}),
			},
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[Constants.InjectorKeys.SERVICE_PARTS].delete(request.correlationId, request.user, request.params.id)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
		router.post(this._join('/parts/copy'),
			{
				preHandler: router.auth([
					router.authenticationDefault,
					router.authorizationDefault
				], 
				{ 
					relation: LibraryCommonnConstants.Security.logicalAnd,
					roles: [ 'parts' ]
				}),
			},
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[Constants.InjectorKeys.SERVICE_PARTS].copy(request.correlationId, request.user, request.body)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
		router.get(this._join('/parts/:id'),
			{
				preHandler: router.auth([
					router.authenticationDefault,
					router.authorizationDefault
				], 
				{ 
					relation: LibraryCommonnConstants.Security.logicalAnd,
					roles: [ 'parts' ]
				}),
			},
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[Constants.InjectorKeys.SERVICE_PARTS].retrieve(request.correlationId, request.user, request.params.id)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
		router.post(this._join('/parts/search/rocket'),
			{
				preHandler: router.auth([
					router.authenticationDefault,
					router.authorizationDefault
				], 
				{ 
					relation: LibraryCommonnConstants.Security.logicalAnd,
					roles: [ 'parts' ]
				}),
			},
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[Constants.InjectorKeys.SERVICE_PARTS].searchRocket(request.correlationId, request.user, request.body)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
		router.post(this._join('/parts/search'),
			{
				preHandler: router.auth([
					router.authenticationDefault,
					router.authorizationDefault
				], 
				{ 
					relation: LibraryCommonnConstants.Security.logicalAnd,
					roles: [ 'parts' ]
				}),
			},
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[Constants.InjectorKeys.SERVICE_PARTS].search(request.correlationId, request.user, request.body)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
		router.post(this._join('/parts'),
			{
				preHandler: router.auth([
					router.authenticationDefault,
					router.authorizationDefault
				], 
				{ 
					relation: LibraryCommonnConstants.Security.logicalAnd,
					roles: [ 'parts' ]
				}),
			},
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[Constants.InjectorKeys.SERVICE_PARTS].update(request.correlationId, request.user, request.body)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
		router.get(this._join('/parts/refresh'),
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
				const response = (await router[Constants.InjectorKeys.SERVICE_PARTS].refreshSearchName(request.correlationId)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
	}
}

export default PartsRoute;
