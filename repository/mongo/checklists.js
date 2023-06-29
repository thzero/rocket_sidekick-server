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

	async deleteUser(correlationId, userId, id) {
		const client = await this._getClient(correlationId);
		const session = await this._transactionInit(correlationId, client);
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionChecklists(correlationId);

			const response = await this._delete(correlationId, collection, { $and: [ { 'ownerId' : userId }, { 'id': id } ] });
			if (this._hasFailed(response))
				return await this._transactionAbort(correlationId, session, 'Unable to delete the checklist.');

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			await this._transactionAbort(correlationId, session, null, err);
			return this._error('ChecklistsRepository', 'deleteUser', null, err, null, null, correlationId);
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}

	async listingShared(correlationId, userId, params) {
		const collection = await this._getCollectionChecklists(correlationId);

		const response = this._initResponse(correlationId);

		const defaultFilter = { 
			$and: [
				{ 
					$or: [
						{ 'createdByUserId': userId },
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
				'description': 1,
				'typeId': 1,
				'isDefault': 1,
				'launchTypeId': 1,
				'statusId': 1,
				'createdUserId': 1
			}
		});

		response.results = await this._aggregateExtract(correlationId, this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
		return response;
	}

	async listingUser(correlationId, userId, params) {
		const collection = await this._getCollectionChecklists(correlationId);

		const response = this._initResponse(correlationId);

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

		response.results = await this._aggregateExtract(correlationId, this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
		return response;
	}

	async retrieveShared(correlationId, id) {
		const collection = await this._getCollectionChecklists(correlationId);

		const response = this._initResponse(correlationId);
		
		if (String.isNullOrEmpty(this._ownerId)) 
			return this._error('ChecklistsRepository', 'retrieveShared', 'Missing ownerId', null, null, null, correlationId);

		const queryA = [ { 
				$match: {
					$and: [
						{ 'id': id.toLowerCase() },
						{ 'ownerId': this._ownerId },
						{ 'public': true },
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

		let results = await this._aggregate(correlationId, collection, queryA);
		results = await results.toArray();
		if (results.length > 0)
			return this._successResponse(results[0], correlationId);
		return response;
	}

	async retrieveUser(correlationId, userId, id) {
		const collection = await this._getCollectionChecklists(correlationId);

		const response = this._initResponse(correlationId);
		
		if (String.isNullOrEmpty(this._ownerId)) 
			return this._error('ChecklistsRepository', 'retrieveUser', 'Missing ownerId', null, null, null, correlationId);

		const queryA = [ { 
				$match: {
					$or: [
						{
							$and: [
								{ 'id': id },
								{ 'ownerId': userId },
								{ $expr: { $ne: [ 'isDefault', true ] } },
								{ $expr: { $ne: [ 'deleted', true ] } }
							]
						},
						{
							$and: [
								{ 'id': id },
								{ 'isDefault': true },
								{ $expr: { $ne: [ 'deleted', true ] } }
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

		let results = await this._aggregate(correlationId, collection, queryA);
		results = await results.toArray();
		if (results.length > 0)
			return this._successResponse(results[0], correlationId);
		return response;
	}

	async updateUser(correlationId, userId, checklist) {
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
			await this._transactionAbort(correlationId, session, null, err);
			return this._error('ChecklistsRepository', 'updateUser', null, err, null, null, correlationId);
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}
}

export default ChecklistsRepository;
