import Constants from '../../constants.js';
import AppSharedConstants from 'rocket_sidekick_common/constants.js';

import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

import AppMongoRepository from './app.js';

class RocketSetupsRepository extends AppMongoRepository {
	constructor() {
		super();
		
		this._serviceManufacturers = null;
		this._ownerId = null;
	}

	async init(injector) {
		await super.init(injector);

		this._ownerId = this._config.get('ownerId');
		this._serviceManufacturers = this._injector.getService(Constants.InjectorKeys.SERVICE_MANUFACTURERS);
	}

	async delete(correlationId, userId, id) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionRocketSetups(correlationId);

			const collectionChecklists = await this._getCollectionChecklists(correlationId);
			
			const results = await this._find(correlationId, collectionChecklists, { $and: [ { 'ownerId' : userId }, { 'rocketId': id }, { $expr: { $ne: [ 'deleted', true ] } } ] });
			if (results && results.length > 0) {
				await this._transactionAbort(correlationId, session, 'Unable to delete the rocket setup. - associated with a checklist');
				return this._errorResponse('RocketsRepository', 'delete', {
						found: results.length,
						results: results
					},
					AppSharedConstants.ErrorCodes.Rockets.IncludedInChecklist,
					correlationId);
			}

			const rocketSetup = await this._findOne(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'id': id } ] });
			if (!rocketSetup)
				return await this._transactionAbort(correlationId, session, 'Unable to delete the rocket setup - not found.');

			rocketSetup.deleted = true;
			rocketSetup.deletedUserId = userId;
			rocketSetup.deletedTimestamp = LibraryCommonUtility.getTimestamp();
			const response = await this._update(correlationId, collection, userId, rocketSetup.id, rocketSetup);
			if (this._hasFailed(response))
				return await this._transactionAbort(correlationId, session, 'Unable to delete the rocket setup.');

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
		return await this._refreshSearchName(correlationId, await this._getCollectionRocketSetups(correlationId));
	}
	
	async retrieve(correlationId, userId, id) {
		try {
			const responseManufacturers = await this._serviceManufacturers.listing(correlationId);
			if (this._hasFailed(responseManufacturers))
				return responseManufacturers;

			const manufacturers = responseManufacturers.results.data;

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
					}
				}
			});
			// queryA.push({
			// 	'$addFields': {
			// 		'rocketName': '$rocket.name',
			// 		'rocketTypes': '$rocket.rocketTypes',
			// 		'rocketStages': '$rocket.stages'
			// 	}
			// });
			queryA.push({
				$project: { 
					'_id': 0,
					rockets: 0
				}
			});

			const collection = await this._getCollectionRocketSetups(correlationId);
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			if (results.length === 0)
				return this._success(correlationId);
			
			results = results[0];
			
			const parts = [];
			const motorIds = [];
			const motorCaseIds = [];

			const stages = [...results.stages, ...results.rocket.stages];
			for (const item of stages) {
				parts.push(item.altimeters ?? []);
				parts.push(item.chuteProtectors ?? []);
				parts.push(item.chuteReleases ?? []);
				parts.push(item.deploymentBags ?? []);
				parts.push(item.parachutes ?? []);
				parts.push(item.recovery ?? []);
				parts.push(item.streamers ?? []);
				parts.push(item.trackers ?? []);

				if (item.motors) {
					for (const motor of item.motors) {
						if (motor.motorId)
							motorIds.push({ 'id': motor.motorId });
						if (motor.motorCaseId)
							motorCaseIds.push({ 'id': motor.motorCaseId });
					}
				}
			}

			let partIds = [];
			parts.map(l => { 
				partIds.push(...l.map(j => { return { 'id': j.itemId }; }));
			});
			partIds.push(...motorIds);
			partIds.push(...motorCaseIds);
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

			// let item;
			let temp;
			// for (const set of parts) {
			// 	for (let i = 0; i < set.length; i++) {
			// 		item = set[i];
			// 		temp = results2.find(l => l.id === item.itemId);
			// 		if (!temp)
			// 			continue;

			// 		temp = LibraryCommonUtility.cloneDeep(temp);
			// 		temp.fromRocket = true;
			// 		set[i] = Object.assign(temp, item);
			// 	}
			// }

			const updateStagePart = (stageParts, fromRocket) => {
				for (let part of stageParts) {
					temp = results2.find(l => l.id === part.itemId);
					if (!temp)
						continue;

					temp = LibraryCommonUtility.cloneDeep(temp);
					part  =LibraryCommonUtility.merge2(part, temp);
					temp.fromRocket = fromRocket;
				}
			};
			const updateStageParts = (stage, fromRocket) => {
				updateStagePart(stage.altimeters ?? [], fromRocket);
				updateStagePart(stage.chuteProtectors ?? [], fromRocket);
				updateStagePart(stage.chuteReleases ?? [], fromRocket);
				updateStagePart(stage.deploymentBags ?? [], fromRocket);
				updateStagePart(stage.parachutes ?? [], fromRocket);
				updateStagePart(stage.recovery ?? [], fromRocket);
				updateStagePart(stage.streamers ?? [], fromRocket);
				updateStagePart(stage.trackers ?? [], fromRocket);
			};
			const fetchManufacturer = (func, id) => {
				const temp = manufacturers.find(l => l.id === id);
				if (temp)
					func(temp.id, temp.name, temp.abbrev);
			};

			if (results.stages) {
				for (const item of results.stages) {
					updateStageParts(item, false);

					if (!item.motors)
						continue;

					for (const motor of item.motors) {
						if (motor.motorId) {
							temp = results2.find(l => l.id === motor.motorId);
							if (temp) {
								motor.motorName = temp.name;
	
								fetchManufacturer((id, name, abbrev) => {
									motor.motorManufacturerId = id;
								}, temp.manufacturerId);
							}
						}
						if (motor.motorCaseId) {
							temp = results2.find(l => l.id === motor.motorCaseId);
							if (temp) {
								motor.motorCaseName = temp.name;
	
								fetchManufacturer((id, name, abbrev) => {
									motor.motorCaseManufacturerId = id;
								}, temp.manufacturerId);
							}
						}
					}
				}
			}
			

			if (results.rocket.stages) {
				for (const item of results.rocket.stages)
					updateStageParts(item, true);
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
			
			// TODO: against rocket..
			// if (params.manufacturers && params.manufacturers.length > 0) {
			// 	const arr = [];
			// 	params.manufacturers.forEach(element => {
			// 		arr.push({ 'manufacturerId': element });
			// 	});
			// 	where.push({ $or: arr});
			// }
			
			// TODO: against rocket..
			// if (!String.isNullOrEmpty(params.manufacturerStockId))
			// 	where.push({ 'manufacturerStockId': params.manufacturerStockId });
			
			// TODO: against rocket..
			// if (params.rocketTypes && params.rocketTypes.length > 0) {
			// 	const arr = [];
			// 	params.rocketTypes.forEach(element => {
			// 		arr.push({ 'typeId': element });
			// 	});
			// 	where.push({ $or: arr});
			// }
			
			if (!String.isNullOrEmpty(params.rocketId))
				where.push({ 'rocketId': params.rocketId });

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
					}
				}
			});
			queryA.push({
				$project: { 
					'_id': 0,
					'rockets': 0
				}
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
					'weight': 1,
					'rocket.id': 1,
					'rocket.name': 1,
					'rocket.rocketTypes': 1
				}
			});
	
			const collection = await this._getCollectionRocketSetups(correlationId);
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

			const collection = await this._getCollectionRocketSetups(correlationId);
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
