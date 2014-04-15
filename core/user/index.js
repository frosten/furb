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
/*global require, module, console */


(function () {
	'use strict';

	var mongo = require('mongodb');
	var constants = require('../constants');

	/**
	 * User actions
	 *
	 * @class user
	 */
	var user = {

		/**
		 * Add Friend
		 *
		 * @method addOrUpdateFriend
		 * @param {Object} data {Me, You, Status}
		 * @return {Object} {status: int, message: string}
		 */
		addFriend: function (db, data, callback) {
			var collection = db.collection('user_friends');
			var friendObject = {
				me: data.Me,
				you: data.You,
				status: constants.friendStatus.friend
			};

			var answer = {
				method: 'addFriend',
				status: constants.status.fail,
				message: ''
			};

			collection.findOne(friendObject, function (err, result) {
				if (err) {
					console.log('error db findOne');
					answer.message = err;
					callback(answer);
					throw err;
				}

				if (!result) {
					//inserting new contact data
					collection.insert(friendObject, function (err, docs) {
						if (err) {
							console.log('error db insert');
							callback(answer);
							throw err;
						}

						answer.status = constants.status.complete;
						callback(answer);
					});
				} //end if result

			});
		},


		/**
		 *
		 */
		getFriends: function (db, data, callback) {
			var friend_collection = db.collection('user_friends');
			var user_collection = db.collection('users');

			var answer = {
				method: 'getFriends',
				list: []
			};

			var doAnswer = function (items) {
				console.log(items);
				var i = 0;
				for (i; i < items.length; i++) {
					var item = items[i];
					var uobj = {
						name: item.name,
						lastLoginDate: item.lastLoginDate || 1393421241111,
						userId: item._id
					};
					console.log(uobj);
					answer.list.push(uobj);
				}
				callback(answer);
			};


			var fill = function (items) {

				var ids = [];
				items.forEach(function (item) {
					ids.push(mongo.BSONPure.ObjectID(item.you));
				});

				user_collection.find({
					_id: {
						$in: ids
					}
				}).toArray(function (err, items) {
					doAnswer(items);
				});
			};

			friend_collection.find({
				me: data.Me
			}).toArray(function (err, items) {
				console.log(items);
				fill(items);
			});

		},

		/**
		 * Set socket client id
		 *
		 * @method setClientId
		 * @param {Object} data {ClientID: string}
		 * @return {Object}  {status: int, message: string}
		 */
		setClientId: function (db, data, callback) {
			/*to response*/
			var response = {
				method: 'setClientId',
				status: 0
			};


			if (typeof data.ClientID !== 'undefined') {
				response.status = constants.status.complete;
				callback(response);
				return;
			}

			response.status = constants.status.fail;
			response.message = "ClientID not found";
			callback(response);
			console.log('client id not found');
		},

		/**
		 * Get latest global online
		 *
		 * @method getLatestOnline
		 * @param {Object} data {id: string}
		 * @return {Array}  [{id: string, name: string, lastseen: date}]
		 */
		getLatestOnline: function (db, data, callback) {
			if (typeof callback !== 'function') {
				throw 'getLatestOnline callback paramater is missing';
			}
			console.log(data.id);
			var onlineUserList = [];

			db.collection('users').find({
				_id: {
					$ne: mongo.BSONPure.ObjectID(data.id)
				}
			}, {
				sort: {
					lastLoginDate: -1
				},
				limit: 50
			}, function (err, cursor) {
				cursor.toArray(function (err, items) {
					items.forEach(function (entry) {
						onlineUserList.push({
							name: entry.name,
							lastLoginDate: entry.lastLoginDate || 1393421241111,
							id: entry._id
						}); //array push
					}); //end of each
					callback({
						method: 'getLatestOnline',
						list: onlineUserList
					});
				}); //cursor array
			}); //end of find callback function
		},

		/**
		 * User sign in
		 *
		 * @method signIn
		 * @param {Object} data {Name: null, Email: string, Password: string}
		 * @return {Object} {status: <b>Int</b>, message: <b>String</b>}
		 */
		signIn: function (db, data, callback) {
			/*to response*/
			var signInObject = {
				method: 'signIn',
				status: 0,
				userId: 0,
				message: '',
				name: ''
			};

			var collection = db.collection('users');

			collection.findOne({
				email: data.Email,
				password: data.Password
			}, function (err, result) {
				if (err) {
					throw err;
				}

				if (!result) {
					signInObject.status = constants.status.fail;
					signInObject.message = 'Incorrect username or password';
				} else {
					signInObject.status = constants.status.complete;
					signInObject.userId = result._id;
					signInObject.name = result.name;

					collection.update({
						email: data.email
					}, result, function (err, u) {
						if (err) {
							throw err;
						}
					}); //end of update
				} //end of if

				if (typeof callback === constants.variables.func) {
					callback(signInObject);
				}
			}); //end of collection find callback function

		},


		/**
		 * User sign Up
		 * Kullanıcı kaydı için bu method kullanılır, <br />
		 * Method sonucu kullanıcının id bilgisi döner (<b>_id</b>) <br />
		 * Bu aşamadan sonraki bütün methodlarda kullanılması gerektiği için bilgi client tarafında cachelenmelidir.
		 *
		 * @method signUp
		 * @param {Object} data  {Name: string, Email: string, Password: string}
		 * @return {Object}  {status: <b>Int</b>, message: <b>String</b>, _id: <b>String</b>}
		 */
		signUp: function (db, data, callback) {
			var answer = {
				method: 'signUp'
			};

			if (!data.Name && !data.Email) {
				throw 'User signup need data parameters';
			}

			var user = {
				name: data.Name,
				email: data.Email,
				password: data.Password
			};

			var collection = db.collection('users');
			collection.findOne({
				email: user.email
			}, function (err, result) {
				if (err) {
					throw err;
				}

				if (!result) {
					answer.status = constants.status.complete;
					collection.insert(user, function (err, docs) {
						if (err) {
							throw err;
						}
						answer.message = 'OK';
						answer._id = docs[0]._id;
						callback(answer);
					});
				} else {
					answer.status = constants.status.existing_user;
					answer.message = 'Existing user.';
					callback(answer);
				}
			}); //end of collection findone

		}
	};
	module.exports = user;
}());