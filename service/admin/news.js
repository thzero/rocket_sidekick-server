import BaseNewsAdminService from '@thzero/library_server/service/admin/news.js';

import NewsData from '../../common/data/news.js';

class NewsAdminService extends BaseNewsAdminService {
	_initializeData() {
		return new NewsData();
	}
}

export default NewsAdminService;
