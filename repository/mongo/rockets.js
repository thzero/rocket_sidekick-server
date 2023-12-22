import AppSharedConstants from 'rocket_sidekick_common/constants.js';

import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

import AppMongoRepository from './app.js';

class RocketsRepository extends AppMongoRepository {
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

			const rocket = await this._findOne(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'id': id } ] });
			if (!rocket)
				return await this._transactionAbort(correlationId, session, 'Unable to delete the rocket - not found.');

			rocket.deleted = true;
			rocket.deletedUserId = userId;
			rocket.deletedTimestamp = LibraryCommonUtility.getTimestamp();
			const response = await this._update(correlationId, collection, userId, rocket.id, rocket);
			if (this._hasFailed(response))
				return await this._transactionAbort(correlationId, session, 'Unable to delete the rocket.');

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'RocketsRepository', 'delete');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}

	async hasPart(correlationId, userId, id) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			const collection = await this._getCollectionChecklists(correlationId);

			const results = await this._find(correlationId, collection, { 
				$and: [ 
					{ 'ownerId' : userId }, 
					{ $or: [ 
							{ 'altimeters.id' : id }, 
							{ 'chuteProtectors.id': id }, 
							{ 'chuteReleases.id': id }, 
							{ 'deploymentBags.id': id }, 
							{ 'parachutes.id': id }, 
							{ 'streamers.id': id }, 
							{ 'trackers.id': id }
						] 
					}, 
					{ $expr: { $ne: [ 'deleted', true ] } } 
				] 
			});
			if (results && results.length > 0) {
				await this._transactionAbort(correlationId, session, 'Unable to delete the part - associated with a rocket setup.');
				return this._errorResponse('RocketSetupsRepository', 'hasPart', {
						found: results.length,
						results: results
					},
					AppSharedConstants.ErrorCodes.Rockets.IncludedInRocketSetup,
					correlationId);
			}

			return this._success(correlationId);
		}
		catch (err) {
			return this._error('RocketSetupsRepository', 'hasPart', null, err, null, null, correlationId);
		}
	}

	async hasRocket(correlationId, userId, id) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			const collection = await this._getCollectionChecklists(correlationId);

			const results = await this._find(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'rocketId': id }, { $expr: { $ne: [ 'deleted', true ] } } ] });
			if (results && results.length > 0) {
				await this._transactionAbort(correlationId, session, 'Unable to delete the rocket - associated with a rocket setup.');
				return this._errorResponse('RocketSetupsRepository', 'hasRocket', {
						found: results.length,
						results: results
					},
					AppSharedConstants.ErrorCodes.Rockets.IncludedInRocketSetup,
					correlationId);
			}

			return this._success(correlationId);
		}
		catch (err) {
			return this._error('RocketSetupsRepository', 'hasRocket', null, err, null, null, correlationId);
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
			// parts.push(results.altimeters ?? []);
			// parts.push(results.chuteProtectors ?? []);
			// parts.push(results.chuteReleases ?? []);
			// parts.push(results.deploymentBags ?? []);
			// parts.push(results.parachutes ?? []);
			// parts.push(results.recovery ?? []);
			// parts.push(results.streamers ?? []);
			// parts.push(results.trackers ?? []);

			for (const item of results.stages) {
				parts.push(item.altimeters ?? []);
				parts.push(item.chuteProtectors ?? []);
				parts.push(item.chuteReleases ?? []);
				parts.push(item.deploymentBags ?? []);
				parts.push(item.parachutes ?? []);
				parts.push(item.recovery ?? []);
				parts.push(item.streamers ?? []);
				parts.push(item.trackers ?? []);
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
			return this._error('RocketsRepository', 'retrieve', null, err, null, null, correlationId);
		}
	}

	async retrieveGallery(correlationId, id) {
		try {
			const queryA = [ { 
					$match: {
						$and: [
							{ 'id': id },
							{ 'public': true },
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
			if (results.length > 0)
				return this._successResponse(results[0], correlationId);
			
			return this._success(correlationId);
		}
		catch (err) {
			return this._error('RocketsRepository', 'retrieveGallery', null, err, null, null, correlationId);
		}
	}
	
	async retrieveSecurity(correlationId, userId, id) {
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
					'_id': 0,
					'id': 1,
					'ownerId': 1,
					'name': 1
				}
			});

			const collection = await this._getCollectionRockets(correlationId);
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			if (results.length === 0)
				return this._success(correlationId);
			
			results = results[0];

			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('RocketsRepository', 'retrieveSecurity', null, err, null, null, correlationId);
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
					'id': 1,
					'name': 1,
					'description': 1,
					'coverUrl': 1,
					'diameterMajor': 1,
					'length': 1,
					'ownerId': 1,
					'rocketTypes': 1,
					'stages': 1,
					'weight': 1
				}
			});
			queryA.push({
				$project: { 
					'stages.id': 0,
					'stages.altimeters': 0,
					'stages.chuteProtectors': 0,
					'stages.chuteReleases': 0,
					'stages.motors.id': 0,
					'stages.deploymentBags': 0,
					'stages.parachutes': 0,
					'stages.streamers': 0,
					'stages.trackers': 0
				}
			});
	
			const collection = await this._getCollectionRockets(correlationId);
			const results = await this._aggregateExtract2(correlationId, collection, queryA, queryA, this._initResponseExtract(correlationId));
			// for (const result of results.data) {
			// 	result.motors = this._motorDisplay(result);
			// 	delete result.stages;
			// }
			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('RocketsRepository', 'search', null, err, null, null, correlationId);
		}
	}

	async searchGallery(correlationId, params) {
		try {
			const defaultFilter = { 
				$and: [
					{ 'public': true },
					{ 'deleted': { $ne: true } }
				]
			};
	
			const queryF = defaultFilter;
			const queryA = [ {
					$match: defaultFilter
				}
			];
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
			const results = await this._aggregateExtract(correlationId, await this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('RocketsRepository', 'searchGallery', null, err, null, null, correlationId);
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

			// TODO: reorder the stages
			// TODO: lookup each of the setups for this rocket, remove any rocket setup stages that are no longer available and update any numbers.
			// TODO: Save rocket setups

			const responseRetrieve = await this.retrieve(correlationId, userId, rocket.id);
			if (this._hasFailed(responseRetrieve))
				return response;
			response.results = responseRetrieve.results;

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'RocketsRepository', 'update');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}

	// _motorDisplay(item) {
	// 	if (!item || !item.stages)
	// 		return null;
	// 	let output = [];
	// 	for (const stage of item.stages) {
	// 		for (const motor of stage.motors) {
	// 			if (String.isNullOrEmpty(motor.diameter))
	// 				continue;
	// 			output.push({ diameter: motor.diameter, count: motor.count });
	// 		}
	// 	}
	// 	return output;
	// }

	// _stagesDisplay(item) {
	// 	if (!item || !item.stages)
	// 		return null;
	// 	let output = [];
	// 	for (const stage of item.stages) {
	// 		output.push({ diameterMajor: stage.diameterMajor });
	// 	}
	// 	return output;
	// }
}

export default RocketsRepository;
