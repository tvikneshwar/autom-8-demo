/*
The MIT License (MIT)

Copyright (c) 2015 Lighthouse Automation

https://github.com/Lighthouse-Automation/node-red-contrib-jade

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/* This module provides a user model using levelDB as a data store */

var levelup = require('levelUp'),
	path = require('path'),
	bcrypt = require('bcrypt')

/* Constructor */
var function Users(db) {
	//Try and gloss over we don't seem to be called with 'new'
	if(!(this instanceof Users)) {
		return new Users(db);
	};

	//Default path to level db data
	var dbPath = path.join(__dirname, "../data/users-ldb");

	//If a string is passed, use it as the path
	if (typeof db === 'string') {
    	dbPath = db;
  	}

  	//If a null object is passed, or the db type is a string, create a new
  	//database, don't add error callback, let it throw.
  	if (!db || typeof db === 'string') {
    	db = levelup(dbPath, {
      		keyEncoding: 'utf8',
      		valueEncoding: 'json'
    	})
	}

	//Save the database instance, either created here or passed in
	this._db = db;
};

//Local var to hold prototype, for convinence
var p = User.prototype;

/* Methods */
p.findOne = function (keyStr, cb) {
	this._db.get(keyStr, cb);
};

p.addOne = function (keyStr, pass, data, cb) {
	//We only store a hashed version of the password in the database
	bcrypt.hash(pass, 10, function(err, pw) {
		if (err) {
			return cb(err, false);
		}
		var usr = {
			pass: pw,
			data: data
		};
		this._db.put(keyStr, usr, cb);
	});
};

p.delOne = function (keyStr, cb) {
	this._db.del(keyStr, cb);
};

p.checkPass = function (userKey, pass, cb) {
	this.findOne(userKey, function(err, user) {
		if (err || !user) {
			return cb("Couldn't find user", null);
		}
		bcrypt.compare(pass, user.pass, function(err, res) {
			if (err) {
				return cb("Wrong pass", null);
			}
			return cb(null, user);
		});
	});
};

p.countThem = function (cb) {
	var count = 0;

	this._db.createKeyStream()
		.on('data', function(data) { count++ })
		.on('error', function(err) { cb(err, count)})
		.on('end', function() { cb(null, count)});
};

//Export the constructor
module.exports = Users;
