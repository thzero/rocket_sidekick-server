import AppMongoRepository from "./app.js";

class ContentMongoRepository extends AppMongoRepository {
	async contentListing(correlationId) {
		try {
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
	
			const collection = await this._getCollectionContent(correlationId);
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			
			const results2 = {};
			for (let content of results)
				results2[content.id] = content.data;
			return this._successResponse(results2, correlationId);
		}
		catch (err) {
			return this._error('ContentMongoRepository', 'contentListing', null, err, null, null, correlationId);
		}
	}

	async contentListingLocaleTitlesDescriptions(correlationId) {
		try {
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
		catch (err) {
			return this._error('ContentMongoRepository', 'contentListingLocaleTitlesDescriptions', null, err, null, null, correlationId);
		}
	}

	async contentMarkup(correlationId, contentId, locale, defaultLocale) {
		this._enforceNotEmpty('ContentMongoRepository', 'contentMarkup', 'contentId', contentId, correlationId);

		try {
			let response = await this._contentMarkup(correlationId, contentId, locale);
			if (this._hasFailed(response))
				return response;
			
			if (response.results)
				return response;
	
			return await this._contentMarkup(correlationId, contentId, defaultLocale);
		}
		catch (err) {
			return this._error('ContentMongoRepository', 'contentMarkup', null, err, null, null, correlationId);
		}
	}

	async _contentMarkup(correlationId, contentId, locale) {
		this._enforceNotEmpty('ContentMongoRepository', '_contentMarkup', 'contentId', contentId, correlationId);
		
		const queryA = [
			{
				$match: {
					$expr: {
						$and: [
							{
								$eq: [ '$type', 'markup' ]
							},
							{
								$eq: [ '$id', contentId ]
							},
							{
								$in: [ locale, '$locales' ]
							}
						]
					}
				},
			},
			{
				$lookup: {
					'from': 'content',
					'let': { 'sid': contentId + '.supplemental' },
					'pipeline': [ { 
							$match: { 
								$expr: { 
									$and: [ { 
											$eq: [ "$id",  "$$sid" ] 
										},{ 
											$eq: [ "$type",  'supplemental' ] 
										}
									]
								}
							}
						}
					],
					'as': 'supplementals'
				}
			},
			{
				$addFields: {
					supplemental: { 
						$arrayElemAt: [ '$supplementals', 0 ]
					}
				}
			},
			{
				$project: {
					'supplementals': 0
				}
			}
		];

		const collection = await this._getCollectionContent(correlationId);
		let results = await this._aggregate(correlationId, collection, queryA);
		results = await results.toArray();
		return this._successResponse(results.length > 0 ? results[0] : null, correlationId);
	}
}

export default ContentMongoRepository;
