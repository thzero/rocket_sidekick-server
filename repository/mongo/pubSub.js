import AppConstants from '../../constants.js';

import PubSubMongoRepository from '@thzero/library_server_repository_mongo/pubSub.js';

class PubSubRepository extends PubSubMongoRepository {
	constructor() {
		super();

		this._servicePubSub = null;
	}

	async init(injector) {
		await super.init(injector);

		this._servicePubSub = this._injector.getService(AppConstants.InjectorKeys.SERVICE_PUBSUB);
	}

	async _getCollectionPubSub(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionPubSub(correlationId));
	}

	async _listen(correlationId, message) {
		this._servicePubSub.perform(correlationId, message);
	}
}

export default PubSubRepository;
