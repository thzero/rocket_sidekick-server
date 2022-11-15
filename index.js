import Constants from './constants.js';

import AdminPlugin from './boot/plugins/admin/admin.js';
import NewsAdminPlugin from './boot/plugins/admin/news.js';
import UsersAdminPlugin from './boot/plugins/admin/users.js';

import ApiPlugin from './boot/plugins/fastify/api.js';
import NewsApiPlugin from './boot/plugins/fastify/news.js';
import UsersApiPlugin from './boot/plugins/fastify/users.js';

import BootMain from '@thzero/library_server_fastify/boot/index.js';

import usageMetricsRepository from '@thzero/library_server_repository_mongo/usageMetrics.js';

import pinoLoggerService from '@thzero/library_server_logger_pino';

class AppBootMain extends BootMain {
	_initRepositoriesUsageMetrics() {
		return new usageMetricsRepository();
	}

	_initServicesLoggers() {
		this._registerServicesLogger(Constants.InjectorKeys.SERVICE_LOGGER_PINO, new pinoLoggerService());
	}
}

(async function() {
	await (new AppBootMain()).start(ApiPlugin, NewsApiPlugin, UsersApiPlugin, AdminPlugin, NewsAdminPlugin, UsersAdminPlugin);
})();
