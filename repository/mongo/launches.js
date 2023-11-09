import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

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
			launch.deletedTimestamp = LibraryCommonUtility.getTimestamp();
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
								'_id': 0
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
								'stages': 1
								// 'stages.id': 1,
								// 'stages.name': 1,
								// 'stages.index': 1,
								// 'stages.description': 1
							}
						}
					],
					as: 'rockets'
				}
			});
			queryA.push({
				'$addFields': {
					'rocket': {
						'$arrayElemAt': [
							'$rockets', 0
						]
					},
					'location': {
						'$arrayElemAt': [
							'$locations', 0
						]
					}
				}
			});
			queryA.push({
				$project: { 
					'_id': 0,
					locations: 0,
					rockets: 0
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
				'$lookup': {
					from: 'locations',
					localField: 'locationId',
					foreignField: 'id',  
					pipeline: [ {
							$project: {
								'_id': 0
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
								'rocketTypes': 1
							}
						}
					],
					as: 'rockets'
				}
			});
			queryA.push({
				'$addFields': {	
					'rocket': {
						'$arrayElemAt': [
							'$rockets', 0
						]
					},
					'location': {
						'$arrayElemAt': [
							'$locations', 0
						]
					}
				}
			});
			queryA.push({
				$project: { 
					'locations': 0,
					'rockets': 0
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
