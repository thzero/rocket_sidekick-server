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
					'tcId': 1,
					'name': 1,
					'ownerId': 1,
					'public': 1,
					'types': 1
				}
			});
	
			const collection = await this._getCollectionManufacturers(correlationId);
			const results = await this._aggregateExtract(correlationId, this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
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
}

export default ManufacturersRepository;
