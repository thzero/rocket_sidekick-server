import Constants from '../../constants.js';

import BaseUserMongoRepository from '@thzero/library_server_repository_mongo/baseUser.js';

class UserMongoRepository extends BaseUserMongoRepository {
	_getDefaultPlan() {
		return Constants.Plans.BASIC;
	}

	_externalUserProjection(projection) {
		return projection;
	}
}

export default UserMongoRepository;
