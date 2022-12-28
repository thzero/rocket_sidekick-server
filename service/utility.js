import { Mutex as asyncMutex } from 'async-mutex';

import Constants from '../constants.js';

import Utility from '@thzero/library_common/utility/index.js';

import UtilityService from '@thzero/library_server/service/utility.js';

class AppUtilityService extends UtilityService {
	constructor() {
		super();

		this._repositoryConfig = null;
		
		this._contentResults = null;
		this._mutexContent = new asyncMutex();
		this._ttlContent = null;
		this._ttlContentDiff = 1000 * 60 * 30;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryConfig = this._injector.getService(Constants.InjectorKeys.REPOSITORY_CONFIG);
	}

	async resetContent(correlationId) {
		this._contentResults = null;
		this._ttlContent = null;
	}

	async _intialize(correlationId, response) {
		// const responsePlans = await this._servicePlans.listing(correlationId);
		// if (this._hasFailed(responsePlans))
		// 	return responsePlans;

		response.results.content = await this._content(correlationId);
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

	async _content(correlationId) {
		const now = Utility.getTimestamp();
		const ttlContent = this._ttlContent ? this._ttlContent : 0;
		const delta = now - ttlContent;
		if (this._contentResults && (delta <= this._ttlContentDiff))
			return this._contentResults;

		const release = await this._mutexContent.acquire();
		try {
			const response = await this._repositoryConfig.content(correlationId);
			if (this._hasFailed(response)) 
				return [];

			response.results.info = response.results.info.filter(l => l.enabled);
			response.results.links = response.results.links.filter(l => l.enabled);
			response.results.tools = response.results.tools.filter(l => l.enabled);

			this._contentResults = response.results;
			this._ttlContent = Utility.getTimestamp();
			return response.results;
		}
		finally {
			release();
		}
	}
}

export default AppUtilityService;
