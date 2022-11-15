import Joi from 'joi';

import BaseNewsJoiBaseValidationService from '@thzero/library_server_validation_joi/news/index.js';

class NewsJoiBaseValidationService extends BaseNewsJoiBaseValidationService {
	getNewsSchema() {
		const validation = super.getNewsSchema();
		return validation.concat(Joi.object({
		}));
	}

	getNewsUpdateSchema() {
		const validation = super.getNewsUpdateSchema();
		return validation.concat(Joi.object({
		}));
	}
}

export default NewsJoiBaseValidationService;
