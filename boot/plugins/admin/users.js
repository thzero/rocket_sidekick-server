import UsersAdminBootPlugin from '@thzero/library_server_fastify/boot/plugins/admin/users.js';

import adminUsersRepository from '../../../repository/mongo/admin/users.js';

import adminUsersService from '../../../service/admin/users.js';

class AppUsersAdminBootPlugin extends UsersAdminBootPlugin {
	_initRepositoriesAdminUsers() {
		return new adminUsersRepository();
	}

	_initServicesAdminUsers() {
		return new adminUsersService();
	}
}

export default AppUsersAdminBootPlugin;
