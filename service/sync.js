import Constants from '../constants.js';
import LibraryServerConstants from '@thzero/library_server/constants.js';

import LibraryMomentUtility from '@thzero/library_common/utility/moment.js';

import Service from '@thzero/library_server/service/index.js';

class SyncService extends Service {
	constructor() {
		super();

		this._repositorySync = null;
		this._serviceUsers = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositorySync = this._injector.getService(Constants.InjectorKeys.REPOSITORY_SYNC);

		this._serviceUsers = this._injector.getService(LibraryServerConstants.InjectorKeys.SERVICE_USERS);
	}

	async syncFrom(correlationId, user, params) {
		try {
			const validationSyncResponse = this._serviceValidation.check(correlationId, this._serviceValidation.syncFrom, params);
			if (this._hasFailed(validationSyncResponse))
				return validationSyncResponse;
	
			// const responseSyncChecklists = await this._syncChecklists(correlationId, user, params.rockets, params.lastSyncTimestamp);
			// if (this._hasFailed(responseSyncChecklists))
			// 	return responseSyncChecklists;
	
			// const responseSyncRockets = await this._syncRockets(correlationId, user, params.rockets, params.lastSyncTimestamp);
			// if (this._hasFailed(responseSyncRockets))
			// 	return responseSyncRockets;
	
			// const response = this._initResponse(correlationId);
			// response.results = {
			// 	// checklists: responseSyncChecklists.results,
			// 	rockets: responseSyncRockets.results
			// }
			// response.results.lastSyncTimestamp = LibraryMomentUtility.getTimestamp();
			// return response;
	
			const collectionNames = params.collections;
			const response = this._initResponse(correlationId);
			response.results = {};
	
			let responseSync;
			let objects;
			for(const collectionName of collectionNames) {
				objects = params.objects.find(l => l.id.toLowerCase() === collectionName.toLowerCase());
				if (!objects) {
					this._logger.warn('SyncService', 'syncFrom', `Item for collection '${collectionName}' not found.`, null, correlationId);
					continue;
				}
				objects = objects.objects;
				if (!objects) {
					this._logger.warn('SyncService', 'syncFrom', `Objects for collection '${collectionName}' not found.`, null, correlationId);
					continue;
				}
	
				responseSync = await this._syncUpdates(correlationId, collectionName, user, objects, params.lastSyncTimestamp);
				if (this._hasFailed(responseSync))
					return responseSync;
	
				response.results[collectionName] = responseSync.results;
			}
	
			response.results.lastSyncTimestamp = LibraryMomentUtility.getTimestamp();
			return response;
		}
		catch (err) {
			return this._error('SyncService', 'syncFrom', null, err, null, null, correlationId);
		}
	}

	async _sync(correlationId, clientObjects, serverObjects) {
		const response = this._initResponse(correlationId);

		// get all the ids from the client and server...
		const idsFromClient = clientObjects.map(l => l.identifier);
		const idsFromServer = serverObjects.map(l => l.identifier);

		// determine any collisions by id... 
		const collisions = [];
		const collisionsIds = [ idsFromServer, idsFromClient ].reduce((a, c) => a.filter(i => c.includes(i)));
		if (collisionsIds.length > 0) { 
			for (const identifier of collisionsIds) {
				collisions.push({
					client: clientObjects.filter(l => l.identifier === identifier),
					server: serverObjects.filter(l => l.identifier === identifier),
				});
				clientObjects = clientObjects.filter(l => l.identifier !== identifier);
				serverObjects = serverObjects.filter(l => l.identifier !== identifier);
			}
		}

		// determine where the update takes place
		let clientLastSyncTimestamp;
		let serverLastSyncTimestamp;
		for(const collision of collisions) {
			clientLastSyncTimestamp = collision.client !== null ? collision.client.lastSyncTimestamp : 0;
			serverLastSyncTimestamp = collision.client !== null ? collision.client.lastSyncTimestamp : 0;
			clientLastSyncTimestamp = clientLastSyncTimestamp !== null ? clientLastSyncTimestamp : 0;
			serverLastSyncTimestamp = serverLastSyncTimestamp !== null ? serverLastSyncTimestamp : 0;

			// if client is greater than server, then add to the client objects to store on server...
			if (clientLastSyncTimestamp > serverLastSyncTimestamp) {
				clientObjects.push(collision.client);
				continue;
			}

			// otherwise then add to the server objects to store on the client...
			serverObjects.push(collision.server);
		}

		response.success = true;
		response.results = {
			clientObjects: clientObjects,
			serverObjects: serverObjects
		};
		return response;
	}

