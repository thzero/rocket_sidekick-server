import { Mutex as asyncMutex } from 'async-mutex';

import AppConstants from '../constants.js';

import LibraryMomentUtility from '@thzero/library_common/utility/moment.js';

import Service from '@thzero/library_server/service/index.js';

class ManufacturersService extends Service {
	constructor() {
		super();

		this._repositoryManufacturers = null;
		this._serviceUsers = null;

		this._cache = null;
		this._mutexCache = new asyncMutex();
		this._ttlCache = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryManufacturers = this._injector.getService(AppConstants.InjectorKeys.REPOSITORY_MANUFACTURERS);
	}

	async listing(correlationId, user, params) {
		try {
			let now = LibraryMomentUtility.getTimestamp();
			let ttl = this._ttlCache ? this._ttlCache : 0;
			let delta = now - ttl;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.manufacturersParams, params);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			if (this._cache && (delta <= this._ttlCache))
				return this._successResponse(this._cache, correlationId);
	
			const release = await this._mutexCache.acquire();
			try {
				now = LibraryMomentUtility.getTimestamp();
				ttl = this._ttlCache ? this._ttlCache : 0;
				delta = now - ttl;
	
				if (this._cache && (delta <= this._ttlCache))
					return this._successResponse(this._cache, correlationId);

				const response = await this._repositoryManufacturers.listing(correlationId, params);
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
			return this._error('ManufacturersService', 'listing', null, err, null, null, correlationId);
		}
	}

	async retrieve(correlationId, user, id) {
		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.manufacturersId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryManufacturers.retrieve(correlationId, id);
		}
		catch (err) {
			return this._error('ManufacturersService', 'retrieve', null, err, null, null, correlationId);
		}
	}
}

export default ManufacturersService;
