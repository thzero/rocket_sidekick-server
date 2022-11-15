import NewsAdminBootPlugin from '@thzero/library_server_fastify/boot/plugins/admin/news.js';

import adminNewsRepository from '../../../repository/mongo/admin/news.js';

import adminNewsService from '../../../service/admin/news.js';

class AppNewsAdminBootPlugin extends NewsAdminBootPlugin {
	_initRepositoriesAdminNews() {
		return new adminNewsRepository();
	}

	_initServicesAdminNews() {
		return new adminNewsService();
	}
}

export default AppNewsAdminBootPlugin;
