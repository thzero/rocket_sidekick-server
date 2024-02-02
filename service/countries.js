import * as https from 'https';

import { Mutex as asyncMutex } from 'async-mutex';

import Constants from '../constants.js';

import LibraryMomentUtility from '@thzero/library_common/utility/moment.js';

import Service from '@thzero/library_server/service/index.js';

class CountriesService extends Service {
	constructor() {
		super();

		this._repositoryCountries = null;

		this._cache = null;
		this._mutexCache = new asyncMutex();
		this._ttlCache = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryCountries = this._injector.getService(Constants.InjectorKeys.REPOSITORY_COUNTRIES);
	}

	async listing(correlationId, user, params) {
		try {
			const now = LibraryMomentUtility.getTimestamp();
			const ttl = this._ttlCache ? this._ttlCache : 0;
			const delta = now - ttl;
	
			if (this._cache && (delta <= this._ttlCache))
				return this._successResponse(this._cache, correlationId);
	
			let release = await this._mutexCache.acquire();
			try {
				const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.countriesParams, params);
				if (this._hasFailed(validationResponse))
					return validationResponse;
		
				const response = await this._repositoryCountries.listing(correlationId, params);
				if (this._hasFailed(response))
					return response;
	
				this._cache = response.results;
				this._ttlCache = LibraryMomentUtility.getTimestamp();
	
				return this._successResponse(this._cache, correlationId);
			}
			finally {
				release();
			}
		}
		catch (err) {
			return this._error('CountriesService', 'listing', null, err, null, null, correlationId);
		}
	}

	async sync(correlationId, body) {
		this._enforceNotNull('CountriesService', 'sync', 'body', body, correlationId);

		try {
			let response = await this._get(correlationId, 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/countries%2Bstates.json');
			if (!response)
				return this._error('CountriesService', 'countrySync', 'Unable to fetch countries from "https://github.com/dr5hn/countries-states-cities-database".', null, null, null, correlationId);
			
			response = JSON.parse(response);
			console.log(response);

			const countries = [];
			let temp;
			let temp2;
			for (const country of response) {
				temp = {
					name: country.name,
					iso3: country.iso3,
					iso2: country.iso2,
					numeric_code: country.numeric_code,
					states: []
				};
				countries.push(temp);
				for (const state of country.states) {
					temp2 = {
						name: state.name,
						state_code: state.state_code
					}
					temp.states.push(temp2);
				}
			}
	
			console.dir(countries);
			return await this._repositoryCountries.sync(correlationId, countries);
		}
		catch (err) {
			return this._error('CountriesService', 'sync', null, err, null, null, correlationId);
		}
	}

	async _get(correlationId, url) {
		let promise = new Promise((resolve, reject) => {
			var data = '';
			https.get(url, res => {
				res.on('data', chunk => { data += chunk }) 
				res.on('end', () => {
					resolve(data);
				});
			}) ;
		});
	
		return await promise;
	}
}

export default CountriesService;
