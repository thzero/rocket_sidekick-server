import AppMongoRepository from './app.js';

class RocketsRepository extends AppMongoRepository {
	async listing(correlationId) {
		const collection = await this._getCollectionRockets(correlationId);

		const response = this._initResponse(correlationId);

		const defaultFilter = { 
			$and: [
				{ 'id': 'BcHwSwTQnWUgTULr5sGVnN54Ckg2' }, // TODO
				{ 'public': true }
			]
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

	async listingUser(correlationId, userId) {
		const collection = await this._getCollectionRockets(correlationId);

		const response = this._initResponse(correlationId);

		const defaultFilter = { 
			$and: [
				{ 'id': userId }
			]
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
}

export default RocketsRepository;
