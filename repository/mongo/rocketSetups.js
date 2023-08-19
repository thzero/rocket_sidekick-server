import AppSharedConstants from 'rocket_sidekick_common/constants.js';

import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

import AppMongoRepository from './app.js';

class RocketSetupsRepository extends AppMongoRepository {
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

			const collection = await this._getCollectionRockets(correlationId);

			const collectionChecklists = await this._getCollectionChecklists(correlationId);
			
			const results = await this._find(correlationId, collectionChecklists, { $and: [ { 'ownerId' : userId }, { 'rocketId': id }, { $expr: { $ne: [ 'deleted', true ] } } ] });
			if (results && results.length > 0) {
				await this._transactionAbort(correlationId, session, 'Unable to delete the rocket. - associated with a checklist');
				return this._errorResponse('RocketsRepository', 'delete', {
						found: results.length,
						results: results
					},
					AppSharedConstants.ErrorCodes.Rockets.IncludedInChecklist,
					correlationId);
			}

			// const response = await this._delete(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'id': id } ] });
			const checklist = await this._findOne(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'id': id } ] });
			if (!checklist)
				return await this._transactionAbort(correlationId, session, 'Unable to delete the rocket - not found.');

			checklist.deleted = true;
			checklist.deletedUserId = userId;
			checklist.deletedTimestamp = LibraryCommonUtility.getTimestamp();
			const response = await this._update(correlationId, collection, userId, checklist.id, checklist);
			if (this._hasFailed(response))
				return await this._transactionAbort(correlationId, session, 'Unable to delete the rocket.');

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'RocketSetupsRepository', 'delete');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}

	async refreshSearchName(correlationId) {
		return await this._refreshSearchName(correlationId, await this._getCollectionRockets(correlationId));
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

			const collection = await this._getCollectionRockets(correlationId);
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			if (results.length === 0)
				return this._success(correlationId);
			
			results = results[0];
			
			const parts = [];
			parts.push(results.altimeters ?? []);
			parts.push(results.recovery ?? []);
			parts.push(results.tracking ?? []);

			for (const item of results.stages) {
				parts.push(item.altimeters ?? []);
				parts.push(item.recovery ?? []);
				parts.push(item.tracking ?? []);
			}

			let partIds = [];
			parts.map(l => { 
				partIds.push(...l.map(j => { return { 'id': j.itemId }; }));
			});
			partIds = [...new Set(partIds)];
			
			if (partIds.length === 0)
				return this._successResponse(results, correlationId);

			const queryB = [ { 
					$match: {
						$or: partIds
					}
				}
			];
			queryB.push({
				$project: { 
					'_id': 0
				}
			});

			const collection2 = await this._getCollectionParts(correlationId);
			let results2 = await this._aggregate(collection2, collection2, queryB);
			results2 = await results2.toArray();
			if (results2.length === 0)
				return this._successResponse(results, correlationId);

			let item;
			let temp;
			for (const set of parts) {
				for (let i = 0; i < set.length; i++) {
					item = set[i];
					temp = results2.find(l => l.id === item.itemId);
					if (!temp)
						continue;

					set[i] = Object.assign(LibraryCommonUtility.cloneDeep(temp), item);
				}
			}

			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('RocketSetupsRepository', 'retrieve', null, err, null, null, correlationId);
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
			
			if (params.manufacturers && params.manufacturers.length > 0) {
				const arr = [];
				params.manufacturers.forEach(element => {
					arr.push({ 'manufacturerId': element });
				});
				where.push({ $or: arr});
			}
			
			if (!String.isNullOrEmpty(params.manufacturerStockId))
				where.push({ 'manufacturerStockId': params.manufacturerStockId });

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
					'id': 1,
					'name': 1,
					'description': 1,
					'coverUrl': 1,
					'diameterMajor': 1,
					'length': 1,
					'ownerId': 1,
					'typeId': 1,
					'weight': 1
				}
			});
	
			const collection = await this._getCollectionRockets(correlationId);
			const results = await this._aggregateExtract2(correlationId, collection, queryA, queryA, this._initResponseExtract(correlationId));
			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('RocketSetupsRepository', 'search', null, err, null, null, correlationId);
		}
	}

	async update(correlationId, userId, rocket) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionRockets(correlationId);
			const response = this._initResponse(correlationId);

			rocket.ownerId = userId;
			rocket.searchName = this._createEdgeNGrams(correlationId, rocket.name);
			await this._update(correlationId, collection, userId, rocket.id, rocket);
			// response.results = rocket;

			const responseRetrieve = await this.retrieve(correlationId, userId, rocket.id);
			if (this._hasFailed(responseRetrieve))
				return response;
			response.results = responseRetrieve.results;

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'RocketSetupsRepository', 'update');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}
}

export default RocketSetupsRepository;
