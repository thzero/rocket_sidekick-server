import LibraryConstants from '@thzero/library_server/constants.js';

import UtilityRoute from '@thzero/library_server_fastify/routes/utility.js';

class AppUtilityRoute extends UtilityRoute {
	constructor(prefix) {
		super(prefix ? prefix : '');
	}

	_initializeRoutes(router) {
		// router.post(this._join('/content'),
		// 	// eslint-disable-next-line
		// 	async (request, reply) => {
		// 		const response = (await router[LibraryConstants.InjectorKeys.SERVICE_UTILITY].syncFrom(request.correlationId)).check(request);
		// 		// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
		// 		return this._jsonResponse(reply, response);
		// 	}
		// );

		router.post(this._join('/content/reset'),
			{
				preHandler: router.auth([
					router.authenticationDefault,
					router.authorizationDefault
				], 
				{ 
					relation: 'and',
					roles: [ 'content.reset' ]
				}),
			},
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[LibraryConstants.InjectorKeys.SERVICE_UTILITY].contentReset(request.correlationId)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
	}
}

export default AppUtilityRoute;
