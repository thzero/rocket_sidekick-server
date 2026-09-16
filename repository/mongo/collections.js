import UserApiCollectionsService from '@thzero/library_server_repository_mongo/collections/user.js';

class AppCollectionsService extends UserApiCollectionsService {
	getCollectionByName(correlationId, collectionName) {
		if (String.isNullOrEmpty(collectionName))
			return null;
		return this._getCollection(correlationId, this.getClientName(), collectionName);
	}

	getCollectionChecklists(correlationId) {
		return this._getCollection(correlationId, this.getClientName(), AppCollectionsService.CollectionChecklists);
	}

	getCollectionContent(correlationId) {
		return this._getCollection(correlationId, this.getClientName(), AppCollectionsService.CollectionContent);
	}

	getCollectionCountries(correlationId) {
		return this._getCollection(correlationId, this.getClientName(), AppCollectionsService.CollectionCountries);
	}

	getCollectionInventory(correlationId) {
		return this._getCollection(correlationId, this.getClientName(), AppCollectionsService.CollectionInventory);
	}

	getCollectionLaunches(correlationId) {
		return this._getCollection(correlationId, this.getClientName(), AppCollectionsService.CollectionLaunches);
	}

	getCollectionLocations(correlationId) {
		return this._getCollection(correlationId, this.getClientName(), AppCollectionsService.CollectionLocations);
	}

	getCollectionManufacturers(correlationId) {
		return this._getCollection(correlationId, this.getClientName(), AppCollectionsService.CollectionManufacturers);
	}

	getCollectionNews(correlationId) {
		return this._getCollection(correlationId, this.getClientName(), AppCollectionsService.CollectionNews);
	}

	getCollectionParts(correlationId) {
		return this._getCollection(correlationId, this.getClientName(), AppCollectionsService.CollectionParts);
	}

	getCollectionPlans(correlationId) {
		return this._getCollection(correlationId, this.getClientName(), AppCollectionsService.CollectionPlans);
	}

	getCollectionPubSub(correlationId) {
		return this._getCollection(correlationId, this.getClientName(), AppCollectionsService.CollectionPubSub);
	}

	getCollectionRockets(correlationId) {
		return this._getCollection(correlationId, this.getClientName(), AppCollectionsService.CollectionRockets);
	}

	getCollectionRocketSetups(correlationId) {
		return this._getCollection(correlationId, this.getClientName(), AppCollectionsService.CollectionRocketSetups);
	}

	getCollectionUsageMetrics(correlationId) {
		return this._getCollection(correlationId, this.getClientName(), AppCollectionsService.CollectionUsageMetrics);
	}

	getCollectionUsageMetricsMeasurements(correlationId) {
		return this._getCollection(correlationId, this.getClientName(), AppCollectionsService.CollectionUsageMetricsMeasurements);
	}

	getCollectionUsers(correlationId) {
		return this._getCollection(correlationId, this.getClientName(), AppCollectionsService.CollectionUsers);
	}

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

