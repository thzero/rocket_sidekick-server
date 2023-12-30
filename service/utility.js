import { Mutex as asyncMutex } from 'async-mutex';
import SnappyJS from 'snappyjs';
import { decode, encode } from 'cbor-x';

import Constants from '../constants.js';

import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

import UtilityService from '@thzero/library_server/service/utility.js';

class AppUtilityService extends UtilityService {
	constructor() {
		super();

		this._repositoryContent = null;
		this._repositorySync = null;
		
		this._cacheContentListing = null;
		this._cacheContentListingLocales = {};
		this._cacheContentListingLocalesTitlesDescriptions = null;
		this._cacheContentMarkup = {};
		this._mutexContentListing = new asyncMutex();
		this._mutexContentListingLocales = new asyncMutex();
		this._mutexContentListingTitlesDescriptions = new asyncMutex();
		this._mutexContentMarkup = new asyncMutex();
		this._ttlContentListing = null;
		this._ttlContentMarkup = null;
		this._ttlContentListingTitlesDescriptions = null;
		this._ttlContentListingDiff = 1000 * 60 * 30;
		this._ttlContentListingDiffTitlesDescriptions = 1000 * 60 * 30;
		this._ttlContentMarkup = null;
		this._ttlContentMarkupDiff = 1000 * 60 * 30;

		this._defaultLocale = 'en';
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryContent = this._injector.getService(Constants.InjectorKeys.REPOSITORY_CONTENT);
		this._repositorySync = this._injector.getService(Constants.InjectorKeys.REPOSITORY_SYNC);
	}

	async contentListing(correlationId, body) {
		this._enforceNotNull('AppUtilityService', 'contentListing', 'body', body, correlationId);

		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.content, body);
			if (this._hasFailed(validationResponse))
				return validationResponse;
			
			await this._contentListingTitlesDescriptions(correlationId);
	
