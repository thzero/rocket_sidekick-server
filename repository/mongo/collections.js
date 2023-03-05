import ApiCollectionsService from '@thzero/library_server_repository_mongo/collections/api.js';

class AppCollectionsService extends ApiCollectionsService {
	getClientName() {
		return AppCollectionsService.Client;
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

	getCollectionManufacturers(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionManufacturers);
	}

	getCollectionNews(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionNews);
	}

	getCollectionPlans(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionPlans);
	}

	getCollectionRockets(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionRockets);
	}

	getCollectionUsageMetrics(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionUsageMetrics);
	}

	getCollectionUsers(correlationId) {
		return this._getCollection(correlationId, AppCollectionsService.Client, AppCollectionsService.Database, AppCollectionsService.CollectionUsers);
	}

	static Client = 'atlas';
	static Database = 'rocketSidekick';
	static CollectionChecklists = 'checklists';
	static CollectionContent = 'content';
	static CollectionManufacturers = 'mManufacturers';
	static CollectionNews = 'news';
	static CollectionPlans = 'plans';
	static CollectionRockets = 'rockets';
	static CollectionUsageMetrics = 'usageMetrics';
	static CollectionUsers = 'users';
}

export default AppCollectionsService;

