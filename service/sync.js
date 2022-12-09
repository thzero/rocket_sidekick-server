import Constants from '../constants.js';
import LibraryConstants from '@thzero/library_server/constants.js';

import Service from '@thzero/library_server/service/index.js';
import Utility from '@thzero/library_common/utility/index.js';

class SyncService extends Service {
	constructor() {
		super();

		this._repositorySync = null;
		this._serviceUsers = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositorySync = this._injector.getService(Constants.InjectorKeys.REPOSITORY_SYNC);

		this._serviceUsers = this._injector.getService(LibraryConstants.InjectorKeys.SERVICE_USERS);
	}

	async syncFrom(correlationId, user, params) {
		const validationSyncResponse = this._serviceValidation.check(correlationId, this._serviceValidation.syncFrom, params);
		if (this._hasFailed(validationSyncResponse))
			return validationSyncResponse;

		// const responseSyncChecklists = await this._syncChecklists(correlationId, user, params.rockets, params.lastSyncTimestamp);
		// if (this._hasFailed(responseSyncChecklists))
		// 	return responseSyncChecklists;

		const responseSyncRockets = await this._syncRockets(correlationId, user, params.rockets, params.lastSyncTimestamp);
		if (this._hasFailed(responseSyncRockets))
			return responseSyncRockets;

		const response = this._initResponse(correlationId);
		response.results = {
			// checklists: responseSyncChecklists.results,
			rockets: responseSyncRockets.results
		}
		response.results.lastSyncTimestamp = Utility.getTimestamp();
		return response;
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

	// async _syncChecklists(correlationId, user, clientObjects, lastSyncTimestamp) {
	// 	const responseSyncServer = await this._repositorySync.syncChecklists(correlationId, user.id, lastSyncTimestamp);
	// 	if (this._hasFailed(responseSyncServer))
	// 		return responseSyncServer;

	// 	const responseSync = this._sync(correlationId, [ ...clientObjects ], [ ...responseSyncServer.results.data]);
	// 	if (this._hasFailed(responseSync))
	// 		return responseSync;

	// 	// update the client objects onto the server
	// 	const responseSyncServerUpdates = await this._repositorySync.updateChecklists(correlationId, user.id, responseSync.results.clientObjects);
	// 	if (this._hasFailed(responseSyncServerUpdates))
	// 		return responseSyncServerUpdates;

	// 	// return server objects to the client
	// 	const response = this._initResponse(correlationId);
	// 	response.results.updates = responseSync.results.serverObjects;
	// 	return response;
	// }

	// 	const responseSync = this._sync(correlationId, [ ...clientObjects ], [ ...responseSyncServer.results.data]);
	// 	if (this._hasFailed(responseSync))
	// 		return responseSync;

	// 	// return server objects to the client
	// 	const response = this._initResponse(correlationId);
	// 	response.results.updates = responseSync.results.serverObjects;
	// 	return response;
	// }

	async _syncChecklists(correlationId, user, clientObjects, lastSyncTimestamp) {
		const responseSyncServer = await this._repositorySync.syncChecklists(correlationId, user.id, lastSyncTimestamp);
		if (this._hasFailed(responseSyncServer))
			return responseSyncServer;

		const responseSync = await this._sync(correlationId, [ ...clientObjects ], [ ...responseSyncServer.results.data]);
		if (this._hasFailed(responseSync))
			return responseSync;

		// update the client objects onto the server
		const responseSyncServerUpdates = await this._repositorySync.updateChecklists(correlationId, user.id, responseSync.results.clientObjects);
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
		const responseSyncServer = await this._repositorySync.syncRockets(correlationId, user.id, lastSyncTimestamp);
		if (this._hasFailed(responseSyncServer))
			return responseSyncServer;

		const responseSync = await this._sync(correlationId, [ ...clientObjects ], [ ...responseSyncServer.results.data]);
		if (this._hasFailed(responseSync))
			return responseSync;

		// update the client objects onto the server
		const responseSyncServerUpdates = await this._repositorySync.updateRockets(correlationId, user.id, responseSync.results.clientObjects);
		if (this._hasFailed(responseSyncServerUpdates))
			return responseSyncServerUpdates;

		// return server objects to the client
		const response = this._initResponse(correlationId);
		response.results = { 
			clientObjectIds: responseSyncServerUpdates.results.map(l => l.id),
			serverObjects: responseSync.results.serverObjects 
		};
		return response;
	}
}

export default SyncService;
