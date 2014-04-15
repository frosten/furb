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
/*global require, module, console, ObjectId, process */

(function () {
	'use strict';
	/**
	 * Notification center
	 *
	 * @class notification
	 */
	var notification = {
		/**
		 *
		 */
		find: function (db, me, lastMessageTime) {
			var collection = db.collection('users_messages');
			var query = {
				to: me,
				messageDate: {
					$gt: lastMessageTime
				}
			};
			collection.find(query).toArray(function (err, func) {});
		},

		/**
		 *
		 */
		pingClient: function (client) {
			console.log('pinging' + client.id);
			client.stream.write('Pinging: ' + Date.now());
		},

		/**
		 *
		 */
		pongClient: function (client) {
			console.log('ponging...');
			client.stream.write('PONGING OK');
		},
		/**
		 *
		 */
		pingClients: function (clients, client) {
			var findAndNotify = function (k, callback) {
				var self = this;
				return (function check(i) {
					if (i >= self.length) {
						return callback(null);
					}

					if (self[i].id === k.id) {
						return callback(self[i]);
					}

					return process.nextTick(check.bind(null, i + 1));
				}(0));
			};

			findAndNotify(client, function (ct) {
				if (ct !== null) {
					ct.stream.write('Hello');
				}
			});

		}
	};


	module.exports = notification;

}());