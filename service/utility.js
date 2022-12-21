import Constants from '../constants.js';

import UtilityService from '@thzero/library_server/service/utility.js';

class AppUtilityService extends UtilityService {
	constructor() {
		super();

		this._repositoryConfig = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryConfig = this._injector.getService(Constants.InjectorKeys.REPOSITORY_CONFIG);
	}

	async _intialize(correlationId, response) {
		// const responsePlans = await this._servicePlans.listing(correlationId);
		// if (this._hasFailed(responsePlans))
		// 	return responsePlans;

		response.results.tools = await this._tools(correlationId);
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
			name: 'rocket_tools-server',
			url: 'https://github.com/thzero/rocket_tools-server',
			licenseName: 'MIT',
			licenseUrl: 'https://github.com/thzero/rocket_tools-server/blob/master/license.md'
		});
	}

	async _tools(correlationId) {
		const response = await this._repositoryConfig.tools(correlationId);
		if (this._hasFailed(response)) 
			return [];

		return response.results;
		// return {
		// 	info: [
		// 		{
		// 			type: 'info',
		// 			title: 'menu.info.epoxy',
		// 			description: 'strings.info.epoxy.desc',
		// 			link: '/tools/epoxy',
		// 			order: 1
		// 		},
		// 	],
		// 	tools: [
		// 		{
		// 			type: 'tool',
		// 			title: 'menu.tools.ejectionCharges',
		// 			description: 'strings.tools.ejectionCharges.desc',
		// 			link: '/tools/epoxy',
		// 			order: 5
		// 		},
		// 		{
		// 			type: 'tool',
		// 			title: 'menu.tools.flightInfo',
		// 			description: 'strings.tools.flightInfo.desc',
		// 			link: '/tools/flightInfo',
		// 			order: 1
		// 		},
		// 		{
		// 			type: 'tool',
		// 			title: 'menu.tools.flightPath',
		// 			description: 'strings.tools.flightPath.desc',
		// 			link: '/tools/flightPath',
		// 			order: 2
		// 		},
		// 		{
		// 			type: 'tool',
		// 			title: 'menu.tools.foam',
		// 			description: 'strings.tools.foam.desc',
		// 			link: '/tools/foam',
		// 			order: 6
		// 		},
		// 		{
		// 			type: 'tool',
		// 			title: 'menu.tools.staticPortHoles',
		// 			description: 'strings.tools.staticPortHoles.desc',
		// 			link: '/tools/staticPortHoles',
		// 			order: 4
		// 		},
		// 		{
		// 			type: 'tool',
		// 			title: 'menu.tools.thrust2Weight',
		// 			description: 'strings.tools.thrust2Weight.desc',
		// 			link: '/tools/thrust2Weight',
		// 			order: 3
		// 		}
		// 	]
		// };
	}
}

export default AppUtilityService;
