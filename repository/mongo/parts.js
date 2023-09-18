import AppSharedConstants from 'rocket_sidekick_common/constants.js';

import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

import AppMongoRepository from './app.js';

class PartsRepository extends AppMongoRepository {
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

			const collection = await this._getCollectionParts(correlationId);

			// TODO: Check to see if the part is in rockets or rocket setup...
			// const collectionRockets = await this._getCollectionRockets(correlationId);
			// results = await this._find(correlationId, collectionRockets, { $and: [ { 'ownerId' : userId }, { 'rocketId': id }, { $expr: { $ne: [ 'deleted', true ] } } ] });
			// if (results && results.length > 0) {
			// 	await this._transactionAbort(correlationId, session, 'Unable to delete the rocket. - associated with a checklist');
			// 	return this._errorResponse('PartsRepository', 'deleteUser', {
			// 			found: results.length,
			// 			results: results
			// 		},
			// 		AppSharedConstants.ErrorCodes.Parts.IncludedInRocket,
			// 		correlationId);
			// }

			const part = await this._findOne(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'id': id } ] });
			if (!part)
				return await this._transactionAbort(correlationId, session, 'Unable to delete the part - not found.');

			part.deleted = true;
			part.deletedUserId = userId;
			part.deletedTimestamp = LibraryCommonUtility.getTimestamp();
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
			const queryA = [ { 
					$match: {
						$and: [
							{ 'id': id },
							{ 
								$or: [
									{ 'ownerId': userId },
									{ 'public': { $eq: true } }
								]
							},
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
			
			if (!String.isNullOrEmpty(params.impulseClass))
				where.push({ 'impulseClass': params.impulseClass });
			
			if (params.motorSearch !== true && !String.isNullOrEmpty(params.diameter))
				where.push({ 'diameter': params.diameter });
			
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
					'_id': 0,
					'data': 0
				}
			});
	
			const collection = await this._getCollectionParts(correlationId);
			const results = await this._aggregateExtract2(correlationId, collection, queryA, queryA, this._initResponseExtract(correlationId));
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
				part.deletedTimestamp = LibraryCommonUtility.getTimestamp();
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
			
			if (!String.isNullOrEmpty(params.motorDiameter))
				where.push({ 'diameter': Number(params.motorDiameter) });
			
			if (!String.isNullOrEmpty(params.motorImpulseClass))
				where.push({ 'impulseClass': params.motorImpulseClass });

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
			const results = await this._aggregateExtract2(correlationId, collection, queryA, queryA, this._initResponseExtract(correlationId));
			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('PartsRepository', '_searchSets', null, err, null, null, correlationId);
		}
	}
}

export default PartsRepository;
