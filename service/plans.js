import LibraryServerConstants from '@thzero/library_server/constants.js';

import Service from '@thzero/library_server/service/index.js';

class PlansService extends Service {
	constructor() {
		super();

		this._repositoryPlans = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryPlans = this._injector.getService(LibraryServerConstants.InjectorKeys.REPOSITORY_PLANS);
	}

	async listing(correlationId) {
		try {
			return await this._repositoryPlans.listing(correlationId);
		}
		catch (err) {
			return this._error('PlansService', 'listing', null, err, null, null, correlationId);
		}
	}
}

export default PlansService;
