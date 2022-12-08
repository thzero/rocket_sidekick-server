import MongoRepository from '@thzero/library_server_repository_mongo/index.js';

class AppMongoRepository extends MongoRepository {
	async _getCollectionChecklists(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionChecklists(correlationId));
	}

	async _getCollectionRockets(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionRockets(correlationId));
	}

	async _getCollectionUsers(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionUsers(correlationId));
	}
}

export default AppMongoRepository;
