import Constants from '../../../constants.js';
import RepositoryConstants from '@thzero/library_server_repository_mongo/constants.js';

import FrontApiBootPlugin from '@thzero/library_server_fastify/boot/plugins/apiFront.js';

import configRepository from '../../../repository/mongo/config.js';
import syncRepository from '../../../repository/mongo/sync.js';

import apiRoute from '../../../routes/fastify/api.js';
import syncRoute from '../../../routes/fastify/sync.js';
import usersRoute from '../../../routes/fastify/users.js';

import apiService from '../../../service/api.js';
import repositoryCollectionsService from '../../../repository/mongo/collections.js';
import securityService from '../../../service/security.js';
import syncService from '../../../service/sync.js';
import validationService from '../../../service/validation/joi/index.js';
import versionService from '../../../service/version.js';
import utilityService from '../../../service/utility.js';

class AppApiBootPlugin extends FrontApiBootPlugin {
	async _initRepositories() {
		await super._initRepositories();

		this._injectRepository(Constants.InjectorKeys.REPOSITORY_CONFIG, new configRepository());
		this._injectRepository(Constants.InjectorKeys.REPOSITORY_SYNC, new syncRepository());
	}

	async _initRoutes() {
		await super._initRoutes();

		this._initRoute(new apiRoute());
		this._initRoute(new syncRoute());
	}

	_initRoutesUsers() {
		return new usersRoute();
	}

	async _initServices() {
		await super._initServices();

		this._injectService(Constants.InjectorKeys.SERVICE_API, new apiService());

		this._injectService(RepositoryConstants.InjectorKeys.SERVICE_REPOSITORY_COLLECTIONS, new repositoryCollectionsService());

		this._injectService(Constants.InjectorKeys.SERVICE_SYNC, new syncService());

		this._injectService(Constants.InjectorKeys.SERVICE_VALIDATION, new validationService());
	}

	_initServicesSecurity() {
		return new securityService();
	}

	_initServicesVersion() {
		return new versionService();
	}

	_initServicesUtility() {
		return new utilityService();
	}
}

export default AppApiBootPlugin;
