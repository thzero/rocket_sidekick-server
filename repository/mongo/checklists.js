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

	async listing(correlationId, userId, params) {
		try {
			const defaultFilter = { 
				$and: [
					{ 
						$or: [
							{ 'ownerId': userId },
							{ 'isDefault': true }
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
			queryA.push({
				$sort: {
					'ownerId': -1
				}
			});

			const collection = await this._getCollectionChecklists(correlationId);
			const results = await this._aggregateExtract(correlationId, await this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('ChecklistsRepository', 'listing', null, err, null, null, correlationId);
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

	async update(correlationId, userId, checklist) {
		const client = await this._getClient(correlationId);
		const session = await this._transactionInit(correlationId, client);
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionChecklists(correlationId);
			const response = this._initResponse(correlationId);

			checklist.ownerId = userId;
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