	async _syncUpdates(correlationId, collectionName, user, clientObjects, lastSyncTimestamp) {
		// const responseSyncServer = await this._repositorySync.searchBySyncTimestampChecklists(correlationId, user.id, lastSyncTimestamp);
		const responseSyncServer = await this._repositorySync.searchBySyncTimestamp(correlationId, collectionName, user.id, lastSyncTimestamp);
		if (this._hasFailed(responseSyncServer))
			return responseSyncServer;

		const responseSync = await this._sync(correlationId, [ ...clientObjects ], [ ...responseSyncServer.results.data]);
		if (this._hasFailed(responseSync))
			return responseSync;

		// update the client objects onto the server
		// const responseSyncServerUpdates = await this._repositorySync.updateChecklists(correlationId, user.id, responseSync.results.clientObjects);
		const responseSyncServerUpdates = await this._repositorySync.update(correlationId, user.id, collectionName, responseSync.results.clientObjects);
		if (this._hasFailed(responseSyncServerUpdates))
			return responseSyncServerUpdates;

		// return server objects to the client
		const response = this._initResponse(correlationId);
		response.results = { 
			clientObjects: responseSyncServerUpdates.results,
			serverObjects: responseSync.results.serverObjects 
		};
		return response;
	}

	async _syncChecklists(correlationId, user, clientObjects, lastSyncTimestamp) {
		// const responseSyncServer = await this._repositorySync.searchBySyncTimestampChecklists(correlationId, user.id, lastSyncTimestamp);
		const responseSyncServer = await this._repositorySync.searchBySyncTimestamp(correlationId, 'checklists', user.id, lastSyncTimestamp);
		if (this._hasFailed(responseSyncServer))
			return responseSyncServer;

		const responseSync = await this._sync(correlationId, [ ...clientObjects ], [ ...responseSyncServer.results.data]);
		if (this._hasFailed(responseSync))
			return responseSync;

		// update the client objects onto the server
		// const responseSyncServerUpdates = await this._repositorySync.updateChecklists(correlationId, user.id, responseSync.results.clientObjects);
		const responseSyncServerUpdates = await this._repositorySync.update(correlationId, user.id, 'checklists', responseSync.results.clientObjects);
		if (this._hasFailed(responseSyncServerUpdates))
			return responseSyncServerUpdates;

		// return server objects to the client
		const response = this._initResponse(correlationId);
		response.results = { 
			clientObjects: responseSyncServerUpdates.results,
			serverObjects: responseSync.results.serverObjects 
		};
		return response;
	}

	async _syncRockets(correlationId, user, clientObjects, lastSyncTimestamp) {
		// const responseSyncServer = await this._repositorySync.searchBySyncTimestampRockets(correlationId, user.id, lastSyncTimestamp);
		const responseSyncServer = await this._repositorySync.searchBySyncTimestamp(correlationId, 'rockets', user.id, lastSyncTimestamp);
		if (this._hasFailed(responseSyncServer))
			return responseSyncServer;

		const responseSync = await this._sync(correlationId, [ ...(clientObjects ? clientObjects : []) ], [ ...(responseSyncServer.results.data ? responseSyncServer.results.data : []) ]);
		if (this._hasFailed(responseSync))
			return responseSync;

		// update the client objects onto the server
		// const responseSyncServerUpdates = await this._repositorySync.updateRockets(correlationId, user.id, responseSync.results.clientObjects);
		const responseSyncServerUpdates = await this._repositorySync.update(correlationId, 'rockets', user.id, responseSync.results.clientObjects);
		if (this._hasFailed(responseSyncServerUpdates))
			return responseSyncServerUpdates;

		// return server objects to the client
		const response = this._initResponse(correlationId);
		response.results = { 
			clientObjectIds: (responseSyncServerUpdates.results ? responseSyncServerUpdates.results.map(l => l.id) : []),
			serverObjects: responseSync.results.serverObjects 
		};
		return response;
	}
}

export default SyncService;
