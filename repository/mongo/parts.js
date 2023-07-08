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

			// TODO: Check to see if the part is in checklists and rockets...
			// const collectionChecklists = await this._getCollectionChecklists(correlationId);
			// let results = await this._find(correlationId, collectionChecklists, { $and: [ { 'ownerId' : userId }, { 'rocketId': id }, { $expr: { $ne: [ 'deleted', true ] } } ] });
			// if (results && results.length > 0) {
			// 	await this._transactionAbort(correlationId, session, 'Unable to delete the rocket. - associated with a checklist');
			// 	return this._errorResponse('PartsRepository', 'deleteUser', {
			// 			found: results.length,
			// 			results: results
			// 		},
			// 		AppSharedConstants.ErrorCodes.Parts.IncludedInChecklist,
			// 		correlationId);
			// }

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
			return await this._transactionAbort(correlationId, session, null, err, 'RocketsRePartsRepositorypository', 'delete');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}

	async listing(correlationId, userId, params) {
		try {
			const defaultFilter = { 
				$and: [
					{ 
						$or: [
							{ 'ownerId': userId },
							{ 'public': { $eq: true } }
						]
					},
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
					'_id': 0
				}
			});
	
			const collection = await this._getCollectionParts(correlationId);
			const results = await this._aggregateExtract(correlationId, this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('PartsRepository', 'listing', null, err, null, null, correlationId);
		}
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
							// { 'deleted': { $ne: true } }
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

	async isPublic(correlationId, part) {
		const collection = await this._getCollectionParts(correlationId);

		const results = await this._findOne(correlationId, collection, { $and: [ { 'id': part.id }, { $expr: { $ne: [ 'public', true ] } }, { $expr: { $ne: [ 'deleted', true ] } } ] });
		if (results)
			return this._error('PartsRepository', 'update', null, null, AppSharedConstants.ErrorCodes.Parts.UpdatePublic, null, correlationId);
		return this._success(correlationId);
	}

	async update(correlationId, userId, part) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionParts(correlationId);
			const response = this._initResponse(correlationId);

			part.ownerId = userId;
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
}

export default PartsRepository;
