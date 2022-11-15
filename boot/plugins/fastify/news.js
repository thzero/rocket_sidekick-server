import NewsApiBootPlugin from '@thzero/library_server_fastify/boot/plugins/news.js';

import newsRepository from '@thzero/library_server_repository_mongo/news.js';

import newsService from '../../../service/news/index.js';
import newsValidationService from '../../../service/news/validation/joi/index.js';

class AppNewsApiBootPlugin extends NewsApiBootPlugin {
	_initRepositoriesNews() {
		return new newsRepository();
	}

	_initServicesNews() {
		return new newsService();
	}

	_initServicesNewsValidation() {
		return new newsValidationService();
	}
}

export default AppNewsApiBootPlugin;
