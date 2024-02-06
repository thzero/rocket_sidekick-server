import AppConstants from '../../constants.js';

import BaseUserMongoRepository from '@thzero/library_server_repository_mongo/baseUser.js';

class UserMongoRepository extends BaseUserMongoRepository {
	_getDefaultPlan() {
		return AppConstants.Plans.BASIC;
	}

	_externalUserProjection(projection) {
		return projection;
	}
}

export default UserMongoRepository;
