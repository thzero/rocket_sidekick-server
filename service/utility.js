import { Mutex as asyncMutex } from 'async-mutex';

import Constants from '../constants.js';

import Utility from '@thzero/library_common/utility/index.js';

import UtilityService from '@thzero/library_server/service/utility.js';

class AppUtilityService extends UtilityService {
	constructor() {
		super();

		this._repositoryContent = null;
		
		this._cacheContentResults = null;
		this._cacheContentResultsLocales = {};
		this._cacheContentLocalesTitlesDescriptions = null;
		this._mutexContent = new asyncMutex();
		this._mutexContentLocales = new asyncMutex();
		this._mutexContentTitles = new asyncMutex();
		this._ttlContent = null;
		this._ttlContentTitlesDescriptions = null;
		this._ttlContentDiff = 1000 * 60 * 30;
		this._ttlContentDiffTitles = 1000 * 60 * 30;

		this._defaultLocale = 'en';
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryContent = this._injector.getService(Constants.InjectorKeys.REPOSITORY_CONTENT);
	}

	async content(correlationId, body) {
		this._enforceNotNull('AppUtilityService', 'content', 'body', body, correlationId);
		
		await this._contentTitles(correlationId);

		let locale = !String.isNullOrEmpty(body.locale) ? body.locale : this._defaultLocale;
		return await this._content(correlationId, locale);
	}

	async contentReset(correlationId) {
		this._cacheContentResults = null;
		this._cacheContentResultsLocales = {};
		this._cacheContentLocalesTitlesDescriptions = null;
		this._ttlContent = null;
	}

	async _intialize(correlationId, response) {
		return response;
	}

	_openSource(correlationId, openSource) {
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
	}

	async _content(correlationId, locale) {
		this._enforceNotEmpty('AppUtilityService', '_content', 'locale', locale, correlationId);

		const now = Utility.getTimestamp();
		const ttlContent = this._ttlContent ? this._ttlContent : 0;
		const delta = now - ttlContent;

		if (this._cacheContentResultsLocales[locale] && (delta <= this._ttlContentDiff))
			return this._successResponse(this._cacheContentResultsLocales[locale], correlationId);

		const response = await this._contentDetails(correlationId, delta);
		if (this._hasFailed(response))
			return response;

		const responseLocale = await this._contentDetailsLocale(correlationId, this._cacheContentResults.info, locale);
		if (this._hasFailed(responseLocale))
			return responseLocale;

		delete responseLocale.results.info;
		response.results = Utility.cloneDeep(this._cacheContentResults);
		response.results.info = responseLocale.results;
		this._cacheContentResultsLocales[locale] = response.results;

		return this._successResponse(response.results, correlationId);
	}

	async _contentDetails(correlationId, delta) {
		if (this._cacheContentResults && (delta <= this._ttlContentDiff))
			return this._success(correlationId);

		const release = await this._mutexContent.acquire();
		try {
			const response = await this._repositoryContent.content(correlationId);
			if (this._hasFailed(response)) 
				return response;

			response.results.info = response.results.info.filter(l => l.enabled);
			response.results.links = response.results.links.filter(l => l.enabled);
			response.results.tools = response.results.tools.filter(l => l.enabled);

			this._cacheContentResults = response.results;
			this._ttlContent = Utility.getTimestamp();
			return this._success(correlationId);
		}
		finally {
			release();
		}
	}

	async _contentDetailsLocale(correlationId, data, locale) {
		this._enforceNotNull('AppUtilityService', '_content', 'data', data, correlationId);
		this._enforceNotEmpty('AppUtilityService', '_content', 'locale', locale, correlationId);

		const release = await this._mutexContentLocales.acquire();
		try {
			const results2 = [];
			let temp;
			let temp2;
			let locales = [ locale, ... [ this._defaultLocale ] ];
			for (let item of data) {
				item = Utility.cloneDeep(item);
				if (!item.markup) {
					results2.push(item);
					continue;
				}

				for (let localeI of locales) {
					temp = this._cacheContentLocalesTitlesDescriptions[localeI];
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

	async _contentTitles(correlationId) {
		const now = Utility.getTimestamp();
		const ttlContent = this._ttlContentTitlesDescriptions ? this._ttlContentTitlesDescriptions : 0;
		const delta = now - ttlContent;

		if (this._cacheContentLocalesTitlesDescriptions && (delta <= this._ttlContentDiffTitles))
			return this._success(correlationId);

		let release = await this._mutexContentTitles.acquire();
		try {
			const response = await this._repositoryContent.contentLocaleTitlesDescriptions(correlationId);
			if (this._hasFailed(response)) 
				return response;
			this._cacheContentLocalesTitlesDescriptions = {};

			for (const item of response.results) {
				for (let localeI of item.locales) {
					localeI = localeI.toLowerCase();
					if (!this._cacheContentLocalesTitlesDescriptions[localeI])
						this._cacheContentLocalesTitlesDescriptions[localeI] = [];

					this._cacheContentLocalesTitlesDescriptions[localeI].push(item);
				}
				delete item.locale;
			}
			this._ttlContentTitlesDescriptions = Utility.getTimestamp();

			return this._success(correlationId);
		}
		finally {
			release();
		}
	}
}

export default AppUtilityService;
