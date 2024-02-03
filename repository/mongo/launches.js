import AppSharedConstants from 'rocket_sidekick_common/constants.js';

import LibraryMomentUtility from '@thzero/library_common/utility/moment.js';

import AppMongoRepository from './app.js';

class LaunchesRepository extends AppMongoRepository {
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

			const collection = await this._getCollectionLaunches(correlationId);

			const launch = await this._findOne(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'id': id } ] });
			if (!launch)
				return await this._transactionAbort(correlationId, session, 'Unable to delete the launch - not found.');

			launch.deleted = true;
			launch.deletedUserId = userId;
			launch.deletedTimestamp = LibraryMomentUtility.getTimestamp();
			const response = await this._update(correlationId, collection, userId, launch.id, launch);
			if (this._hasFailed(response))
				return await this._transactionAbort(correlationId, session, 'Unable to delete the launch.');

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'LaunchesRepository', 'delete');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}

	async hasChecklist(correlationId, userId, id) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			const collection = await this._getCollectionLaunches(correlationId);

			const results = await this._find(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'locationId': id }, { $expr: { $ne: [ 'deleted', true ] } } ] });
			if (results && results.length > 0) {
				await this._transactionAbort(correlationId, session, 'Unable to delete the checklist - associated with a launch.');
				return this._errorResponse('LaunchesRepository', 'hasChecklist', {
						found: results.length,
						results: results
					},
					AppSharedConstants.ErrorCodes.Checklists.IncludedInLaunch,
					correlationId);
			}

			return this._success(correlationId);
		}
		catch (err) {
			return this._error('LaunchesRepository', 'hasChecklist', null, err, null, null, correlationId);
		}
	}

	async hasLocation(correlationId, userId, id) {
		try {
			const collection = await this._getCollectionLaunches(correlationId);

			const results = await this._find(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'locationId': id }, { $expr: { $ne: [ 'deleted', true ] } } ] });
			if (results && results.length > 0) {
				return this._errorResponse('LaunchesRepository', 'hasLocation', {
						found: results.length,
						results: results
					},
					AppSharedConstants.ErrorCodes.Locations.IncludedInLaunch,
					correlationId);
			}

			return this._success(correlationId);
		}
		catch (err) {
			return this._error('LaunchesRepository', 'hasLocation', null, err, null, null, correlationId);
		}
	}

	async hasRocket(correlationId, userId, id) {
		try {
			const collection = await this._getCollectionLaunches(correlationId);

			const results = await this._find(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'rocketId': id }, { $expr: { $ne: [ 'deleted', true ] } } ] });
			if (results && results.length > 0) {
				return this._errorResponse('LaunchesRepository', 'hasRocket', {
						found: results.length,
						results: results
					},
					AppSharedConstants.ErrorCodes.Rockets.IncludedInLaunch,
					correlationId);
			}

			return this._success(correlationId);
		}
		catch (err) {
			return this._error('LaunchesRepository', 'hasRocket', null, err, null, null, correlationId);
		}
	}

	async hasRocketSetup(correlationId, userId, id) {
		try {
			const collection = await this._getCollectionLaunches(correlationId);

			const results = await this._find(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'rocketSetupId': id }, { $expr: { $ne: [ 'deleted', true ] } } ] });
			if (results && results.length > 0) {
				return this._errorResponse('LaunchesRepository', 'hasRocketSetup', {
						found: results.length,
						results: results
					},
					AppSharedConstants.ErrorCodes.RocketsSetup.IncludedInLaunch,
					correlationId);
			}

			return this._success(correlationId);
		}
		catch (err) {
			return this._error('LaunchesRepository', 'hasRocketSetup', null, err, null, null, correlationId);
		}
	}

	async refreshSearchName(correlationId) {
		return await this._refreshSearchName(correlationId, await this._getCollectionLaunches(correlationId));
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
				'$lookup': {
					from: 'locations',
					localField: 'locationId',
					foreignField: 'id',  
					pipeline: [ {
							$project: {
								'_id': 0,
								'id': 1,
								'address': 1,
								'city': 1,
								'iterations': 1,
								'name': 1
							}
						}
					],
					as: 'locations'
				}
			});
			queryA.push({
				'$lookup': {
					from: 'rockets',
					localField: 'rocketId',
					foreignField: 'id',  
					pipeline: [ {
							$project: {
								'_id': 0,
								'id': 1,
								'name': 1,
								'rocketTypes': 1,
								// 'stages': 1
								'stages.id': 1,
								'stages.description': 1,
								'stages.index': 1,
								'stages.motors': 1,
								'stages.name': 1
							}
						}
					],
					as: 'rockets'
				}
			});
			queryA.push({
				'$lookup': {
					from: 'rocketSetups',
					localField: 'rocketSetupId',
					foreignField: 'id',  
					pipeline: [ {
							$project: {
								'_id': 0,
								'id': 1,
								'name': 1,
								// 'stages': 1,
								'stages.id': 1,
								'stages.description': 1,
								'stages.index': 1,
								'stages.motors': 1,
								'stages.name': 1
							}
						}
					],
					as: 'rocketSetups'
				}
			});
			queryA.push({
				'$addFields': {
					'location': {
						'$arrayElemAt': [
							'$locations', 0
						]
					},
					'rocketSetup': {
						'$arrayElemAt': [
							'$rocketSetups', 0
						]
					}
				}
			});
			queryA.push({
				'$addFields': {
					'rocketSetup.motors': {
						'$setDifference': [ {
									'$setUnion': [ {
										'$reduce': {
											'input': '$rocketSetup.stages.motors',
											'initialValue': [],
											'in': { 
												'$concatArrays': [ '$$value', '$$this.motorId' ] 
											}
										}
									}
								]
							}, 
							[ null ] 
						]
					},
					'rocketSetup.motorCases': {
						'$setDifference': [ {
									'$setUnion': [ {
										'$reduce': {
											'input': '$rocketSetup.stages.motors',
											'initialValue': [],
											'in': { 
												'$concatArrays': [ '$$value', '$$this.motorCaseId' ] 
											}
										}
									}
								]
							}, 
							[ null ] 
						]
					},
					'rocketSetup.rocket': {
						'$arrayElemAt': [
							'$rockets', 0
						]
					}
				}
			});
			queryA.push({
				'$lookup': {
					'from': 'parts',
					'localField': 'rocketSetup.motors',
					'foreignField': 'id',
					'pipeline': [
						{ '$project': { '_id': 0, 'motorId': 1, 'designation': 1, 'manufacturer': 1, 'manufacturerAbbrev': 1 } },
					],
					'as': 'rocketSetup.motors'
				}
			});
			queryA.push({
				'$lookup': {
					'from': 'parts',
					'localField': 'rocketSetup.motorCases',
					'foreignField': 'id',
					'pipeline': [
						{ '$project': { '_id': 0, 'id': 1, 'name': 1, 'manufacturer': 1 } },
					],
					'as': 'rocketSetup.motorCases'
				}
			});
			queryA.push({
				$project: { 
					'_id': 0,
					locations: 0,
					rockets: 0,
					rocketSetups: 0
				}
			});

			const collection = await this._getCollectionLaunches(correlationId);
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			if (results.length === 0)
				return this._success(correlationId);
			
			results = results[0];

			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('LaunchesRepository', 'retrieve', null, err, null, null, correlationId);
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

			const collection = await this._getCollectionLaunches(correlationId);
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			if (results.length === 0)
				return this._success(correlationId);
			
			results = results[0];

			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('LaunchesRepository', 'retrieveSecurity', null, err, null, null, correlationId);
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

			if (!String.isNullOrEmpty(params.launchId))
				where.push({ 'id': params.launchId });

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
				'$lookup': {
					from: 'locations',
					localField: 'locationId',
					foreignField: 'id',  
					pipeline: [ {
							$project: {
								'_id': 0,
								'id': 1,
								'address': 1,
								'city': 1,
								'iterations': 1,
								'name': 1
							}
						}
					],
					as: 'locations'
				}
			});
			queryA.push({
				'$lookup': {
					from: 'rockets',
					localField: 'rocketId',
					foreignField: 'id',  
					pipeline: [ {
							$project: {
								'_id': 0,
								'id': 1,
								'coverUrl': 1,
								'name': 1,
								'rocketTypes': 1,
								'stages': 1
							}
						}
					],
					as: 'rockets'
				}
			});
			queryA.push({
				'$lookup': {
					from: 'rocketSetups',
					localField: 'rocketSetupId',
					foreignField: 'id',  
					pipeline: [ {
							$project: {
								'_id': 0,
								'id': 1,
								'name': 1,
								// 'stages': 1,
								'stages.id': 1,
								'stages.description': 1,
								'stages.index': 1,
								'stages.motors': 1,
								'stages.name': 1
							}
						}
					],
					as: 'rocketSetups'
				}
			});
			queryA.push({
				'$addFields': {
					'location': {
						'$arrayElemAt': [
							'$locations', 0
						]
					},
					'rocketSetup': {
						'$arrayElemAt': [
							'$rocketSetups', 0
						]
					}
				}
			});
			queryA.push({
				'$addFields': {
					'rocketSetup.motors': {
						'$setDifference': [ {
									'$setUnion': [ {
										'$reduce': {
											'input': '$rocketSetup.stages.motors',
											'initialValue': [],
											'in': { 
												'$concatArrays': [ '$$value', '$$this.motorId' ] 
											}
										}
									}
								]
							}, 
							[ null ] 
						]
					},
					'rocketSetup.motorCases': {
						'$setDifference': [ {
									'$setUnion': [ {
										'$reduce': {
											'input': '$rocketSetup.stages.motors',
											'initialValue': [],
											'in': { 
												'$concatArrays': [ '$$value', '$$this.motorCaseId' ] 
											}
										}
									}
								]
							}, 
							[ null ] 
						]
					},
					'rocketSetup.rocket': {
						'$arrayElemAt': [
							'$rockets', 0
						]
					}
				}
			});
			queryA.push({
				'$lookup': {
					'from': 'parts',
					'localField': 'rocketSetup.motors',
					'foreignField': 'id',
					'pipeline': [
						{ '$project': { '_id': 0, 'motorId': 1, 'designation': 1, 'manufacturer': 1, 'manufacturerAbbrev': 1 } },
					],
					'as': 'rocketSetup.motors'
				}
			});
			queryA.push({
				'$lookup': {
					'from': 'parts',
					'localField': 'rocketSetup.motorCases',
					'foreignField': 'id',
					'pipeline': [
						{ '$project': { '_id': 0, 'id': 1, 'name': 1, 'manufacturer': 1 } },
					],
					'as': 'rocketSetup.motorCases'
				}
			});
			queryA.push({
				$project: { 
					'locations': 0,
					'rockets': 0,
					'rocketSetups': 0
				}
			});
			queryA.push({
				$addFields: {
					'location.iteration': {
						$arrayElemAt: [ 
							{ 
								$filter: {
									input: '$location.iterations',
									cond: { 
										$and: [
											{ $eq: [ "$$this.id", "$locationIterationId" ] },
										] 
									}
								}
							}, 
							0
						] 
					}
				}
			});
			queryA.push({
				$project: { 
					'_id': 0,
					'location.iterations': 0
				}
			});
	
			const collection = await this._getCollectionLaunches(correlationId);
			const results = await this._aggregateExtract2(correlationId, collection, queryA, queryA, this._initResponseExtract(correlationId));
			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('LaunchesRepository', 'search', null, err, null, null, correlationId);
		}
	}

	async update(correlationId, userId, launch) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionLaunches(correlationId);
			const response = this._initResponse(correlationId);

			launch.ownerId = userId;
			launch.searchName = this._createEdgeNGrams(correlationId, launch.name);
			await this._update(correlationId, collection, userId, launch.id, launch);

			const responseRetrieve = await this.retrieve(correlationId, userId, launch.id);
			if (this._hasFailed(responseRetrieve))
				return response;
			response.results = responseRetrieve.results;

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'LaunchesRepository', 'update');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}
}

export default LaunchesRepository;
