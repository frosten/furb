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
/*global require, exports, console */


(function () {
	'use strict';
	var net = require('net');
	var http = require('http');
	var util = require('util');
	var fs = require('fs');
	var url = require('url');

	var user = require('./user');
	var constants = require("./constants");
	var messaging = require('./messaging');
	var fileupload = require('./fileupload');
	var notification = require('./notification');

	var database = null;


	Array.prototype.remove = function (e) {
		var i = 0;
		for (i; i < this.length; i++) {
			if (e === this[i]) {
				return this.splice(i, 1);
			}
		}
	};

	/*online clients*/
	var clients = [];

	function Client(stream) {
		this.id = null;
		this.stream = stream; //client.stream.write
	}
	/**
	 *
	 */
	var classes = {
		messaging: messaging,
		user: user
	};

	/**
	 *
	 * @param {Object} data - server responder
	 * @param {Function} callback
	 */
	function process(client, data, callback) {

		var response = data.toString();

		if (response === 'hello') {
			client.stream.write('send_a_salter');
			return;
		}

		response = JSON.parse(response.substring(0, response.lastIndexOf('}') + 1));

		//preparing execute function
		if (classes[response.ClassName] && classes[response.ClassName][response.Method]) {
			if (client.id === null && response.Method === 'setClientId') {
				client.id = response.Data.ClientID;
			}
			classes[response.ClassName][response.Method](database, response.Data, function (result) {
				callback(result);
			}, clients);

			setInterval(10000, function () {
				notification.pingClient(client);
			});
		} else {
			util.log('Process cannot execute ', response);
		}

	}

	/**
	 * Creating socket server for client communications.
	 * default socket port - 8331 tcp
	 */
	function createSocketServer() {
		util.log('Starting socket server...');

		net.createServer(function (c) { //'connection' listener
			util.log('New client connected');
			var client = new Client(c);
			clients.push(client);

			c.on('data', function (data) {
				util.log(data);
				try {
					process(client, data, function (response) {
						var responseStr = JSON.stringify(response);
						c.write(responseStr);
					});
				} catch (e) {
					util.log(e);
				}
			});

			c.on('end', function () {
				util.log('Client disconnected:' + client.id);
				clients.remove(client);
			});

			//c.pipe(c);
		}).listen(constants.variables.socketPort, constants.variables.serverIP);


	}

	/**
	 * Creating Http Server for static files.
	 * default - 8080 http server
	 */
	function createHttpServer() {
		util.log('Starting http server...');
		http.createServer(function (req, response) {

			var setHeader = function (status, ctype) {
				if (typeof ctype === constants.variables.undef) {
					ctype = 'text/plain';
				}

				response.writeHead(status, {
					'Content-Type': ctype
				});
			};

			try {
				var parsedUrl = url.parse(req.url, true);
				var queryData = parsedUrl.query;
				var _ids = queryData.id;

				//set default response 
				setHeader(200);

				if (queryData.mode && queryData.mode === 'upload') {
					fileupload.upload(req, response, _ids, function (cb) {
						cb();
					});

				} else if (parsedUrl.path.indexOf('/static/') > -1) {
					var img = fs.readFileSync(constants.variables.appPath + parsedUrl.path);
					setHeader(200, 'image/jpeg');
					response.end(img, 'binary');
				} else {
					response.end("furb.static.serv\n");
				}
			} catch (e) {
				setHeader(500);
				response.end('maybe overload?');
				util.inspect(e);
			}
		}).listen(constants.variables.httpPort);
	}

	/**
	 * Initialize
	 *
	 */
	function init(db) {
		database = db;
		createSocketServer();
		createHttpServer();
	}

	exports.init = init;
}());