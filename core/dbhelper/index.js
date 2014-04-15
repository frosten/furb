// Copyright (c) 2014 S. Ferit Arslan
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
/*global module, require*/

(function () {
	'use strict';

	var util = require('util');
	var mongo = require('mongodb');

	var constants = require('../constants');

	var dbhelper = {
		updateLastSeenDate: function (db, me) {
			var bsonID = mongo.BSONPure.ObjectID(me);
			var collection = db.collection('users');
			collection.findOne({
				_id: bsonID
			}, function (err, result) {
				if (result) {
					result.lastLoginDate = Date.now();
					collection.update({
						_id: bsonID
					}, result, function (err, u) {
						if (err) {
							db.close();
							throw err;
						}
						util.log('Update complete: updateLastSeenDate');
					}); //end of update
				} //end of result if
			}); //end off findone callback
		}
	};

	module.exports = dbhelper;
}());