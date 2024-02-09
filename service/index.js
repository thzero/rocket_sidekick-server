import Service from '@thzero/library_server/service/index.js';

class AppService extends Service {
	_isDefault(correlationId, user, item) {
		this._enforceNotNull('LocationsService', '_isDefault', 'user', user, correlationId);
		if (!item)
			return false;

		return item.isDefault === true;
	}

	_isOwner(correlationId, user, item) {
		this._enforceNotNull('LocationsService', '_isOwner', 'user', user, correlationId);
		if (!item)
			return true;

		return item.ownerId === user.id;
	}

	_isPublic(correlationId, user, item) {
		this._enforceNotNull('LocationsService', '_isPublic', 'user', user, correlationId);
		if (!item)
			return false;

		return item.public === true;
	}

	_securityErrorResponse(correlationId, clazz, method) {
		// TODO: SECURITY
		return this._error(clazz, method, null, null, null, null, correlationId);
	}
}

export default AppService;
