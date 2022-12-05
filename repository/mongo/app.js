import MongoRepository from '@thzero/library_server_repository_mongo/index.js';

class AppMongoRepository extends MongoRepository {
	async _getCollectionRockets(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionRocketss(correlationId));
	}

	async _getCollectionUsers(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionUsers(correlationId));
	}
}

export default AppMongoRepository;
