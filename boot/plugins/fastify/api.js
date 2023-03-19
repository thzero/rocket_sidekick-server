import Constants from '../../../constants.js';
import RepositoryConstants from '@thzero/library_server_repository_mongo/constants.js';

import FrontApiBootPlugin from '@thzero/library_server_fastify/boot/plugins/apiFront.js';

import contentRepository from '../../../repository/mongo/content.js';
import manufacturersRepository from '../../../repository/mongo/manufacturers.js';
import partsRepository from '../../../repository/mongo/parts.js';
import rocketsRepository from '../../../repository/mongo/rockets.js';
import syncRepository from '../../../repository/mongo/sync.js';

import apiRoute from '../../../routes/fastify/api.js';
import manufacturersRoute from '../../../routes/fastify/manufacturers.js';
import partsRoute from '../../../routes/fastify/parts.js';
import rocketsRoute from '../../../routes/fastify/rockets.js';
import syncRoute from '../../../routes/fastify/sync.js';
import usersRoute from '../../../routes/fastify/users.js';
import utilityRoute from '../../../routes/fastify/utility.js';

import apiService from '../../../service/api.js';
import repositoryCollectionsService from '../../../repository/mongo/collections.js';
import manufacturersService from '../../../service/manufacturers.js';
import partsService from '../../../service/parts.js';
import rocketsService from '../../../service/rockets.js';
import securityService from '../../../service/security.js';
import syncService from '../../../service/sync.js';
import validationService from '../../../service/validation/joi/index.js';
import versionService from '../../../service/version.js';
import utilityService from '../../../service/utility.js';

class AppApiBootPlugin extends FrontApiBootPlugin {
	async _initRepositories() {
		await super._initRepositories();

		this._injectRepository(Constants.InjectorKeys.REPOSITORY_CONTENT, new contentRepository());
		this._injectRepository(Constants.InjectorKeys.REPOSITORY_MANUFACTURERS, new manufacturersRepository());
		this._injectRepository(Constants.InjectorKeys.REPOSITORY_PARTS, new partsRepository());
		this._injectRepository(Constants.InjectorKeys.REPOSITORY_ROCKETS, new rocketsRepository());
		this._injectRepository(Constants.InjectorKeys.REPOSITORY_SYNC, new syncRepository());
	}

	async _initRoutes() {
		await super._initRoutes();

		this._initRoute(new apiRoute());
		this._initRoute(new manufacturersRoute());
		this._initRoute(new partsRoute());
		this._initRoute(new rocketsRoute());
		this._initRoute(new syncRoute());
	}

	_initRoutesUsers() {
		return new usersRoute();
	}

	_initRoutesUtility() {
		return new utilityRoute();
	}

	async _initServices() {
		await super._initServices();

		this._injectService(Constants.InjectorKeys.SERVICE_API, new apiService());

		this._injectService(RepositoryConstants.InjectorKeys.SERVICE_REPOSITORY_COLLECTIONS, new repositoryCollectionsService());

		this._injectService(Constants.InjectorKeys.SERVICE_MANUFACTURERS, new manufacturersService());
		this._injectService(Constants.InjectorKeys.SERVICE_PARTS, new partsService());
		this._injectService(Constants.InjectorKeys.SERVICE_ROCKETS, new rocketsService());
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
