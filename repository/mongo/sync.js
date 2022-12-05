import AppMongoRepository from './app.js';

class SyncMongoRepository extends AppMongoRepository {
	// eslint-disable-next-line
	async syncFrom(correlationId, lastSyncTimestamp) {
		const collection = await this._getCollectionRockets(correlationId);
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
	async syncRockets(correlationId, userId, lastSyncTimestamp) {
		const collection = await this._getCollectionRockets(correlationId);
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
	async updateRockets(correlationId, userId, rockets) {
		const collection = await this._getCollectionRockets(correlationId);

		const client = await this._getClient(correlationId);
		const session = await this._transactionInit(correlationId, client);
		try {
			await this._transactionStart(correlationId, session);

			let response;
			for (const rocket of rockets) {
				response = await this._update(correlationId, collection, userId, rocket.identifier, rocket, 'identifier');
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
