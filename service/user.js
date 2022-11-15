import Constants from '../constants.js';
import LibraryConstants from '@thzero/library_server/constants.js';
import SharedConstants from '../common/constants.js';

// import AppUtility from '../utility/app.js'

import BaseUserService from '@thzero/library_server/service/baseUser.js';

import UserData from '../common/data/user.js';

class UserService extends BaseUserService {
	constructor() {
		super();

		this._repositoryUsersI = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryUsersI = this._injector.getService(LibraryConstants.InjectorKeys.REPOSITORY_USERS);
	}

	_getDefaultPlan() {
		return Constants.Plans.BASIC;
	}

	_getDefaultUserRole() {
		return SharedConstants.Roles.User;
	}

	_initiateUser() {
		return new UserData();
	}

	async _updateSettings(correlationId, requestedSettings) {
	}

	async _updateSettingsValidation(correlationId, requestedSettings) {
		return this._success(correlationId);
	}

	get _repositoryUser() {
		return this._repositoryUsersI;
	}
}

export default UserService;
