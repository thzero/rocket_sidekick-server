import LibraryMomentUtility from '@thzero/library_common/utility/moment.js';

import AppMongoRepository from './app.js';

class ManufacturersRepository extends AppMongoRepository {
	constructor() {
		super();
		
		this._ownerId = null;
	}

	async init(injector) {
		await super.init(injector);

		this._ownerId = this._config.get('ownerId');
	}

	async listing(correlationId, params) {
		try {
			const defaultFilter = { 
				$and: [
					{ 
						$or: [
							{ 'ownerId': this._ownerId },
							{ 'public': true }
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
					'abbrev': 1,
					'tcId': 1,
					'isDefault': 1,
					'name': 1,
					'ownerId': 1,
					'public': 1,
					'types': 1
				}
			});
	
			const collection = await this._getCollectionManufacturers(correlationId);
			// const results = await this._aggregateExtract(correlationId, await this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
			const results = await this._aggregateExtract2(correlationId, collection, queryA, queryA, this._initResponseExtract(correlationId));
			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('ManufacturersRepository', 'listing', null, err, null, null, correlationId);
		}
	}

	async retrieve(correlationId, userId, id) {
		try {
			const queryA = [ { 
					$match: {
						$and: [
							{ 'id': id.toLowerCase() },
							{ 
								$or: [
									{ 'ownerId': this._ownerId },
									{ 'public': true }
								]
							},
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
	
			const collection = await this._getCollectionManufacturers(correlationId);
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			if (results.length > 0)
				return this._successResponse(results[0], correlationId);
			
			return this._success(correlationId);
		}
		catch (err) {
			return this._error('ManufacturersRepository', 'retrieve', null, err, null, null, correlationId);
		}
	}

	async sync(correlationId, manufacturers, deleted) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionManufacturers(correlationId);
			const response = this._initResponse(correlationId);

			for (const manufacturer of deleted) {
				manufacturer.deleted = true;
				manufacturer.deletedUserId = this._ownerId;
				manufacturer.deletedTimestamp = LibraryMomentUtility.getTimestamp();
				const response = await this._update(correlationId, collection, this._ownerId, manufacturer.id, manufacturer);
				if (this._hasFailed(response))
					return await this._transactionAbort(correlationId, session, 'Unable to delete the manufacturer.');
			}

			for (const manufacturer of manufacturers) {
				manufacturer.ownerId = this._ownerId;
				const response = await this._update(correlationId, collection, this._ownerId, manufacturer.id, manufacturer);
				if (this._hasFailed(response))
					return await this._transactionAbort(correlationId, session, 'Unable to update the manufacturer.');
			}

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'ManufacturersRepository', 'sync');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}
}

export default ManufacturersRepository;
