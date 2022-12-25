import MongoRepository from '@thzero/library_server_repository_mongo/index.js';

class AppMongoRepository extends MongoRepository {
	async _getCollectionByName(correlationId, collectionName) {
		if (String.isNullOrEmpty(collectionName))
			return null;
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionByName(correlationId, collectionName));
	}

	async _getCollectionChecklists(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionChecklists(correlationId));
	}

	async _getCollectionConfig(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionConfig(correlationId));
	}

	async _getCollectionRockets(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionRockets(correlationId));
	}

	async _getCollectionUsers(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionUsers(correlationId));
	}
}

export default AppMongoRepository;
