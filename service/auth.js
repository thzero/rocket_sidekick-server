import AppSharedConstants from 'rocket_sidekick_common/constants.js';

import FirebaseAuthAdminService from '@thzero/library_server_firebase/auth/index.js';

class AuthService extends FirebaseAuthAdminService {
	_defaultClaims() {
		return AppSharedConstants.Roles.User;
	}
}

export default AuthService;
