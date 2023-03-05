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
		const collection = await this._getCollectionManufacturers(correlationId);

		const response = this._initResponse(correlationId);

		if (String.isNullOrEmpty(this._ownerId)) 
			return this._error('ManufacturersRepository', 'listing', 'Missing ownerId', null, null, null, correlationId);

		const defaultFilter = { 
			$and: [
				{ 'ownerId': this._ownerId },
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

		response.results = await this._aggregateExtract(correlationId, this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
		return response;
	}

	async retrieve(correlationId, id) {
		const collection = await this._getCollectionManufacturers(correlationId);

		const response = this._initResponse(correlationId);
		
		if (String.isNullOrEmpty(this._ownerId)) 
			return this._error('ManufacturersRepository', 'retrieve', 'Missing ownerId', null, null, null, correlationId);

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

		response.results = await this._aggregate(correlationId, collection, queryA);
		const results = await response.results.toArray();
		if (results.length > 0)
			return this._successResponse(results[0], correlationId);
		return response;
	}
}

export default ManufacturersRepository;
