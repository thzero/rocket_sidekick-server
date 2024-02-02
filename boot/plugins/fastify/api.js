import AppConstants from '../../../constants.js';
import RepositoryConstants from '@thzero/library_server_repository_mongo/constants.js';

import FrontApiBootPlugin from '@thzero/library_server_fastify/boot/plugins/apiFront.js';

import checklistsRepository from '../../../repository/mongo/checklists.js';
import contentRepository from '../../../repository/mongo/content.js';
import countriesRepository from '../../../repository/mongo/countries.js';
import launchesRepository from '../../../repository/mongo/launches.js';
import locationsRepository from '../../../repository/mongo/locations.js';
import manufacturersRepository from '../../../repository/mongo/manufacturers.js';
import motorsRepository from '../../../repository/mongo/motors.js';
import partsRepository from '../../../repository/mongo/parts.js';
import pubSubRepository from '../../../repository/mongo/pubSub.js';
import rocketsRepository from '../../../repository/mongo/rockets.js';
import rocketSetupsRepository from '../../../repository/mongo/rocketSetups.js';
import syncRepository from '../../../repository/mongo/sync.js';

import checklistsRoute from '../../../routes/fastify/checklists.js';
import countriesRoute from '../../../routes/fastify/countries.js';
import apiRoute from '../../../routes/fastify/api.js';
import launchesRoute from '../../../routes/fastify/launches.js';
import locationsRoute from '../../../routes/fastify/locations.js';
import manufacturersRoute from '../../../routes/fastify/manufacturers.js';
import motorsRoute from '../../../routes/fastify/motors.js';
import partsRoute from '../../../routes/fastify/parts.js';
import rocketsRoute from '../../../routes/fastify/rockets.js';
import rocketSetupsRoute from '../../../routes/fastify/rocketSetups.js';
import syncRoute from '../../../routes/fastify/sync.js';
import utilityRoute from '../../../routes/fastify/utility.js';

import apiService from '../../../service/api.js';
import checklistsService from '../../../service/checklists.js';
import communicationRestService from '@thzero/library_server_service_rest_axios';
import countriesService from '../../../service/countries.js';
import externalMotorSearchService from '../../../service/external/motorSearchThrustCurve.js';
import repositoryCollectionsService from '../../../repository/mongo/collections.js';
import launchesService from '../../../service/launches.js';
import locationsService from '../../../service/locations.js';
import manufacturersService from '../../../service/manufacturers.js';
import motorsService from '../../../service/motors.js';
import partsService from '../../../service/parts.js';
import pubSubService from '../../../service/pubSub.js';
import rocketsService from '../../../service/rockets.js';
import rocketSetupsService from '../../../service/rocketSetups.js';
import securityService from '../../../service/security.js';
import syncService from '../../../service/sync.js';
import validationService from '../../../service/validation/joi/index.js';
import versionService from '../../../service/version.js';
import utilityService from '../../../service/utility.js';

class AppApiBootPlugin extends FrontApiBootPlugin {
	async _initRepositories() {
		await super._initRepositories();

		this._injectRepository(AppConstants.InjectorKeys.REPOSITORY_CHECKLISTS, new checklistsRepository());
		this._injectRepository(AppConstants.InjectorKeys.REPOSITORY_CONTENT, new contentRepository());
		this._injectRepository(AppConstants.InjectorKeys.REPOSITORY_COUNTRIES, new countriesRepository());
		this._injectRepository(AppConstants.InjectorKeys.REPOSITORY_LAUNCHES, new launchesRepository());
		this._injectRepository(AppConstants.InjectorKeys.REPOSITORY_LOCATIONS, new locationsRepository());
		this._injectRepository(AppConstants.InjectorKeys.REPOSITORY_MANUFACTURERS, new manufacturersRepository());
		this._injectRepository(AppConstants.InjectorKeys.REPOSITORY_MOTORS, new motorsRepository());
		this._injectRepository(AppConstants.InjectorKeys.REPOSITORY_PARTS, new partsRepository());
		this._injectRepository(AppConstants.InjectorKeys.REPOSITORY_PUBSUB, new pubSubRepository());
		this._injectRepository(AppConstants.InjectorKeys.REPOSITORY_ROCKETS, new rocketsRepository());
		this._injectRepository(AppConstants.InjectorKeys.REPOSITORY_ROCKETSETUPS, new rocketSetupsRepository());
		this._injectRepository(AppConstants.InjectorKeys.REPOSITORY_SYNC, new syncRepository());
	}

	async _initRoutes() {
		await super._initRoutes();

		this._initRoute(new apiRoute());
		this._initRoute(new checklistsRoute());
		this._initRoute(new countriesRoute());
		this._initRoute(new launchesRoute());
		this._initRoute(new locationsRoute());
		this._initRoute(new manufacturersRoute());
		this._initRoute(new motorsRoute());
		this._initRoute(new partsRoute());
		this._initRoute(new rocketsRoute());
		this._initRoute(new rocketSetupsRoute());
		this._initRoute(new syncRoute());
	}

	_initRoutesUtility() {
		return new utilityRoute();
	}

	async _initServices() {
		await super._initServices();

		this._injectService(AppConstants.InjectorKeys.SERVICE_API, new apiService());

		this._injectService(AppConstants.InjectorKeys.SERVICE_CHECKLISTS, new checklistsService());

		this._injectService(AppConstants.InjectorKeys.SERVICE_COMMUNICATION_REST, new communicationRestService());

		this._injectService(AppConstants.InjectorKeys.SERVICE_COUNTRIES, new countriesService());

		this._injectService(AppConstants.InjectorKeys.SERVICE_EXTERNAL_MOTOR_SEARCH, new externalMotorSearchService());

		this._injectService(RepositoryConstants.InjectorKeys.SERVICE_REPOSITORY_COLLECTIONS, new repositoryCollectionsService());

		this._injectService(AppConstants.InjectorKeys.SERVICE_LAUNCHES, new launchesService());

		this._injectService(AppConstants.InjectorKeys.SERVICE_LOCATIONS, new locationsService());

		this._injectService(AppConstants.InjectorKeys.SERVICE_MANUFACTURERS, new manufacturersService());

		this._injectService(AppConstants.InjectorKeys.SERVICE_MOTORS, new motorsService());
		this._injectService(AppConstants.InjectorKeys.SERVICE_PARTS, new partsService());

		this._injectService(AppConstants.InjectorKeys.SERVICE_PUBSUB, new pubSubService());

		this._injectService(AppConstants.InjectorKeys.SERVICE_ROCKETS, new rocketsService());
		this._injectService(AppConstants.InjectorKeys.SERVICE_ROCKETSETUPS, new rocketSetupsService());

		this._injectService(AppConstants.InjectorKeys.SERVICE_SYNC, new syncService());

		this._injectService(AppConstants.InjectorKeys.SERVICE_VALIDATION, new validationService());
	}

	_initServicesSecurity() {
		return new securityService();
	}

	_initServicesUtility() {
		return new utilityService();
	}

	_initServicesVersion() {
		return new versionService();
	}
}

export default AppApiBootPlugin;
