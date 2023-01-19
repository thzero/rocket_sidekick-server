import LibraryConstants from '@thzero/library_server/constants.js';

import Service from '@thzero/library_server/service/index.js';

class ApiService extends Service {
	constructor() {
		super();
	}

	_initializeRoutes(router) {
		router.get(this._join('/content'),
			// eslint-disable-next-line
			async (request, reply) => {
				const response = (await router[LibraryConstants.InjectorKeys.SERVICE_UTILITY].content(request.correlationId)).check(request);
				// https://github.com/fastify/fastify-compress/issues/215#issuecomment-1210598312
				return this._jsonResponse(reply, response);
			}
		);
	}
}

export default ApiService;
