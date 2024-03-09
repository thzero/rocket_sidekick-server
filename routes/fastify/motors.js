import AppConstants from '../../constants.js';

import BaseRoute from '@thzero/library_server_fastify/routes/index.js';

class MotorsRoute extends BaseRoute {
	constructor(prefix) {
		super(prefix ? prefix : '');
	}

	async init(injector, app, config) {
		await super.init(injector, app, config);
		
		this._inject(app, injector, AppConstants.InjectorKeys.SERVICE_MOTORS, AppConstants.InjectorKeys.SERVICE_MOTORS);
	}

	_initializeRoutes(router) {
		super._initializeRoutes(router);

		router.get(this._join('/motors/:id'),
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[AppConstants.InjectorKeys.SERVICE_PARTS].retrieveMotor(request.correlationId, request.user, request.params.id)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
		router.post(this._join('/motors/search'),
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[AppConstants.InjectorKeys.SERVICE_PARTS].search(request.correlationId, request.user, request.body)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
		router.post(this._join('/motors/sync'),
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[AppConstants.InjectorKeys.SERVICE_MOTORS].sync(request.correlationId, request.body)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
	}
}

export default MotorsRoute;
