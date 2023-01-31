import AppMongoRepository from './app.js';

class RocketsRepository extends AppMongoRepository {
	static defaultOwnerId = 'BcHwSwTQnWUgTULr5sGVnN54Ckg2'; // TODO

	async listing(correlationId, params) {
		const collection = await this._getCollectionRockets(correlationId);

		const response = this._initResponse(correlationId);

		const defaultFilter = { 
			$and: [
				{ 'ownerId': RocketsRepository.defaultOwnerId },
				{ 'public': true }
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

		response.results = await this._aggregateExtract(correlationId, this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
		return response;
	}

	async listingUser(correlationId, userId, params) {
		const collection = await this._getCollectionRockets(correlationId);

		const response = this._initResponse(correlationId);

		const defaultFilter = { 
			$and: [
				{ 'id': userId }
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

		response.results = await this._aggregateExtract(correlationId, this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
		return response;
	}

	async retrieve(correlationId, id) {
		const collection = await this._getCollectionRockets(correlationId);

		const response = this._initResponse(correlationId);

		const queryA = [  { 
				$and: [
					{ 'id': id.toLowerCase() },
					{ 'ownerId': RocketsRepository.defaultOwnerId },
					{ 'public': true }
				]
			}
		];
		queryA.push({
			$project: { 
				'_id': 0
			}
		});

		response.results = await this._aggregate(correlationId, collection, queryA);
		return response;
	}
	
	async retrieveUser(correlationId, userId, id) {
		const collection = await this._getCollectionRockets(correlationId);

		const response = this._initResponse(correlationId);

		const queryA = [ { 
				$and: [
					{ 'id': id.toLowerCase() },
					{ 'ownerId': userId }
				]
			}
		];
		queryA.push({
			$project: { 
				'_id': 0
			}
		});

		response.results = await this._aggregate(correlationId, collection, queryA);
		return response;
	}
}

export default RocketsRepository;
