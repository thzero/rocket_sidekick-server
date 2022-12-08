import Joi from 'joi';
import JoiDate from '@joi/date';
Joi.extend(JoiDate);

// import SharedConstants from '../../../common/constants.js';

import GamerJoiValidationService from '@thzero/library_server_validation_joi/gamer.js';

class JoiValidationService extends GamerJoiValidationService {
	_any = Joi.any().allow(null);
	
	syncFrom = Joi.object({
		checklists: Joi.array().items(this._any).allow(null),
		preparations: Joi.array().items(this._any).allow(null),
		rockets: Joi.array().items(this._any).allow(null),
		lastSyncTimestamp: Joi.number().allow(null)
	});

	syncTo = Joi.object({
		lastSyncTimestamp: Joi.number().allow(null)
	});
}

export default JoiValidationService;
