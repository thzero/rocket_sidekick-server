import UtilityService from '@thzero/library_server/service/utility.js';

class AppUtilityService extends UtilityService {
	constructor() {
		super();
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
}

export default AppUtilityService;
