/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, exports, console, process */

(function () {
	'use strict';

	var util = require('util');
	var connection = require('mongodb').Connection;
	var Server = require('mongodb').Server;
	var Mongo = require('mongodb').MongoClient;
	var user = require('../core/user');
	var messaging = require('../core/messaging');
	var dbhelper = require('../core/dbhelper');

	var constants = require('../core/constants');
	var classes = {
		user: user,
		messaging: messaging
	};

	var me = "530d10bb5fc8044c08000002";
	var you = "530d13155fc8044c08000003";


	var database;

	function get_online() {
		var u = 'user';
		var n = 'getLatestOnline';

		classes[u][n](database, {
			d: ''
		}, function (result) {
			console.log('OK');
		});
	}

	function addNewUser(name, email) {

		var collection = database.collection('users');
		var user = {
			name: name,
			email: email,
			password: 1,
			lastLoginDate: 0.1
		};

		collection.insert(user, function (err, docs) {
			if (err) {
				throw err;
			}
			console.log('OK');
		});

	}

	function addFriend() {
		classes.user.addFriend(database, {
			Me: you,
			You: me
		}, function (answer) {
			console.log(answer);
			database.close();
		});
	}

	function getFriend() {
		classes.user.getFriends(database, {
			Me: you
		}, function (answer) {
			console.log(answer);
			database.close();
		});
	}


	function sendMessage() {
		classes.messaging.send(database, {
			Me: me,
			You: you,
			Message: 'yeni msg',
			ContentType: constants.messageTypes.text,
			Status: 1
		}, function (cb) {
			console.log(cb);
		}, []);
	}

	/**
	 * will reuse connection if already created
	 */
	function connect(callback) {
		if (database === undefined) {
			Mongo.connect(constants.variables.connection, function (err, db) {
				if (err) {
					throw err;
				}
				database = db;
				callback();
			});
		}
	}



	//connect(getFriend);
	//connect(addFriend);

	connect(sendMessage);

	var arr = [
		"Nilay Akhan",
		"Canan Aydın",
		"Ceren Özdemir",
		"Burak Yalınçkol",
		"Can Bozdemir",
		"Çağla Büyüktaş",
		"Lionel Messi",
		"Madonna"
	];

	var arr_mail = [
		"a@b.com",
		"c@d.com",
		"e@f.com",
		"Burak@Hatckinson.com",
		"Can@Nelson.com",
		"x@Jenkins.com",
		"Lionel@Ellis.com",
		"Madonna@Walker.com"

	];
	/*
	connect(get_online);
	connect(function () {
		var i = 0;
		for (i = 0; i < arr.length; i++) {
			addNewUser(arr[i], arr_mail[i]);
		}
	});
*/
}());
