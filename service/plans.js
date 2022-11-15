import LibraryConstants from '@thzero/library_server/constants.js';

import Service from '@thzero/library_server/service/index.js';

class PlansService extends Service {
	constructor() {
		super();

		this._repositoryPlans = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryPlans = this._injector.getService(LibraryConstants.InjectorKeys.REPOSITORY_PLANS);
	}

	async listing(correlationId) {
		const respositoryResponse = await this._repositoryPlans.listing(correlationId);
		return respositoryResponse;
	}
}

export default PlansService;
