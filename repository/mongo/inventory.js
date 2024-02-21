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
	
	async retrieve(correlationId, userId) {
		try {
			const queryA = [ { 
					$match: { 'ownerId': userId }
				}
			];
			queryA.push({
				'$addFields': {
					'items': {
						'$setDifference': [ {
									'$setUnion': [ {
										'$reduce': {
											'input': '$types.items',
											'initialValue': [],
											'in': { 
												'$concatArrays': [ '$$value', '$$this.id' ] 
											}
										}
									}
								]
							}, 
							[ null ] 
						]
					}
				}
			});
			queryA.push({
				'$lookup': {
					'from': 'parts',
					'localField': 'items',
					'foreignField': 'id',
					'pipeline': [
						{ 
							'$project': { 
								'_id': 0,
								'createdTimestamp': 0,
								'createdUserId': 0,
								'updatedTimestamp': 0,
								'updatedUserId': 0,
								'deleted': 0,
								'deletedTimestamp': 0,
								'deletedUserId': 0,
								'syncTimestamp': 0,
								'public': 0,
								'ownerId': 0
							}
						},
					],
					'as': 'items'
				}
			});
			queryA.push({
				'$addFields': {
					manufacturers: { '$setUnion': '$items.manufacturerId' }
				  }
			});
			queryA.push({
				'$lookup': {
					'from': 'manufacturers',
					'localField': 'manufacturers',
					'foreignField': 'id',
					'pipeline': [
						{ 
							'$project': { 
								'_id': 0,
								'id': 1,
								'name': 1
							}
						},
					],
					'as': 'manufacturers'
				}
			});

			const collection = await this._getCollectionInventory(correlationId);
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			if (results.length === 0)
				return this._success(correlationId);
			
			results = results[0];

			let temp;
			for (const type of results.types) {
				for (const item of type.items) {
					item.item = results.items.find(l => l.id === item.id);
					temp = results.manufacturers.find(l => l.id === item.item.manufacturerId);
					if (temp)
						item.item.manufacturer = temp.name;
				}
			}
			delete results.items;
			delete results.manufacturers;

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
