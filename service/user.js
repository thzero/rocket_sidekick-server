import AppConstants from '../constants.js';
import AppSharedConstants from 'rocket_sidekick_common/constants.js';
import LibraryServerConstants from '@thzero/library_server/constants.js';

import AppUtility from '../utility/app.js';
import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

import BaseUserService from '@thzero/library_server/service/baseUser.js';

import UserData from 'rocket_sidekick_common/data/user.js';

class UserService extends BaseUserService {
	constructor() {
		super();

		this._repositoryUsersI = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryUsersI = this._injector.getService(LibraryServerConstants.InjectorKeys.REPOSITORY_USERS);
	}

	_getDefaultPlan() {
		return AppConstants.Plans.BASIC;
	}

	_getDefaultUserRole() {
		return AppSharedConstants.Roles.User;
	}

	_initiateUser() {
		return new UserData();
	}

	// async _updateSettings(correlationId, requestedSettings) {
	// 	if (requestedSettings.settings.gamerTag) {
	// 		const gamerTag = requestedSettings.settings.gamerTag.trim();
	// 		requestedSettings.settings.gamerTag = gamerTag;
	// 		requestedSettings.settings.gamerTagSearch = AppUtility.generateGamerTagSearch(gamerTag);
	// 	}
	// 	else {
	// 		requestedSettings.settings.gamerTag = null;
	// 		requestedSettings.settings.gamerTagSearch = null;
	// 	}

	// 	return this._success(correlationId);
	// }
	async _updateSettingsGamerTag(correlationId, requestedSettings) {
		return this._success(correlationId);
	}

	async _updateSettingsValidation(correlationId, requestedSettings) {
		return this._success(correlationId);
	}

	get _repositoryUser() {
		return this._repositoryUsersI;
	}
}

export default UserService;
