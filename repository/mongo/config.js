import AppMongoRepository from './app.js';

class ConfigMongoRepository extends AppMongoRepository {
	async content(correlationId) {
		const collection = await this._getCollectionConfig(correlationId);
		if (!collection)
			return this._error('ConfigMongoRepository', 'content', null, null, null, null, correlationId);
		
		const response = this._initResponse(correlationId);
		response.results = await this._findOne(correlationId, collection, {'id': 'content'});
		response.success = response.results !== null;
		return response;
	}
}

export default ConfigMongoRepository;
