import AppConstants from '../constants.js';

import AppService from './index.js';

class InventoryService extends AppService {
	constructor() {
		super();

		this._repositoryInventory = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryInventory = this._injector.getService(AppConstants.InjectorKeys.REPOSITORY_INVENTORY);
		
		this._serviceChecklists = this._injector.getService(AppConstants.InjectorKeys.SERVICE_CHECKLISTS);
	}

	async retrieve(correlationId, user, id) {
		this._enforceNotNull('InventoryService', 'retrieve', 'user', user, correlationId);

		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.rocketId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryInventory.retrieve(correlationId, user.id, id);
		}
		catch (err) {
			return this._error('InventoryService', 'retrieve', null, err, null, null, correlationId);
		}
	}

	async update(correlationId, user, inventoryUpdate) {
		try {
			const validationResponsUser = this._validateUser(correlationId, user);
			if (this._hasFailed(validationResponsUser))
				return validationResponsUser;
			
			const validationChecklistResponse = this._serviceValidation.check(correlationId, this._serviceValidation.inventory, inventoryUpdate);
			if (this._hasFailed(validationChecklistResponse))
				return validationChecklistResponse;
	
			const fetchRespositoryResponse = await this._repositoryInventory.retrieve(correlationId, user.id, inventoryUpdate.id);
			if (this._hasFailed(fetchRespositoryResponse))
				return fetchRespositoryResponse;

			// SECURITY: Check is the owner
			if (!this._isOwner(correlationId, user, fetchRespositoryResponse.results))
				return this._securityErrorResponse(correlationId, 'InventoryService', 'update');
	
			const inventory = fetchRespositoryResponse.results;
			if (!inventory) {
				const validResponse = this._checkUpdatedTimestamp(correlationId, inventoryUpdate, inventory, 'inventory');
				if (this._hasFailed(validResponse))
					return validResponse;
			}
			
			return await this._repositoryInventory.update(correlationId, user.id, inventoryUpdate);
		}
		catch (err) {
			return this._error('InventoryService', 'update', null, err, null, null, correlationId);
		}
	}
}

export default InventoryService;
