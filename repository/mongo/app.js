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

	async _getCollectionContent(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionContent(correlationId));
	}

	async _getCollectionRockets(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionRockets(correlationId));
	}

	async _getCollectionManufacturers(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionManufacturers(correlationId));
	}

	async _getCollectionParts(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionParts(correlationId));
	}

	async _getCollectionUsers(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionUsers(correlationId));
	}

	_searchFilterText(correlationId, query, name, index) {
		const filterText = super._searchFilterText(correlationId, query, name, index);
		if (filterText)
			return filterText;

		index = index ?? 'default';

		if ('atlas' !== (this._searchFilterTextType ?? '').toLowerCase())
			return null;

		return {
			$search: {
				index: index,
				wildcard: {
					query: (!String.isNullOrEmpty(query) ? query : '') + '*' , 
					path: name, 
					allowAnalyzedField: true
				}
			}
		};
	}
}

export default AppMongoRepository;