			let locale = !String.isNullOrEmpty(body.locale) ? body.locale : this._defaultLocale;
			return await this._contentListing(correlationId, locale);
		}
		catch (err) {
			return this._error('AppUtilityService', 'contentListing', null, err, null, null, correlationId);
		}
	}

	async contentMarkup(correlationId, body) {
		this._enforceNotNull('AppUtilityService', 'contentMarkup', 'body', body, correlationId);

		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.contentMarkup, body);
			if (this._hasFailed(validationResponse))
				return validationResponse;
			
			let locale = !String.isNullOrEmpty(body.locale) ? body.locale : this._defaultLocale;
			return await this._contentMarkup(correlationId, body.contentId, locale);
		}
		catch (err) {
			return this._error('AppUtilityService', 'contentMarkup', null, err, null, null, correlationId);
		}
	}

	async contentReset(correlationId, body) {
		this._enforceNotNull('AppUtilityService', 'contentReset', 'body', body, correlationId);

		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.contentReset, body, null, 'sdfsdf');
			if (this._hasFailed(validationResponse))
				return validationResponse;
			// TODO: ContentId based resetting..
			
			this._cacheContentListing = null;
			this._cacheContentListingLocales = {};
			this._cacheContentListingLocalesTitlesDescriptions = null;
			this._cacheContentMarkup = {};
			this._ttlContentListing = null;
			this._ttlContentListingTitlesDescriptions = null;
			this._ttlContentListingDiff = 1000 * 60 * 30;
			this._ttlContentListingDiffTitlesDescriptions = 1000 * 60 * 30;
			this._ttlContentMarkup = null;

			return this._success(correlationId);
		}
		catch (err) {
			return this._error('AppUtilityService', 'contentReset', null, err, null, null, correlationId);
		}
	}

	async _intialize(correlationId, response) {
		return response;
	}

	_openSource(correlationId, openSource) {
		openSource.push({
			category: 'server',
			name: 'cbor-x',
			url: 'https://github.com/kriszyp/cbor-x',
			licenseName: 'MIT',
			licenseUrl: 'https://github.com/kriszyp/cbor-x/blob/master/LICENSE'
		});
		openSource.push({
			category: 'server',
			name: 'countries-states-cities-database',
			url: 'https://github.com/dr5hn/countries-states-cities-database',
			licenseName: 'ODC',
			licenseUrl: 'https://github.com/dr5hn/countries-states-cities-database/blob/master/LICENSE'
		});
		openSource.push({
			category: 'server',
			name: 'pino-pretty',
			url: 'https://github.com/pinojs/pino-pretty',
			licenseName: 'MIT',
			licenseUrl: 'https://github.com/pinojs/pino-pretty/blob/master/LICENSE'
		});
		openSource.push({
			category: 'server',
			name: 'rocket_sidekick-server',
			url: 'https://github.com/thzero/rocket_sidekick-server',
			licenseName: 'MIT',
			licenseUrl: 'https://github.com/thzero/rocket_sidekick-server/blob/master/license.md'
		});
		openSource.push({
			category: 'server',
			name: 'snappyjs',
			url: 'https://github.com/zhipeng-jia/snappyjs',
			licenseName: 'MIT',
			licenseUrl: 'https://github.com/zhipeng-jia/snappyjs/blob/master/LICENSE'
		});
	}

	async _contentListing(correlationId, locale) {
		this._enforceNotEmpty('AppUtilityService', '_contentListing', 'locale', locale, correlationId);

		const now = LibraryCommonUtility.getTimestamp();
		const ttlContent = this._ttlContentListing ? this._ttlContentListing : 0;
		const delta = now - ttlContent;

		if (this._cacheContentListingLocales[locale] && (delta <= this._ttlContentListingDiff))
			return this._successResponse(this._cacheContentListingLocales[locale], correlationId);

		const response = await this._contentListingDetails(correlationId, delta);
		if (this._hasFailed(response))
			return response;

		const responseLocale = await this._contentListingDetailsLocale(correlationId, this._cacheContentListing.info, locale);
		if (this._hasFailed(responseLocale))
			return responseLocale;

		delete responseLocale.results.info;
		response.results = LibraryCommonUtility.cloneDeep(this._cacheContentListing);
		response.results.info = responseLocale.results;
		this._cacheContentListingLocales[locale] = response.results;

		return this._successResponse(response.results, correlationId);
	}

	async _contentListingDetails(correlationId, delta) {
		if (this._cacheContentListing && (delta <= this._ttlContentListingDiff))
			return this._success(correlationId);

		const release = await this._mutexContentListing.acquire();
		try {
			const response = await this._repositoryContent.contentListing(correlationId);
			if (this._hasFailed(response)) 
				return response;

			const now = LibraryCommonUtility.getTimestamp();
			response.results.info = (response.results && response.results.length > 0) ? response.results.info.filter(l => this._contentListingFilter(l, now)) : [];
			response.results.links = (response.results && response.results.length > 0) ? response.results.links.filter(l => this._contentListingFilter(l, now)) : [];
			response.results.tools = (response.results && response.results.length > 0) ? response.results.tools.filter(l => this._contentListingFilter(l, now)) : [];

			this._cacheContentListing = response.results;
			this._ttlContentListing = LibraryCommonUtility.getTimestamp();
			return this._success(correlationId);
		}
		finally {
			release();
		}
	}

	async _contentListingDetailsLocale(correlationId, data, locale) {
		this._enforceNotNull('AppUtilityService', '_contentListingDetails', 'data', data, correlationId);
		this._enforceNotEmpty('AppUtilityService', '_contentListingDetails', 'locale', locale, correlationId);

		const release = await this._mutexContentListingLocales.acquire();
		try {
			const results2 = [];
			let temp;
			let temp2;
			let locales = [ locale, ... [ this._defaultLocale ] ];
			for (let item of data) {
				item = LibraryCommonUtility.cloneDeep(item);
				if (!item.markup) {
					results2.push(item);
					continue;
				}

				for (let localeI of locales) {
					temp = this._cacheContentListingLocalesTitlesDescriptions[localeI];
					if (!temp)
						continue;
					
					temp2 = temp.find(l => l.id === ('info.' + item.id));
					if (temp2)
						break;
				}

				if (temp2) {
					item.title = temp2.title;
					item.description = temp2.description;
				}
				results2.push(item);
			}

			return this._successResponse(results2, correlationId);
		}
		finally {
			release();
		}
	}

	_contentListingFilter(item, timestamp) {
		if (!item.enabled)
			return false;
		if (item.publishedEffDt && (timestamp < item.publishedEffDt))
			return false;
		if (item.publishedEndDt && (timestamp <= item.publishedEndDt))
			return false;
		return true;
	}

	async _contentListingTitlesDescriptions(correlationId) {
		const now = LibraryCommonUtility.getTimestamp();
		const ttlContent = this._ttlContentListingTitlesDescriptions ? this._ttlContentListingTitlesDescriptions : 0;
		const delta = now - ttlContent;

		if (this._cacheContentListingLocalesTitlesDescriptions && (delta <= this._ttlContentListingDiffTitlesDescriptions))
			return this._success(correlationId);

		let release = await this._mutexContentListingTitlesDescriptions.acquire();
		try {
			const response = await this._repositoryContent.contentListingLocaleTitlesDescriptions(correlationId);
			if (this._hasFailed(response)) 
				return response;

			this._cacheContentListingLocalesTitlesDescriptions = {};
			for (const item of response.results) {
				if (item.locales) {
					for (let localeI of item.locales) {
						localeI = localeI.toLowerCase();
						if (!this._cacheContentListingLocalesTitlesDescriptions[localeI])
							this._cacheContentListingLocalesTitlesDescriptions[localeI] = [];
	
						this._cacheContentListingLocalesTitlesDescriptions[localeI].push(item);
					}
				}
				delete item.locales;
			}
			this._ttlContentListingTitlesDescriptions = LibraryCommonUtility.getTimestamp();

			return this._success(correlationId);
		}
		finally {
			release();
		}
	}

	async _contentMarkup(correlationId, contentId, locale) {
		this._enforceNotEmpty('AppUtilityService', '_contentMarkup', 'contentId', contentId, correlationId);
		this._enforceNotEmpty('AppUtilityService', '_contentMarkup', 'locale', locale, correlationId);

		const now = LibraryCommonUtility.getTimestamp();
		const ttlContent = this._ttlContentMarkup ? this._ttlContentMarkup : 0;
		const delta = now - ttlContent;

		const key = contentId + locale;

		if (this._cacheContentMarkup[key] && (delta <= this._ttlContentMarkupDiff)) {
			// const data = this._cacheContentMarkup[key];
			const compressed = this._cacheContentMarkup[key];
			const serializedBuffer = SnappyJS.uncompress(compressed);
			const data = decode(serializedBuffer);
			return this._successResponse(data, correlationId);
		}

		const release = await this._mutexContentMarkup.acquire();
		try {
			const response = await this._repositoryContent.contentMarkup(correlationId, contentId, locale, this._defaultLocale);
			if (this._hasFailed(response)) 
				return response;
			if (!response.results)
				return response;

			// this._cacheContentMarkup[key] = response.results;
			const serializedBuffer = encode(response.results);
			const compressed = SnappyJS.compress(serializedBuffer);
			this._cacheContentMarkup[key] = compressed;
			this._ttlContentMarkup = LibraryCommonUtility.getTimestamp();
			return response;
		}
		finally {
			release();
		}
	}
}

export default AppUtilityService;
