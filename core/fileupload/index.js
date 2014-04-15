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
/*global require, exports, console, util, Buffer*/

var formidable = require('formidable');
var http = require('http');
var fs = require('fs');
var util = require('util');
var im = require('imagemagick');

var constants = require('../constants');
var database = require('mongodb');

/**
 *
 * @param {Object} req
 * @param {Object} res
 * @param {String} _ids
 * @param {Function} callback
 */
function upload(req, res, _ids, callback) {
	'use strict';
	util.log('fileupload database connect');
	database.connect(constants.variables.connection, function (err, db) {
		util.log('fileupload db connect succesfuly... uploading...');
		var form = new formidable.IncomingForm();
		form.parse(req, function (err, fields, files) {
			util.log('fileupload form parsing..');
			res.writeHead(200, {
				'content-type': 'text/plain'
			});

			var fileName = '../static/' + _ids + '.jpg';
			var thumbFileName = '../static/thumb/' + _ids + '.jpg';
			fs.writeFile(fileName, new Buffer(fields.image, "base64"), 'utf8', function (err) {
				if (err) {
					throw err;
				}
				util.log('fileupload file saved!');
				/// write file to uploads/thumbs folder
				im.resize({
					srcPath: fileName,
					dstPath: thumbFileName,
					width: 200
				}, function (err, stdout, stderr) {
					if (err) {
						throw err;
					}
					util.log('fileupload resized image to fit within 200x200px');
				});
				res.write("OK");
			});
			callback(function () {
				res.end("OK");
			});
		}); //end of parse 

		/*
		//progress for bytes calcuation 
        form.on('progress', function (bytesReceived, bytesExpected) {
            total = (100 * (bytesReceived / bytesExpected));
            console.log('Progress so far: ' + total + "%"); 
        }); //end of form on progress
       */
	}); //end database connection
}

exports.upload = upload;