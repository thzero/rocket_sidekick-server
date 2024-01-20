import LibraryCommonUtility from '@thzero/library_common/utility/index.js';
import LibraryMomentUtility from '@thzero/library_common/utility/moment.js';

import AppMongoRepository from './app.js';

class SyncRepository extends AppMongoRepository {
	constructor() {
		super();
		
		this._ownerId = null;
	}

	async init(injector) {
		await super.init(injector);

		this._ownerId = this._config.get('ownerId');
	}

	async countries(correlationId, countriesUpdate) {
		const collection = await this._getCollectionCountries(correlationId);
		const client = await this._getClient(correlationId);
		const session = await this._transactionInit(correlationId, client);
		try {
			await this._transactionStart(correlationId, session);

			const queryA = [ { 
					$match: { 'deleted': { $ne: true } }
				}
			];

			let results = await this._aggregate(correlationId, collection, queryA);
			const countriesCurrent = await results.toArray();
			const countriesCurrentIds = countriesCurrent.map(l => l.id);

			let countries = [];
			let temp;
			let response;
			for (const item of countriesUpdate) {
				temp = countriesCurrent.find(l => l.iso3 === item.iso3);

				if (!temp)
					item.id = LibraryCommonUtility.generateId();
				else
					item.id = temp.id;
		
				if (!item.createdTimestamp)
					item.createdTimestamp = LibraryMomentUtility.getTimestamp();
				if (!String.isNullOrEmpty(item.createdUserId))
					item.createdUserId = this._ownerId;
					
				response = await this._update(correlationId, collection, this._ownerId, item.id, item);
				if (this._hasFailed(response))
					return this._transactionAbort(correlationId, correlationId, session, 'Unable to update the country.');

				countries.push(item);
			}
			
			const countriesIds = countries.map(l => l.id);
			let country;
			let diff = countriesCurrentIds.filter(x => !countriesIds.includes(x));
			if (diff.length > 0) {
				for (const id of diff) {
					country = countriesCurrent.find(l => l.id);
					country.deleted = true;
					country.deletedUserId = this._ownerId;
					country.deletedTimestamp = LibraryMomentUtility.getTimestamp();
					response = await this._update(correlationId, collection, this._ownerId, country.id, country);
					if (this._hasFailed(response))
						return await this._transactionAbort(correlationId, session, 'Unable to delete the country.');
				}
			}

			await this._transactionCommit(correlationId, session);
			return this._successResponse(countries, correlationId);
		}
		catch (err) {
			return this._transactionAbort(correlationId, session, null, err);
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}

	async searchBySyncTimestamp(correlationId, collectionName, userId, lastSyncTimestamp) {
		const collection = await this._getCollectionByName(correlationId, collectionName);
		if (!collection)
			return this._error('SyncRepository', 'searchBySyncTimestamp', `Can't find collection ${collectionName}'.`, null, null, null, correlationId);
		return await this._searchBySyncTimestamp(correlationId, userId, lastSyncTimestamp, collection);
	}

	async searchBySyncTimestampChecklists(correlationId, userId, lastSyncTimestamp) {
		return await this._searchBySyncTimestamp(correlationId, userId, lastSyncTimestamp, await this._getCollectionChecklists(correlationId));
	}

	async searchBySyncTimestampRockets(correlationId, userId, lastSyncTimestamp) {
		return await this._searchBySyncTimestamp(correlationId, userId, lastSyncTimestamp, await this._getCollectionRockets(correlationId));
	}

	async update(correlationId, collectionName, userId, objects) {
		const collection = await this._getCollectionByName(correlationId, collectionName);
		if (!collection)
			return this._error('SyncRepository', 'update', `Can't find collection ${collectionName}'.`, null, null, null, correlationId);
		return await this._updateFrom(correlationId, userId, objects, collection);
	}

	async updateChecklists(correlationId, userId, objects) {
		return await this._updateFrom(correlationId, userId, objects, await this._getCollectionChecklists(correlationId));
	}

	// eslint-disable-next-line
	async updateRockets(correlationId, userId, objects) {
		return await this._updateFrom(correlationId, userId, objects, await this._getCollectionRockets(correlationId));
	}

	async _searchBySyncTimestamp(correlationId, userId, lastSyncTimestamp, collection) {
		const response = this._initResponse(correlationId);

		const defaultFilter = { 
			$and: [
				{ 
					syncTimestamp: {
						$gt: lastSyncTimestamp
					}
				},
				{ 'id': userId }
			]
		};

		const queryF = defaultFilter;
		const queryA = [
			{
				$match: defaultFilter
			}
		];
		queryA.push({
			$project: { '_id': 0 }
		});
		queryA.push({
			$project: { '_id': 0 }
		});

		// response.results = await this._aggregateExtract(correlationId, await this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
		response.results = await this._aggregateExtract2(correlationId, collection, queryA, queryA, this._initResponseExtract(correlationId));
		return response;
	}

	// eslint-disable-next-line
	async _updateFrom(correlationId, userId, objects, collection) {
		const client = await this._getClient(correlationId);
		const session = await this._transactionInit(correlationId, client);
		try {
			let output = [];
			if (!objects && (objects && objects.length === 0))
				return this._successResponse(output, correlationId);
			
			await this._transactionStart(correlationId, session);

			let response;
			for (const item of objects) {
				// delete item.id;
				item.id = item.identifier;
				if (!item.createdTimestamp)
					item.createdTimestamp = LibraryMomentUtility.getTimestamp();
				if (!String.isNullOrEmpty(item.createdUserId))
					item.createdUserId = userId;
					
				item.syncTimestamp = LibraryMomentUtility.getTimestamp();

				response = await this._update(correlationId, collection, userId, item.id, item); //, 'identifier');
				if (this._hasFailed(response))
					return this._transactionAbort(correlationId, correlationId, session, 'Unable to update the value');

				output.push(response.results);
			}

			await this._transactionCommit(correlationId, session);
			return this._successResponse(output, correlationId);
		}
		catch (err) {
			return this._transactionAbort(correlationId, session, null, err);
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}
}

export default SyncRepository;
