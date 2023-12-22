import AppSharedConstants from 'rocket_sidekick_common/constants.js';

import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

import AppMongoRepository from './app.js';

class ChecklistsRepository extends AppMongoRepository {
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

			const collection = await this._getCollectionChecklists(correlationId);

			// const response = await this._delete(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'id': id } ] });
			const checklist = await this._findOne(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'id': id } ] });
			if (!checklist)
				return await this._transactionAbort(correlationId, session, 'Unable to delete the checklist - not found.');

			checklist.deleted = true;
			checklist.deletedUserId = userId;
			checklist.deletedTimestamp = LibraryCommonUtility.getTimestamp();
			const response = await this._update(correlationId, collection, userId, checklist.id, checklist);
			if (this._hasFailed(response))
				return await this._transactionAbort(correlationId, session, 'Unable to delete the checklist.');

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'ChecklistsRepository', 'delete');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}

	async hasLaunch(correlationId, userId, id) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			const collection = await this._getCollectionChecklists(correlationId);

			const results = await this._find(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'locationId': id }, { $expr: { $ne: [ 'deleted', true ] } } ] });
			if (results && results.length > 0) {
				await this._transactionAbort(correlationId, session, 'Unable to delete the launch - associated with a checklist.');
				return this._errorResponse('ChecklistsRepository', 'hasLaunch', {
						found: results.length,
						results: results
					},
					AppSharedConstants.ErrorCodes.Launches.IncludedInChecklist,
					correlationId);
			}

			return this._success(correlationId);
		}
		catch (err) {
			return this._error('ChecklistsRepository', 'hasLaunch', null, err, null, null, correlationId);
		}
	}

	async hasLocation(correlationId, userId, id) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			const collection = await this._getCollectionChecklists(correlationId);

			const results = await this._find(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'locationId': id }, { $expr: { $ne: [ 'deleted', true ] } } ] });
			if (results && results.length > 0) {
				await this._transactionAbort(correlationId, session, 'Unable to delete the location - associated with a checklist.');
				return this._errorResponse('ChecklistsRepository', 'hasLocation', {
						found: results.length,
						results: results
					},
					AppSharedConstants.ErrorCodes.Locations.IncludedInChecklist,
					correlationId);
			}

			return this._success(correlationId);
		}
		catch (err) {
			return this._error('ChecklistsRepository', 'hasLocation', null, err, null, null, correlationId);
		}
	}

	async hasRocket(correlationId, userId, id) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			const collection = await this._getCollectionChecklists(correlationId);

			const results = await this._find(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'rocketId': id }, { $expr: { $ne: [ 'deleted', true ] } } ] });
			if (results && results.length > 0) {
				await this._transactionAbort(correlationId, session, 'Unable to delete the rocket - associated with a checklist.');
				return this._errorResponse('ChecklistsRepository', 'hasRocket', {
						found: results.length,
						results: results
					},
					AppSharedConstants.ErrorCodes.Rockets.IncludedInChecklist,
					correlationId);
			}

			return this._success(correlationId);
		}
		catch (err) {
			return this._error('ChecklistsRepository', 'hasRocket', null, err, null, null, correlationId);
		}
	}

	async hasRocketSetup(correlationId, userId, id) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			const collection = await this._getCollectionChecklists(correlationId);

			const results = await this._find(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'rocketSetupId': id }, { $expr: { $ne: [ 'deleted', true ] } } ] });
			if (results && results.length > 0) {
				await this._transactionAbort(correlationId, session, 'Unable to delete the rocket setup - associated with a checklist.');
				return this._errorResponse('ChecklistsRepository', 'hasRocketSetup', {
						found: results.length,
						results: results
					},
					AppSharedConstants.ErrorCodes.RocketSetups.IncludedInChecklist,
					correlationId);
			}

			return this._success(correlationId);
		}
		catch (err) {
			return this._error('ChecklistsRepository', 'hasRocketSetup', null, err, null, null, correlationId);
		}
	}

	async retrieve(correlationId, userId, id) {
		this._enforceNotEmpty('ChecklistsRepository', 'retrieveShared', id, 'ownerId', correlationId);

		try {
			const queryA = [ { 
					$match: {
						$or: [
							{
								$and: [
									{ 'id': id },
									{ 'ownerId': userId },
									{ 'deleted': { $ne: true } }
								]
							},
							{
								$and: [
									{ 'id': id },
									{ 'isDefault': true },
									{ 'deleted': { $ne: true } }
								]
							}
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
	
			const collection = await this._getCollectionChecklists(correlationId);
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			if (results.length > 0)
				return this._successResponse(results[0], correlationId);
				
			return this._success(correlationId);
		}
		catch (err) {
			return this._error('ChecklistsRepository', 'retrieve', null, err, null, null, correlationId);
		}
	}

	async refreshSearchName(correlationId) {
		return await this._refreshSearchName(correlationId, await this._getCollectionChecklists(correlationId));
	}
	
	async retrieveSecurity(correlationId, userId, id) {
		try {
			const queryA = [ { 
					$match: {
						$and: [
							{ 'id': id },
							{
								$or: [
									{ 'ownerId': userId },
									{ 'isDefault': { $ne: false } }
								]
							},
							{ 'deleted': { $ne: true } }
						]
					}
				}
			];
			queryA.push({
				$project: { 
					'_id': 0,
					'id': 1,
					'isDefault': 1,
					'ownerId': 1,
					'public': 1,
					'name': 1
				}
			});

			const collection = await this._getCollectionChecklists(correlationId);
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			if (results.length === 0)
				return this._success(correlationId);
			
			results = results[0];

			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('ChecklistsRepository', 'retrieveSecurity', null, err, null, null, correlationId);
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

			const defaultFilterOwner = [];

			if (params.yours)
				defaultFilterOwner.push({ 'ownerId': userId });
			if (params.isDefault)
				defaultFilterOwner.push({ 'isDefault': true });
			if (params.shared)
				defaultFilterOwner.push({ 'shared': true });
				
			const defaultFilterAnd = [
				{ 
					$or: defaultFilterOwner
				},
				{ 'deleted': { $ne: true } }
			];

			const defaultFilter = { 
				$and: defaultFilterAnd
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
					'typeId': 1,
					'isDefault': 1,
					'launchTypeId': 1,
					'locationId': 1,
					'locationIterationId': 1,
					'rocketId': 1,
					'rocketSetupId': 1,
					'statusId': 1,
					'ownerId': 1
				}
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

			const collection = await this._getCollectionChecklists(correlationId);
			// const results = await this._aggregateExtract(correlationId, await this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
			const results = await this._aggregateExtract2(correlationId, collection, queryA, queryA, this._initResponseExtract(correlationId));
			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('ChecklistsRepository', 'search', null, err, null, null, correlationId);
		}
	}

	async update(correlationId, userId, checklist) {
		const client = await this._getClient(correlationId);
		const session = await this._transactionInit(correlationId, client);
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionChecklists(correlationId);
			const response = this._initResponse(correlationId);

			checklist.ownerId = userId;
			checklist.searchName = this._createEdgeNGrams(correlationId, checklist.name);
			await this._update(correlationId, collection, userId, checklist.id, checklist);
			response.results = checklist;

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'ChecklistsRepository', 'update');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}
}

export default ChecklistsRepository;
