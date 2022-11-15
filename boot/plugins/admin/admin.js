// import Constants from '../../../constants.js';

import BootPlugin from '@thzero/library_server/boot/plugins/index.js';

class AppAdminBootPlugin extends BootPlugin {
	async _initRepositories() {
		await super._initRepositories();

		// Admin Updates
	}

	async _initRoutes() {
		await super._initRoutes();
	}

	async _initServices() {
		await super._initServices();
	}
}

export default AppAdminBootPlugin;
