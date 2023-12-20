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
			const collection = await this._getCollectionLaunches(correlationId);

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

	async refreshSearchName(correlationId) {
		return await this._refreshSearchName(correlationId, await this._getCollectionChecklists(correlationId));
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
				$project: { 
					'_id': 0
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
					'statusId': 1,
					'ownerId': 1
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
