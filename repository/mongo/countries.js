import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

import AppMongoRepository from './app.js';

class CountriesRepository extends AppMongoRepository {
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
			const defaultFilter = { $expr: { $ne: [ 'deleted', true ] } };
	
			const queryF = defaultFilter;
			const queryA = [ {
					$match: defaultFilter
				}
			];
			queryA.push({
				$project: { 
					'_id': 0
				}
			});
	
			const collection = await this._getCollectionCountries(correlationId);
			// const results = await this._aggregateExtract(correlationId, await this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
			const results = await this._aggregateExtract2(correlationId, collection, queryA, queryA, this._initResponseExtract(correlationId));
			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('CountriesRepository', 'listing', null, err, null, null, correlationId);
		}
	}

	async sync(correlationId, countriesUpdate) {
		const collection = await this._getCollectionCountries(correlationId);
		const client = await this._getClient(correlationId);
		const session = await this._transactionInit(correlationId, client);
		try {
			await this._transactionStart(correlationId, session);

			const queryA = [ { 
					$match: { 'deleted': { $ne: true } }
				}
			];

			let results = await this._aggregate(correlationId, collection, queryA);
			const countriesCurrent = await results.toArray();
			const countriesCurrentIds = countriesCurrent.map(l => l.id);

			let countries = [];
			let temp;
			let response;
			for (const item of countriesUpdate) {
				temp = countriesCurrent.find(l => l.iso3 === item.iso3);

				if (!temp)
					item.id = LibraryCommonUtility.generateId();
				else
					item.id = temp.id;
		
				if (!item.createdTimestamp)
					item.createdTimestamp = LibraryCommonUtility.getTimestamp();
				if (!String.isNullOrEmpty(item.createdUserId))
					item.createdUserId = this._ownerId;
					
				response = await this._update(correlationId, collection, this._ownerId, item.id, item);
				if (this._hasFailed(response))
					return this._transactionAbort(correlationId, correlationId, session, 'Unable to update the country.');

				countries.push(item);
			}
			
			const countriesIds = countries.map(l => l.id);
			let country;
			let diff = countriesCurrentIds.filter(x => !countriesIds.includes(x));
			if (diff.length > 0) {
				for (const id of diff) {
					country = countriesCurrent.find(l => l.id);
					country.deleted = true;
					country.deletedUserId = this._ownerId;
					country.deletedTimestamp = LibraryCommonUtility.getTimestamp();
					response = await this._update(correlationId, collection, this._ownerId, country.id, country);
					if (this._hasFailed(response))
						return await this._transactionAbort(correlationId, session, 'Unable to delete the country.');
				}
			}

			await this._transactionCommit(correlationId, session);
			return this._successResponse(countries, correlationId);
		}
		catch (err) {
			return this._transactionAbort(correlationId, session, null, err);
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}
}

export default CountriesRepository;
