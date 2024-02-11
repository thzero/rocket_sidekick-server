import AppConstants from '../../constants.js';

import BaseRoute from '@thzero/library_server_fastify/routes/index.js';

class ManufacturersRoute extends BaseRoute {
	constructor(prefix) {
		super(prefix ? prefix : '');
	}

	async init(injector, app, config) {
		await super.init(injector, app, config);
		
		this._inject(app, injector, AppConstants.InjectorKeys.SERVICE_MANUFACTURERS, AppConstants.InjectorKeys.SERVICE_MANUFACTURERS);
	}

	_initializeRoutes(router) {
		super._initializeRoutes(router);

		router.get(this._join('/manufacturers/:id'),
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[AppConstants.InjectorKeys.SERVICE_MANUFACTURERS].retrieve(request.correlationId, request.params.id)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
		router.post(this._join('/manufacturers/listing'),
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[AppConstants.InjectorKeys.SERVICE_MANUFACTURERS].listing(request.correlationId, request.body)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
	}
}

export default ManufacturersRoute;
