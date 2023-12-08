import AppSharedConstants from 'rocket_sidekick_common/constants.js';

import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

import AppMongoRepository from './app.js';

class MotorsRepository extends AppMongoRepository {
	constructor() {
		super();
		
		this._ownerId = null;
	}

	async init(injector) {
		await super.init(injector);

		this._ownerId = this._config.get('ownerId');
	}

	async listing(correlationId, params) {
		try {
			const defaultFilter = { 
				$and: [
					{ 
						$or: [
							{ 'ownerId': this._ownerId },
							{ 'public': true }
						]
					},
					{ $expr: { $ne: [ 'deleted', true ] } },
					{ 'typeId': AppSharedConstants.Rocketry.PartTypes.motor }
				]
			};
	
			const queryF = defaultFilter;
			const queryA = [ {
					$match: defaultFilter
				}
			];
			queryA.push({
				$project: { 
					'_id': 0,
					// 'id': 1,
					// 'tcId': 1,
					// 'external': 1,
					// 'name': 1,
					// 'ownerId': 1,
					// 'public': 1,
					// 'typeId': 1
				}
			});
	
			const collection = await this._getCollectionParts(correlationId);
			// const results = await this._aggregateExtract(correlationId, await this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
			const results = await this._aggregateExtract2(correlationId, collection, queryA, queryA, this._initResponseExtract(correlationId));
			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('MotorsRepository', 'listing', null, err, null, null, correlationId);
		}
	}

	async listingCases(correlationId, params) {
		try {
			const defaultFilter = { 
				$and: [
					{ 
						$or: [
							{ 'ownerId': this._ownerId },
							{ 'public': true }
						]
					},
					{ $expr: { $ne: [ 'deleted', true ] } },
					{ 'typeId': AppSharedConstants.Rocketry.PartTypes.motorCase }
				]
			};
	
			const queryF = defaultFilter;
			const queryA = [ {
					$match: defaultFilter
				}
			];
			queryA.push({
				$project: { 
					'_id': 0,
					// 'id': 1,
					// 'external': 1,
					// 'name': 1,
					// 'ownerId': 1,
					// 'public': 1,
					// 'typeId': 1
				}
			});
	
			const collection = await this._getCollectionParts(correlationId);
			// const results = await this._aggregateExtract(correlationId, await this._count(correlationId, collection, queryF), await this._aggregate(correlationId, collection, queryA), this._initResponseExtract(correlationId));
			const results = await this._aggregateExtract2(correlationId, collection, queryA, queryA, this._initResponseExtract(correlationId));
			return this._successResponse(results, correlationId);
		}
		catch (err) {
			return this._error('MotorsRepository', 'listingCases', null, err, null, null, correlationId);
		}
	}

	async retrieve(correlationId, userId, id) {
		try {
			const queryA = [ { 
					$match: {
						$and: [
							{ 'id': id.toLowerCase() },
							{ 
								$or: [
									{ 'ownerId': this._ownerId },
									{ 'public': true }
								]
							},
							{ $expr: { $ne: [ 'deleted', true ] } }
						]
					}
				}
			];
			queryA.push({
				$project: { 
					'_id': 0
				}
			});
	
			const collection = await this._getCollectioParts(correlationId);
			let results = await this._aggregate(correlationId, collection, queryA);
			results = await results.toArray();
			if (results.length > 0)
				return this._successResponse(results[0], correlationId);
			
			return this._success(correlationId);
		}
		catch (err) {
			return this._error('MotorsRepository', 'retrieve', null, err, null, null, correlationId);
		}
	}

	async sync(correlationId, motors, deleted) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionParts(correlationId);
			const response = this._initResponse(correlationId);

			for (const motor of deleted) {
				motor.deleted = true;
				motor.deletedUserId = this._ownerId;
				motor.deletedTimestamp = LibraryCommonUtility.getTimestamp();
				motor.searchName = this._createEdgeNGrams(correlationId, motor.commonName);
				const response = await this._update(correlationId, collection, this._ownerId, motor.id, motor);
				if (this._hasFailed(response))
					return await this._transactionAbort(correlationId, session, 'Unable to delete the motor.');
			}

			for (const motor of motors) {
				motor.ownerId = this._ownerId;
				const response = await this._update(correlationId, collection, this._ownerId, motor.id, motor);
				if (this._hasFailed(response))
					return await this._transactionAbort(correlationId, session, 'Unable to update the motor.');
			}

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'MotorsRepository', 'sync');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}

	async syncCases(correlationId, motorCases, deleted) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionParts(correlationId);
			const response = this._initResponse(correlationId);

			for (const motorCase of deleted) {
				motorCase.deleted = true;
				motorCase.deletedUserId = this._ownerId;
				motorCase.deletedTimestamp = LibraryCommonUtility.getTimestamp();
				const response = await this._update(correlationId, collection, this._ownerId, motorCase.id, motorCase);
				if (this._hasFailed(response))
					return await this._transactionAbort(correlationId, session, 'Unable to delete the motor case.');
			}

			for (const motorCase of motorCases) {
				motorCase.ownerId = this._ownerId;
				motorCase.searchName = this._createEdgeNGrams(correlationId, motorCase.name);
				const response = await this._update(correlationId, collection, this._ownerId, motorCase.id, motorCase);
				if (this._hasFailed(response))
					return await this._transactionAbort(correlationId, session, 'Unable to update the motor case.');
			}

			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'MotorsRepository', 'syncCases');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}

	async syncCasesToMotors(correlationId, motorCases, motors) {
		const session = await this._transactionInit(correlationId, await this._getClient(correlationId));
		try {
			await this._transactionStart(correlationId, session);

			const collection = await this._getCollectionParts(correlationId);
			const response = this._initResponse(correlationId);
			let response2;

			let temp;
			for (const motorCase of motorCases) {
				temp = motors.filter(l => l.caseInfo === motorCase.name);
				if (!temp)
					continue;

				for (const motor of temp) {
					motor.motorCaseId = motorCase.id;	
					response2 = await this._update(correlationId, collection, this._ownerId, motor.id, motor);
					if (this._hasFailed(response2))
						return await this._transactionAbort(correlationId, session, 'Unable to delete the motor case.');
				}
			}
			await this._transactionCommit(correlationId, session);
			return response;
		}
		catch (err) {
			return await this._transactionAbort(correlationId, session, null, err, 'MotorsRepository', 'syncCasesToMotors');
		}
		finally {
			await this._transactionEnd(correlationId, session);
		}
	}
}

export default MotorsRepository;
