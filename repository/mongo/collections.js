import ApiCollectionsService from '@thzero/library_server_repository_mongo/collections/api.js';

class AppCollectionsService extends ApiCollectionsService {
	getClientName() {
		// return AppCollectionsService.Client;
		const clientName = this._config.get('db.default');
		return clientName;
	}
	
	getCollectionByName(correlationId, collectionName) {
		if (String.isNullOrEmpty(collectionName))
			return null;
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, collectionName);
	}

	getCollectionChecklists(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionChecklists);
	}

	getCollectionContent(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionContent);
	}

	getCollectionCountries(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionCountries);
	}

	getCollectionInventory(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionInventory);
	}

	getCollectionLaunches(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionLaunches);
	}

	getCollectionLocations(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionLocations);
	}

	getCollectionManufacturers(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionManufacturers);
	}

	getCollectionNews(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionNews);
	}

	getCollectionParts(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionParts);
	}

	getCollectionPlans(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionPlans);
	}

	getCollectionPubSub(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionPubSub);
	}

	getCollectionRockets(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionRockets);
	}

	getCollectionRocketSetups(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionRocketSetups);
	}

	getCollectionUsageMetrics(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionUsageMetrics);
	}

	getCollectionUsageMetricsMeasurements(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionUsageMetricsMeasurements);
	}

	getCollectionUsers(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionUsers);
	}

	static Client = 'mongo';
	static Database = 'rocketSidekick';
	static CollectionChecklists = 'checklists';
	static CollectionContent = 'content';
	static CollectionCountries = 'countries';
	static CollectionInventory = 'inventory';
	static CollectionLaunches = 'launches';
	static CollectionLocations = 'locations';
	static CollectionManufacturers = 'manufacturers';
	static CollectionNews = 'news';
	static CollectionParts = 'parts';
	static CollectionPlans = 'plans';
	static CollectionPubSub = 'pubsub';
	static CollectionRockets = 'rockets';
	static CollectionRocketSetups = 'rocketSetups';
	static CollectionUsageMetrics = 'usageMetrics';
	static CollectionUsageMetricsMeasurements = 'usageMetricsMeasurements';
	static CollectionUsers = 'users';
}

export default AppCollectionsService;

