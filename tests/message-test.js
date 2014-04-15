/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, module, console, ObjectId, relativeDate*/

(function () {
	'use strict';

	var util = require('util');
	var timeago = require('timeago');
	var message = require('../core/messaging');
	var constants = require('../core/constants');

	var MongoClient = require('mongodb').MongoClient;
	var database;

	function getMessageTest() {
		var collection = database.collection('users');
		collection.find().limit(5).toArray(function (err, items) {
			console.log(items);
		});
	}

	
	var me = "530d10bb5fc8044c08000002"; //ferit
	var you = "530d13155fc8044c08000003"; //ilyas
	
	/**
	 * will reuse connection if already created
	 */
	function connect(callback) {
		if (database === undefined) {
			MongoClient.connect(constants.variables.connection, function (err, db) {
				if (err) {
					throw err;
				}
				database = db;
				callback(database);
			});
		}
	}

	/*{ "from" : "530d13155fc8044c08000003", "to" : "530d10bb5fc8044c08000002", "messa
ge" : "gorusuruz ipne", "contentType" : null, "status" : 1, "messageDate" : 1393956702232, "_id" : ObjectId("5316175e863ac4e00f000012") }*/

	function getMyMessage() {
		console.log('retriving...');
		connect(function (db) {
			var data = {
				You: you,
				Me: me,
				Time: 1,
				Mode: 'after'
			};
			/*
				var me = data.Me;
			var you = data.You;
			var time = data.Time;
			var mode = data.Mode;
			*/
			message.retrieve(db, data, function (result) {
				console.log(result.converstation.length);
			});
		});
	}

	//getMyMessage();
	/**
	 *  * @param {Object} data (Message, ContentType, Status)
	 */
	function sendMessage() {
		var data = {
			Me: me,
			You: you,
			Message: 'yeni msg',
			ContentType: constants.messageTypes.text,
			Status: 1
		};
		connect(function (db) {
			var database = db;
			message.send(db, data, function (result) {
				console.log(result);
				getMyMessage();
			});
		});
	}
	
	sendMessage();

	function checkData() {
		message.checkAndGetNewData({
			me: '530cdd815bc2c5700a000001',
			date: 139394168500
		}, function (result) {
			console.log('OK');
		});
	}



}());