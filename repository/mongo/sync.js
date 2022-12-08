import AppMongoRepository from './app.js';

class SyncMongoRepository extends AppMongoRepository {
	async syncFromChecklists(correlationId, lastSyncTimestamp) {
		return await this._syncFrom(correlationId, lastSyncTimestamp, await this._getCollectionChecklists(correlationId));
	}
	
	async syncFromPreparations(correlationId, lastSyncTimestamp) {
		return await this._syncFrom(correlationId, lastSyncTimestamp, await this._getCollectionPreparations(correlationId));
	}

	async syncFromRockets(correlationId, lastSyncTimestamp) {
		return await this._syncFrom(correlationId, lastSyncTimestamp, await this._getCollectionRockets(correlationId));
	}

	async updateChecklists(correlationId, userId, objects) {
		return await this._updateFrom(correlationId, userId, objects, await this._getCollectionChecklists(correlationId));
	}

	async updatePreparations(correlationId, userId, objects) {
		return await this._updateFrom(correlationId, userId, objects, await this._getCollectionPreparations(correlationId));
	}

	// eslint-disable-next-line
	async updateRockets(correlationId, userId, objects) {
		return await this._updateFrom(correlationId, userId, objects, await this._getCollectionRockets(correlationId));
	}

	async _syncFrom(correlationId, lastSyncTimestamp, collection) {
		const response = this._initResponse(correlationId);

		const defaultFilter = { 
			lastUpdatedTimestamp: {
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

			let response;
			for (const item of objects) {
				response = await this._update(correlationId, collection, userId, item.identifier, item, 'identifier');
				if (this._hasFailed(response))
					return this._transactionAbort(correlationId, correlationId, session, 'Unable to update the value');
			}

			await this._transactionCommit(correlationId, session);
			return this._initResponse(correlationId);
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
