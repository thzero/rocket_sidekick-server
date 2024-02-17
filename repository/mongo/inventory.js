import AppMongoRepository from './app.js';

import InventoryData from 'rocket_sidekick_common/data/inventory/index.js';

class InventoryRepository extends AppMongoRepository {
	constructor() {
		super();
		
		this._ownerId = null;
	}

	async init(injector) {
		await super.init(injector);

		this._ownerId = this._config.get('ownerId');
	}
	
	async retrieve(correlationId, userId, id) {
		try {
			const queryA = [ { 
					$match: { 'ownerId': userId }
				}
			];

			const collection = await this._getCollectionInventory(correlationId);
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			if (results.length === 0)
				return this._successResponse(new InventoryData(), correlationId);
			
			results = results[0];

			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('InventoryRepository', 'retrieve', null, err, null, null, correlationId);
		}
	}
	
	async retrieveSecurity(correlationId, userId, id) {
		try {
			const queryA = [ { 
					$match: {
						$and: [
							{ 'ownerId': userId }
						]
					}
				}
			];
			queryA.push({
				$project: { 
					'_id': 0,
					'ownerId': 1,
					'name': 1
				}
			});

			const collection = await this._getCollectionInventory(correlationId);
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			if (results.length === 0)
				return this._successResponse(new InventoryData(), correlationId);
			
			results = results[0];

			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('InventoryRepository', 'retrieveSecurity', null, err, null, null, correlationId);
		}
	}

	async update(correlationId, userId, inventory) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionInventory(correlationId);
			const response = this._initResponse(correlationId);

			inventory.ownerId = userId;
			await this._update(correlationId, collection, userId, inventory.id, inventory);

			const responseRetrieve = await this.retrieve(correlationId, userId, inventory.id);
			if (this._hasFailed(responseRetrieve))
				return response;
			response.results = responseRetrieve.results;

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'InventoryRepository', 'update');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}
}

export default InventoryRepository;
