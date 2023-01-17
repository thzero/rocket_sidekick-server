import AppMongoRepository from "./app.js";

class ContentMongoRepository extends AppMongoRepository {
	async content(correlationId) {
		const collection = await this._getCollectionContent(correlationId);
		this._enforceNotNull('ContentMongoRepository', 'content', 'collection', collection, correlationId);

		const queryA = [
			{
				$match: {
					$expr: {
						$and: [
							{
								$eq: [ '$type', 'content' ]
							},
							{
								$in: [ '$id', [ 'info', 'links', 'tools' ] ]
							}
						]
					}
				}
			}
		];

		let results = await this._aggregate(correlationId, collection, queryA);
		results = await results.toArray();
		
		const results2 = {};
		for (let content of results)
			results2[content.id] = content.data;
		return this._successResponse(results2, correlationId);
	}

	async contentLocaleTitlesDescriptions(correlationId) {
		const queryA = [
			{
				$match: {
					$expr: {
						$eq: [ '$type', 'markup' ]
					}
				}
			},
			{
				$project: {
					'id': 1,
					'locales': 1,
					'title': 1,
					'description': 1
				}
			}
		];

		let results = await this._aggregate(correlationId, await this._getCollectionContent(correlationId), queryA);
		return this._successResponse(await results.toArray(), correlationId);
	}
}

export default ContentMongoRepository;
