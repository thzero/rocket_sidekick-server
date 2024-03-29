import AppConstants from '../../constants.js';
import AppSharedConstants from 'rocket_sidekick_common/constants.js';

import ConvertUtility from 'rocket_sidekick_common/utility/convert.js';
import LibraryMomentUtility from '@thzero/library_common/utility/moment.js';

import AppMongoRepository from './app.js';

class PartsRepository extends AppMongoRepository {
	constructor() {
		super();
		
		this._ownerId = null;
		
		this._serviceManufacturers = null;
	}

	async init(injector) {
		await super.init(injector);

		this._ownerId = this._config.get('ownerId');
		
		this._serviceManufacturers = this._injector.getService(AppConstants.InjectorKeys.SERVICE_MANUFACTURERS);
	}

	async delete(correlationId, userId, id) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionParts(correlationId);

			const part = await this._findOne(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'id': id } ] });
			if (!part)
				return await this._transactionAbort(correlationId, session, 'Unable to delete the part - not found.');

			part.deleted = true;
			part.deletedUserId = userId;
			part.deletedTimestamp = LibraryMomentUtility.getTimestamp();
			const response = await this._update(correlationId, collection, userId, part.id, part);
			if (this._hasFailed(response))
				return await this._transactionAbort(correlationId, session, 'Unable to delete the part.');

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'PartsRepository', 'delete');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}

	async isPublic(correlationId, part) {
		const collection = await this._getCollectionParts(correlationId);

		const results = await this._findOne(correlationId, collection, { $and: [ { 'id': part.id }, { $expr: { $ne: [ 'public', true ] } }, { $expr: { $ne: [ 'deleted', true ] } } ] });
		if (results)
			return this._error('PartsRepository', 'update', null, null, AppSharedConstants.ErrorCodes.Parts.UpdatePublic, null, correlationId);
		return this._success(correlationId);
	}

	async listing(correlationId, params) {
		try {
			const defaultFilter = { 
				// $and: [
				// 	{ 
				// 		$or: [
				// 			{ 'ownerId': this._ownerId },
				// 			{ 'public': true }
				// 		]
				// 	},
				// 	{ $expr: { $ne: [ 'deleted', true ] } 
				// ]
			};
	
			const queryF = defaultFilter;
			const queryA = [ {
					$match: defaultFilter
				}
			];
			queryA.push({
				$project: { 
					'_id': 0,
					// 'id': 1,
					// 'tcId': 1,
					// 'external': 1,
					// 'name': 1,
					// 'ownerId': 1,
					// 'public': 1,
					// 'typeId': 1
				}
			});
	
			const collection = await this._getCollectionParts(correlationId);
			// const results = await this._aggregateExtract(correlationId, await this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
			const results = await this._aggregateExtract2(correlationId, collection, queryA, queryA, this._initResponseExtract(correlationId));
			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('PartsRepository', 'listing', null, err, null, null, correlationId);
		}
	}

	async refreshSearchName(correlationId) {
		return await this._refreshSearchName(correlationId, await this._getCollectionParts(correlationId));
	}

	async retrieve(correlationId, userId, id) {
		try {
			let or = { 'public': { $eq: true } };
			if (userId) {
				or = {
						$or: [
						{ 'ownerId': userId },
						{ 'public': { $eq: true } }
					]
				};
			}
			
			const queryA = [ { 
					$match: {
						$and: [
							{ 'id': id },
							// { 
							// 	$or: [
							// 		{ 'ownerId': userId },
							// 		{ 'public': { $eq: true } }
							// 	]
							// },
							or,
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
	
			const collection = await this._getCollectionParts(correlationId);
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			if (results.length > 0)
				return this._successResponse(results[0], correlationId);
			
			return this._success(correlationId);
		}
		catch (err) {
			return this._error('PartsRepository', 'retrieve', null, err, null, null, correlationId);
		}
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
									{ 'public': { $ne: false } }
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
					'ownerId': 1,
					'isDefault': 1,
					'name': 1
				}
			});

			const collection = await this._getCollectionParts(correlationId);
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			if (results.length === 0)
				return this._success(correlationId);
			
			results = results[0];

			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('PartsRepository', 'retrieveSecurity', null, err, null, null, correlationId);
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
			
			where.push({ 'typeId': params.typeId });
			
			if (params.public !== null && params.public === 3)
				where.push({ 'public': true });
			
			if (params.impulseClass) {
				const arr = [];
				params.impulseClass.forEach(element => {
					arr.push({ 'impulseClass': element });
				});
				where.push({ $or: arr});
			}

			// Convert parameter to metric and then use metric comparisons...
			if (params.motorSearch !== true && !String.isNullOrEmpty(params.diameter)) {
				const metric = ConvertUtility.convertMeasurementPart(correlationId, params.diameter, params.diameterMeasurementUnitId, 'diameter');
				where.push({ 'diameterMetric': metric });
			}
			
			if (params.motorSearch !== true && params.manufacturers && params.manufacturers.length > 0) {
				const arr = [];
				params.manufacturers.forEach(element => {
					arr.push({ 'manufacturerId': element });
				});
				where.push({ $or: arr});
			}
			
			if (params.motorSearch !== true && !String.isNullOrEmpty(params.manufacturerStockId))
				where.push({ 'manufacturerStockId': params.manufacturerStockId });

			this._partsFiltering(correlationId, params, where);

			let or = { 'public': { $eq: true } };
			if (userId) {
				or = {
						$or: [
						{ 'ownerId': userId },
						{ 'public': { $eq: true } }
					]
				};
			}

			const defaultFilter = { 
				$and: [
					or,
					{ 'deleted': { $ne: true } },
					...where
				],
			};
	
			queryA.push({
				$match: defaultFilter
			});
			queryA.push({
				$project: { 
					'_id': 0,
					'data': 0
				}
			});
	
			const collection = await this._getCollectionParts(correlationId);
			const results = await this._aggregateExtract2(correlationId, collection, queryA, queryA, this._initResponseExtract(correlationId));
			
			if (userId) {
				const queryI = [ { 
						$match: { 'ownerId': userId }
					}
				];
				const collectionI = await this._getCollectionInventory(correlationId);
				let resultsI = await this._aggregate(correlationId, collectionI, queryI);
				resultsI = await resultsI.toArray();
				let inventory = { types: [] };
				if (resultsI && resultsI.length > 0)
					inventory = resultsI[0];
				inventory.types = inventory.types ?? [];
	
				let itemI;
				let typeI;
				for (const item of results.data) {
					typeI = inventory.types.find(l => l.typeId === item.typeId);
					if (typeI) {
						typeI.items = typeI.items ?? [];
						itemI = typeI.items.find(l => l.itemId === item.id);
						if (itemI)
							item.quantity = itemI.quantity;
					}
				}
			}

			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('PartsRepository', 'search', null, err, null, null, correlationId);
		}
	}

	async searchSetsRocket(correlationId, userId, params) {
		try {
			const types = [];
			if ((params.partTypes ?? []).indexOf(AppSharedConstants.Rocketry.PartTypes.altimeter) > -1)
				types.push(AppSharedConstants.Rocketry.PartTypes.altimeter);
			if ((params.partTypes ?? []).indexOf(AppSharedConstants.Rocketry.PartTypes.chuteProtector) > -1)
				types.push(AppSharedConstants.Rocketry.PartTypes.chuteProtector);
			if ((params.partTypes ?? []).indexOf(AppSharedConstants.Rocketry.PartTypes.chuteRelease) > -1)
				types.push(AppSharedConstants.Rocketry.PartTypes.chuteRelease);
			if ((params.partTypes ?? []).indexOf(AppSharedConstants.Rocketry.PartTypes.deploymentBag) > -1)
				types.push(AppSharedConstants.Rocketry.PartTypes.deploymentBag);
			if ((params.partTypes ?? []).indexOf(AppSharedConstants.Rocketry.PartTypes.motor) > -1)
				types.push(AppSharedConstants.Rocketry.PartTypes.motor);
			if ((params.partTypes ?? []).indexOf(AppSharedConstants.Rocketry.PartTypes.motorCase) > -1)
				types.push(AppSharedConstants.Rocketry.PartTypes.motorCase);
			if ((params.partTypes ?? []).indexOf(AppSharedConstants.Rocketry.PartTypes.parachute) > -1)
				types.push(AppSharedConstants.Rocketry.PartTypes.parachute);
			if ((params.partTypes ?? []).indexOf(AppSharedConstants.Rocketry.PartTypes.streamer) > -1)
				types.push(AppSharedConstants.Rocketry.PartTypes.streamer);
			if ((params.partTypes ?? []).indexOf(AppSharedConstants.Rocketry.PartTypes.tracker) > -1)
				types.push(AppSharedConstants.Rocketry.PartTypes.tracker);

			return this._searchSets(correlationId, userId, params, types);
		}
		catch (err) {
			return this._error('PartsRepository', 'searchSetsRocket', null, err, null, null, correlationId);
		}
	}

	async sync(correlationId, parts, deleted) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionParts(correlationId);
			const response = this._initResponse(correlationId);

			for (const part of deleted) {
				part.deleted = true;
				part.deletedUserId = this._ownerId;
				part.deletedTimestamp = LibraryMomentUtility.getTimestamp();
				const response = await this._update(correlationId, collection, this._ownerId, part.id, part);
				if (this._hasFailed(response))
					return await this._transactionAbort(correlationId, session, 'Unable to delete the part.');
			}

			for (const part of parts) {
				const response = await this._update(correlationId, collection, this._ownerId, part.id, part);
				if (this._hasFailed(response))
					return await this._transactionAbort(correlationId, session, 'Unable to update the part.');
			}

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'PartsRepository', 'sync');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}

	async update(correlationId, userId, part) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionParts(correlationId);
			const response = this._initResponse(correlationId);

			part.ownerId = userId;
			part.searchName = this._createEdgeNGrams(correlationId, part.name);
			await this._update(correlationId, collection, userId, part.id, part);
			response.results = part;

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'PartsRepository', 'update');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}

	async updateMeasurementToMetrics(correlationId) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionParts(correlationId);
			const response = this._initResponse(correlationId);

			const queryA = [];

			const defaultFilter = { 
				$and: [
					{ 'deleted': { $ne: true } }
				],
			};
	
			queryA.push({
				$match: defaultFilter
			});
			queryA.push({
				$project: { 
					'_id': 0
				}
			});
	
			const results = await this._aggregateExtract2(correlationId, collection, queryA, queryA, this._initResponseExtract(correlationId));if (results.data.length === 0)
			if (results.data.length === 0)
				return this._successResponse(results, correlationId);

			let updated = false;
			for (const part of results.data) {
				updated = ConvertUtility.convertMeasurementsForComparisonPart(correlationId, part);
				if (updated)
					await this._update(correlationId, collection, this._ownerId, part.id, part);
			}

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'PartsRepository', 'updateMeasurementToMetrics');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}

	_partsFiltering(correlationId, params, where) {
		if (params.typeId === AppSharedConstants.Rocketry.PartTypes.altimeter) {
			return;
		}
		if (params.typeId === AppSharedConstants.Rocketry.PartTypes.chuteProtector) {
			return;
		}
		if (params.typeId === AppSharedConstants.Rocketry.PartTypes.chuteRelease) {
			return;
		}
		if (params.typeId === AppSharedConstants.Rocketry.PartTypes.deploymentBag) {
			if (params.pilotChute)
				where.push({ 'pilotChute': params.pilotChute });
			return;
		}
		if (params.typeId === AppSharedConstants.Rocketry.PartTypes.motor) {
			return;
		}
		if (params.typeId === AppSharedConstants.Rocketry.PartTypes.motorCase) {
			return;
		}
		if (params.typeId === AppSharedConstants.Rocketry.PartTypes.parachute) {
			if (params.thinMill)
				where.push({ 'thinMill': params.thinMill });
			return;
		}
		if (params.typeId === AppSharedConstants.Rocketry.PartTypes.streamer) {
			return;
		}
		if (params.typeId === AppSharedConstants.Rocketry.PartTypes.tracker) {
			return;
		}

		return null;
	}

	async _searchSets(correlationId, userId, params, types, additional) {
		try {
			const responseManufacturers = await this._serviceManufacturers.listing(correlationId);
			if (this._hasFailed(responseManufacturers))
				return responseManufacturers;

			const manufacturers = responseManufacturers.results.data;

			const queryA = [];

			if (!String.isNullOrEmpty(params.name)) {
				queryA.push(
					this._searchFilterText(correlationId, params.name),
				);
			}

			const where = [];
			
			if (params.public !== null && params.public === 3)
				where.push({ 'public': true });
			
			if (types && types.length > 0) {
				const arr = [];
				types.forEach(element => {
					arr.push({ 'typeId': element });
				});
				where.push({ $or: arr});
			}
			
			if (!String.isNullOrEmpty(params.manufacturerId))
				where.push({ 'manufacturerId': params.manufacturerId });
			
			if (!String.isNullOrEmpty(params.manufacturerStockId))
				where.push({ 'manufacturerStockId': params.manufacturerStockId });
			
			if (params.manufacturers && params.manufacturers.length > 0) {
				const arr = [];
				params.manufacturers.forEach(element => {
					arr.push({ 'manufacturerId': element });
				});
				where.push({ $or: arr});
			}
			
			// Convert parameter to metric and then use metric comparisons...
			if (!String.isNullOrEmpty(params.diameterMax) && !String.isNullOrEmpty(params.diameterMin)) {
				const metricMax = ConvertUtility.convertMeasurementPart(correlationId, params.diameterMax, params.diameterMeasurementUnitId, 'diameter');
				const metricMin = ConvertUtility.convertMeasurementPart(correlationId, params.diameterMin, params.diameterMeasurementUnitId, 'diameter');
				where.push({
					'diameterMetric': { '$gte': metricMin, '$lte': metricMax }
				});
			}
			else if (!String.isNullOrEmpty(params.diameterMax)) {
				const metric = ConvertUtility.convertMeasurementPart(correlationId, params.diameterMax, params.diameterMeasurementUnitId, 'diameter');
				where.push({ 'diameterMetric': { '$lte': metric } });
			}
			else if (!String.isNullOrEmpty(params.diameterMin)) {
				const metric = ConvertUtility.convertMeasurementPart(correlationId, params.diameterMin, params.diameterMeasurementUnitId, 'diameter');
				where.push({ 'diameterMetric': { '$gte': metric } });
			}
			
			// Convert parameter to metric and then use metric comparisons...
			if (!String.isNullOrEmpty(params.lengthMax) && !String.isNullOrEmpty(params.lengthMin)) {
				const metricMax = ConvertUtility.convertMeasurementPart(correlationId, params.lengthMax, params.lengthMeasurementUnitId, 'length');
				const metricMin = ConvertUtility.convertMeasurementPart(correlationId, params.lengthMin, params.lengthMeasurementUnitId, 'length');
				where.push({
					'lengthMetric': { '$gte': metricMin, '$lte': metricMax }
				});
			}
			else if (!String.isNullOrEmpty(params.lengthMax)) {
				const metric = ConvertUtility.convertMeasurementPart(correlationId, params.lengthMax, params.lengthMeasurementUnitId, 'length');
				where.push({ 'lengthMetric': { '$lte': metric } });
			}
			else if (!String.isNullOrEmpty(params.lengthMin)) {
				const metric = ConvertUtility.convertMeasurementPart(correlationId, params.lengthMin, params.lengthMeasurementUnitId, 'length');
				where.push({ 'lengthMetric': { '$gte': metric } });
			}

			if (!String.isNullOrEmpty(params.motorDiameter)) {
				const arr = [];
				params.motorDiameter.forEach(element => {
					arr.push({ 'diameter': Number(element) });
				});
				where.push({ $or: arr});
			}
			
			if (!String.isNullOrEmpty(params.motorImpulseClass)) {
				const arr = [];
				params.motorImpulseClass.forEach(element => {
					arr.push({ 'impulseClass': element });
				});
				where.push({ $or: arr});
			}

			if (additional)
				additional(correlationId, params, where);

			const defaultFilter = { 
				$and: [
					{ 
						$or: [
							{ 'ownerId': userId },
							{ 'public': { $eq: true } }
						]
					},
					{ 'deleted': { $ne: true } },
					...where
				],
			};
	
			queryA.push({
				$match: defaultFilter
			});
			queryA.push({
				$project: { 
					'_id': 0
				}
			});
	
			const collection = await this._getCollectionParts(correlationId);
			const results = await this._aggregateExtract2(correlationId, collection, queryA, queryA, this._initResponseExtract(correlationId));if (results.data.length === 0)
			if (results.data.length === 0)
				return this._successResponse(results, correlationId);
			
			const queryI = [ { 
					$match: { 'ownerId': userId }
				}
			];
			const collectionI = await this._getCollectionInventory(correlationId);
			let resultsI = await this._aggregate(correlationId, collectionI, queryI);
			resultsI = await resultsI.toArray();
			let inventory = { types: [] };
			if (resultsI && resultsI.length > 0)
				inventory = resultsI[0];
			inventory.types = inventory.types ?? [];

			let itemI;
			let typeI;
			for (const item of results.data) {
				item.manufacturer = manufacturers.find(l => l.id === item.manufacturerId);
				if (item.manufacturer)
					item.manufacturer = item.manufacturer.name;

				typeI = inventory.types.find(l => l.typeId === item.typeId);
				if (typeI) {
					typeI.items = typeI.items ?? [];
					itemI = typeI.items.find(l => l.id === item.id);
					if (itemI)
						item.quantity = itemI.quantity;
				}
			}

			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('PartsRepository', '_searchSets', null, err, null, null, correlationId);
		}
	}
}

export default PartsRepository;
