// Copyright S. Ferit Arslan and other Contributors
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, module, console, ObjectId,timeago */


(function () {
	'use strict';

	var ITEM_SIZE = 20;

	var mongo = require('mongodb');
	var timeago = require('timeago');
	var dbhelper = require('../dbhelper');
	var constants = require('../constants');

	var collectionName = 'users_messages';


	/**
	 * messaging
	 *
	 * @class messaging
	 */
	var messaging = {
		/**
		 * Send message
		 *
		 * <b>ContentType</b>: 1->message, 2-> link <br />
		 * <b>Status</b> 1->sended, 2-> received (default: 1)
		 * @method send
		 * @param {Object} data (Me, You, Message, ContentType, Status)
		 */
		send: function (db, data, callback, clients) {
			var me = data.Me;
			var you = data.You;

			var answer = {};
			var executeCallback = function (status) {
				answer.status = status;
				callback(answer);
			};

			//TODO: Check message if sendable
			var messageModel = {
				from: me,
				to: you,
				message: data.Message,
				contentType: data.ConentType,
				status: data.Status,
				messageDate: Date.now()
			};


			var collection = db.collection(collectionName);

			collection.insert(messageModel, function (err, docs) {
				if (err) {
					executeCallback(constants.status.fail);
					throw err;
				}
				var i = 0;
				for (i; i < clients.length; i++) {
					if (clients[i].id === you) {
						clients[i].stream.write('sana yeni bir mesaj var'); //todo: retrieve object
					}
				}

				dbhelper.updateLastSeenDate(db, me);
				executeCallback(constants.status.complete);
			});
		},

		/**
		 * Mark as read a message
		 *
		 * @method markAsRead
		 * @param {Object} data { MessageID: '' }
		 */
		markAsRead: function (db, data, callback) {
			var messageID = data.MessageID;

			var args = {
				query: {
					_id: mongo.BSONPure.ObjectID(messageID)
				},
				update: {
					$set: {
						status: constants.status.message_readed
					}
				}
			};

			//updates finded data
			db.collection(collectionName).update(args.query, args.update, {
				upsert: false,
				multi: true
			}, function (err, doc) {
				if (err) {
					throw err;
				}
			});
		},

		/**
		 *
		 * @param {Object} data (Me)
		 * @param {Function} callback
		 */
		dataServedComplete: function (db, data, callback) {
			var me = data.Me;

			//preparing query
			var args = {
				query: {
					to: me,
					status: constants.status.message_accepted
				},
				update: {
					$set: {
						status: constants.status.message_served
					}
				}
			};

			db.collection(collectionName).update(args.query, args.update, {
				upsert: false,
				multi: true
			}, function (err, doc) {
				if (err) {

					throw err;
				}
			});
		},

		/**
		 * Getting data
		 *
		 * @method getNewData
		 * @param {Object} data
		 * @deprecated Use 'retrieve'
		 */
		getNewData: function (db, data, callback) {
			var me = data.Me;
			var date = data.Date;

			//preparing query
			var args = {
				query: {
					to: me,
					status: constants.status.message_accepted
					/* messagedate: { $lte: date  }*/
				},
				update: {
					$set: {
						status: constants.status.message_served
					}
				}
			};

			var collection = db.collection(collectionName);

			//finding data
			collection.find(args.query, function (err, cursor) {
				cursor.toArray(function (err, items) {
					callback(items);
				});
			});
		},


		/**
		 * Retrieve message<br />
		 * mode will be after or before
		 *
		 * @method retrieve
		 * @param {Object} data {Me, You, Time, Mode}
		 */
		retrieve: function (db, data, callback) {
			var me = data.Me;
			var you = data.You;
			var time = data.Time;
			var mode = data.Mode || "after";

			/**
			 * set query parameters
			 */
			var sorting = {
				sort: {
					messageDate: -1
				}
			};

			/**
			 * Creating client data model
			 */
			var messages = [];
			var model = {
				me: {},
				you: {},
				converstation: messages
			};

			var collection = db.collection(collectionName);
			var users = db.collection('users');

			/**
			 * finding me info
			 */
			users.findOne({
				_id: mongo.BSONPure.ObjectID(me)
			}, function (err, result) {

				if (err) {
					throw err;
				}

				if (result) {
					var _me = {
						name: result.name,
						email: result.email
					};
					model.me = _me;

					var messageDateQry = {};
					/**
					 * add timing criteria for data paging.
					 */
					if (typeof (time) !== 'undefined' || time === 0) {
						if (mode === "before") {
							messageDateQry = {
								$lt: time
							};
						} else {
							messageDateQry = {
								$gt: time
							};
						}
					}

					var query = {
						$or: [{
							from: me,
							to: you
						}, {
							from: you,
							to: me
						}],
						messageDate: messageDateQry
					};


					var processItem = function (err, items) {
						items.forEach(function (entry) {
							messages.push({
								ownerId: entry.from,
								itsMe: entry.from === me,
								status: entry.status,
								message: entry.message,
								date: entry.messageDate,
								dateStr: timeago(new Date(entry.messageDate)),
								id: entry._id
							}); //array push
						}); //each
						model.converstation = messages;
						callback(model);
					};

					/**
					 * finding you info
					 */
					users.findOne({
						_id: mongo.BSONPure.ObjectID(you)
					}, function (err, result) {
						console.log('getting...');
						if (err) {
							throw err;
						}

						if (result) {
							var _you = {
								name: result.name,
								email: result.email
							};
							model.you = _you;


							//finding messages
							collection.find(query, sorting)
								.limit(ITEM_SIZE)
								.toArray(processItem); //toArray
						}
					});
				} //end of main if result
			}); //end of findone
		}
	};

	module.exports = messaging;
}());