import { Mutex as asyncMutex } from 'async-mutex';

import Constants from '../constants.js';

import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

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

		this._repositoryManufacturers = this._injector.getService(Constants.InjectorKeys.REPOSITORY_MANUFACTURERS);
	}

	async listing(correlationId, user, params) {
		try {
			const now = LibraryCommonUtility.getTimestamp();
			const ttl = this._ttlCache ? this._ttlCache : 0;
			const delta = now - ttl;
	
			if (this._cache && (delta <= this._ttlCache))
				return this._successResponse(this._cache, correlationId);
	
			let release = await this._mutexCache.acquire();
			try {
				const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.manufacturersParams, params);
				if (this._hasFailed(validationResponse))
					return validationResponse;
		
				const response = await this._repositoryManufacturers.listing(correlationId, params);
				if (this._hasFailed(response))
					return response;
	
				this._cache = response.results;
				this._ttlCache = LibraryCommonUtility.getTimestamp();
	
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
