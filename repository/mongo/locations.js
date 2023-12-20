import AppSharedConstants from 'rocket_sidekick_common/constants.js';

import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

import AppMongoRepository from './app.js';

class LocationsRepository extends AppMongoRepository {
	constructor() {
		super();
		
		this._ownerId = null;
	}

	async init(injector) {
		await super.init(injector);

		this._ownerId = this._config.get('ownerId');
	}

	async delete(correlationId, userId, id) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionLocations(correlationId);

			const location = await this._findOne(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'id': id } ] });
			if (!location)
				return await this._transactionAbort(correlationId, session, 'Unable to delete the location - not found.');

			location.deleted = true;
			location.deletedUserId = userId;
			location.deletedTimestamp = LibraryCommonUtility.getTimestamp();
			const response = await this._update(correlationId, collection, userId, location.id, location);
			if (this._hasFailed(response))
				return await this._transactionAbort(correlationId, session, 'Unable to delete the location.');

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'LocationsRepository', 'delete');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}

	async refreshSearchName(correlationId) {
		return await this._refreshSearchName(correlationId, await this._getCollectionLocations(correlationId));
	}
	
	async retrieve(correlationId, userId, id) {
		try {
			const queryA = [ { 
					$match: {
						$and: [
							{ 'id': id },
							{ 'ownerId': userId },
							{ 'deleted': { $ne: true } }
						]
					}
				}
			];
			queryA.push({
				$project: { 
					'_id': 0
				}
			});

			const collection = await this._getCollectionLocations(correlationId);
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			if (results.length === 0)
				return this._success(correlationId);
			
			results = results[0];

			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('LocationsRepository', 'retrieve', null, err, null, null, correlationId);
		}
	}

	async search(correlationId, userId, params) {
		try {
			const queryA = [];

			if (!String.isNullOrEmpty(params.name)) {
				queryA.push(
					this._searchFilterText(correlationId, params.name),
				);
			}

			const where = [];
			
			if (params.rocketTypes && params.rocketTypes.length > 0) {
				const arr = [];
				params.rocketTypes.forEach(element => {
					arr.push({ 'typeId': element });
				});
				where.push({ $or: arr});
			}

			const defaultFilter = { 
				$and: [
					{ 'ownerId': userId },
					{ 'deleted': { $ne: true } },
					...where
				]
			};
			
			queryA.push({
				$match: defaultFilter
			});
			queryA.push({
				$project: { 
					'_id': 0,
					'iterations': 0
				}
			});
	
			const collection = await this._getCollectionLocations(correlationId);
			const results = await this._aggregateExtract2(correlationId, collection, queryA, queryA, this._initResponseExtract(correlationId));
			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('LocationsRepository', 'search', null, err, null, null, correlationId);
		}
	}

	async update(correlationId, userId, location) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionLocations(correlationId);
			const response = this._initResponse(correlationId);

			location.ownerId = userId;
			location.searchName = this._createEdgeNGrams(correlationId, location.name);
			await this._update(correlationId, collection, userId, location.id, location);

			const responseRetrieve = await this.retrieve(correlationId, userId, location.id);
			if (this._hasFailed(responseRetrieve))
				return response;
			response.results = responseRetrieve.results;

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'LocationsRepository', 'update');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}
}

export default LocationsRepository;
