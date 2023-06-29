import Constants from '../../constants.js';

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

		router.get(this._join('/parts/:id'),
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[Constants.InjectorKeys.SERVICE_PARTS].retrieve(request.correlationId, request.params.id)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
		router.post(this._join('/parts/listing'),
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[Constants.InjectorKeys.SERVICE_PARTS].listing(request.correlationId, request.body)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
	}
}

export default PartsRoute;