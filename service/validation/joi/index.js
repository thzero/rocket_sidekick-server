import Joi from 'joi';
import JoiDate from '@joi/date';
Joi.extend(JoiDate);

// import SharedConstants from '../../../common/constants.js';

import GamerJoiValidationService from '@thzero/library_server_validation_joi/gamer.js';

class JoiValidationService extends GamerJoiValidationService {
	_any = Joi.any().allow(null);
	
	syncFrom = Joi.object({
		collections: Joi.array().items(Joi.string()),
		lastSyncTimestamp: Joi.number().allow(null),
		objects: Joi.array().items(this._any)
	});

	syncTo = Joi.object({
		lastSyncTimestamp: Joi.number().allow(null)
	});
}

export default JoiValidationService;
