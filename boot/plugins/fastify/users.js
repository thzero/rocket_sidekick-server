import UsersApiBootPlugin from '@thzero/library_server_fastify/boot/plugins/usersExtended.js';

import plansRepository from '@thzero/library_server_repository_mongo/plans.js';
import userRepository from '../../../repository/mongo/user.js';

import usersRoute from '../../../routes/fastify/users.js';

import authService from '../../../service/auth.js';
import securityService from '../../../service/security.js';
import userService from '../../../service/user.js';

class AppUsersApiBootPlugin extends UsersApiBootPlugin {
	_initRepositoriesPlans() {
		return new plansRepository();
	}

	_initRepositoriesUsers() {
		return new userRepository();
	}

	_initRoutesUsers() {
		return new usersRoute();
	}

	_initServicesAuth() {
		return new authService();
	}

	_initServicesSecurity() {
		return new securityService();
	}

	_initServicesUser() {
		return new userService();
	}
}

export default AppUsersApiBootPlugin;
