import Utility from '@thzero/library_common/utility/index.js';

import AppMongoRepository from './app.js';

class SyncMongoRepository extends AppMongoRepository {
	async syncChecklists(correlationId, lastSyncTimestamp) {
		return await this._syncFrom(correlationId, lastSyncTimestamp, await this._getCollectionChecklists(correlationId));
	}

	async syncRockets(correlationId, lastSyncTimestamp) {
		return await this._syncFrom(correlationId, lastSyncTimestamp, await this._getCollectionRockets(correlationId));
	}

	async updateChecklists(correlationId, userId, objects) {
		return await this._updateFrom(correlationId, userId, objects, await this._getCollectionChecklists(correlationId));
	}

	// eslint-disable-next-line
	async updateRockets(correlationId, userId, objects) {
		return await this._updateFrom(correlationId, userId, objects, await this._getCollectionRockets(correlationId));
	}

	async _syncFrom(correlationId, lastSyncTimestamp, collection) {
		const response = this._initResponse(correlationId);

		const defaultFilter = { 
			syncTimestamp: {
				$gt: lastSyncTimestamp
			}
		};

		const queryF = defaultFilter;
		const queryA = [
			{
				$match: defaultFilter
			}
		];
		queryA.push({
			$project: { '_id': 0 }
		});
		queryA.push({
			$project: { '_id': 0 }
		});

		response.results = await this._aggregateExtract(correlationId, this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
		return response;
	}

	// eslint-disable-next-line
	async _updateFrom(correlationId, userId, objects, collection) {
		const client = await this._getClient(correlationId);
		const session = await this._transactionInit(correlationId, client);
		try {
			await this._transactionStart(correlationId, session);

			let output = [];
			let response;
			for (const item of objects) {
				// delete item.id;
				item.id = item.identifier;
				if (!item.createdTimestamp)
					item.createdTimestamp = Utility.getTimestamp();
				if (!String.isNullOrEmpty(item.createdUserId))
					item.createdUserId = userId;
					
				item.syncTimestamp = Utility.getTimestamp();

				response = await this._update(correlationId, collection, userId, item.id, item); //, 'identifier');
				if (this._hasFailed(response))
					return this._transactionAbort(correlationId, correlationId, session, 'Unable to update the value');

				output.push(response.results);
			}

			await this._transactionCommit(correlationId, session);
			return this._successResponse(output, correlationId);
		}
		catch (err) {
			return this._transactionAbort(correlationId, session, null, err);
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}
}

export default SyncMongoRepository;
