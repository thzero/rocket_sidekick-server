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
			return await this._transactionAbort(correlationId, session, null, err, 'RocketsRepository', 'delete');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}

	async listing(correlationId, userId, params) {
		try {
			if (String.isNullOrEmpty(this._ownerId)) 
				return this._error('RocketsRepository', 'listing', 'Missing ownerId', null, null, null, correlationId);
	
			const defaultFilter = { 
				$and: [
					{ 'public': true },
					{ $expr: { $ne: [ 'deleted', true ] } }
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
					'coverUrl': 1,
					'typeId': 1
				}
			});
	
			const collection = await this._getCollectionRockets(correlationId);
			const results = await this._aggregateExtract(correlationId, this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('PartsRepository', 'listing', null, err, null, null, correlationId);
		}
	}

	async listingUser(correlationId, userId, params) {
		try {
			const defaultFilter = { 
				$and: [
					{ 
						$or: [
							{ 'ownerId': userId },
							{ 'isDefault': true }
						]
					},
					{ $expr: { $ne: [ 'deleted', true ] } }
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
					'coverUrl': 1,
					'typeId': 1
				}
			});
	
			const collection = await this._getCollectionRockets(correlationId);
			const results = await this._aggregateExtract(correlationId, this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('PartsRepository', 'listingUser', null, err, null, null, correlationId);
		}
	}

	async retrieve(correlationId, id) {
		try {
			const queryA = [ { 
					$match: {
						$and: [
							{ 'id': id.toLowerCase() },
							{ $expr: { $eq: [ 'public', true ] } },
							{ $expr: { $ne: [ 'deleted', true ] } }
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
			return this._error('PartsRepository', 'retrieve', null, err, null, null, correlationId);
		}
	}
	
	async retrieveUser(correlationId, userId, id) {
		try {

			const queryA = [ { 
					$match: {
						$and: [
							{ 'id': id.toLowerCase() },
							{ 'ownerId': userId },
							{ $expr: { $ne: [ 'deleted', true ] } }
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
			return this._error('PartsRepository', 'retrieveUser', null, err, null, null, correlationId);
		}
	}

	async update(correlationId, userId, rocket) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionRockets(correlationId);
			const response = this._initResponse(correlationId);

			rocket.ownerId = userId;
			await this._update(correlationId, collection, userId, rocket.id, rocket);
			response.results = rocket;

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
}

export default RocketsRepository;
