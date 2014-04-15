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

/*global exports*/
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */

var variables = {
	func: 'function',
	undef: 'undefined',
	connection: 'mongodb://username:password@serverip:port/furb',
	socketPort: 8331,
	httpPort: 8080,
	dbPort: 8365,
	serverIP: '37.148.209.194',
	appPath: 'C:\\MongoChat\\' /* application startup path */
};

var status = {
	complete: 200,
	fail: 500,
	dberror: 501,
	existing_user: 301,
	message_accepted: 1,
	message_served: 2,
	message_readed: 3
};

var friendStatus = {
	friend: 1,
	ignored: 2,
	deleted: 3
};

var messageTypes = {
	text: 1,
	image: 2,
	video: 3,
	file: 4
};


exports.messageTypes = messageTypes;
exports.variables = variables;
exports.status = status;
exports.friendStatus = friendStatus;