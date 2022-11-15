import LibraryUtility from '@thzero/library_common/utility/index.js';

import BaseSecurityService from '@thzero/library_server/service/baseSecurity.js';

import securityUser from '../common/security/user.js';
import securityAdmin from '../common/security/admin.js';

class SecurityService extends BaseSecurityService {
	constructor() {
		super();

		this._enforcer = null;
	}

	_initModel() {
		return LibraryUtility.merge2(securityUser.options, securityAdmin.options);
	}
}

export default SecurityService;
