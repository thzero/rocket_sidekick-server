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

	async _getCollectionLaunches(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionLaunches(correlationId));
	}

	async _getCollectionLocations(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionLocations(correlationId));
	}

	async _getCollectionManufacturers(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionManufacturers(correlationId));
	}

	async _getCollectionParts(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionParts(correlationId));
	}

	async _getCollectionRockets(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionRockets(correlationId));
	}

	async _getCollectionRocketSetups(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionRocketSetups(correlationId));
	}

	async _getCollectionUsers(correlationId) {
		return await this._getCollectionFromConfig(correlationId, this._collectionsConfig.getCollectionUsers(correlationId));
	}

	_searchFilterText(correlationId, query, name, index) {
		const filterText = super._searchFilterText(correlationId, query, name, index);
		if (filterText)
			return filterText;

		index = index ?? 'default';
		name = !String.isNullOrEmpty(name) ? name : 'searchName';

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

	async _refreshSearchName(correlationId, collection) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const response = this._initResponse(correlationId);
			const queryA = [
				{ $match: { 'deleted': { $ne: true } } }
			];
	
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			if (results.length <= 0)
				return this._successResponse(results[0], correlationId);

			for (const result of results) {
				result.searchName = this._createEdgeNGrams(correlationId, result.name);
				// await this._update(correlationId, collection, result.ownerId, result.id, result);
				await collection.replaceOne({id: result.id}, result, {upsert: true});
			}

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'AppMongoRepository', '_refreshSearchName');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}
	
	_createEdgeNGrams(correlationId, str) {
		if (!str || str.length <= 3)
			return str;

		const minGram = 3
		const maxGram = str.length
		
		return str.split(' ').reduce((ngrams, token) => {
			if (token.length > minGram) {   
				for (let i = minGram; i <= maxGram && i <= token.length; ++i)
					ngrams = [...ngrams, token.substr(0, i)]
			} else
				ngrams = [...ngrams, token]
			return ngrams;
		}, []).join(' ');
	}
}

export default AppMongoRepository;
