import BaseUsersAdminService from '@thzero/library_server/service/admin/users.js';

import UserData from 'rocket_sidekick_common/data/user.js';

class UsersAdminService extends BaseUsersAdminService {
	_initializeData() {
		return new UserData();
	}
}

export default UsersAdminService;
