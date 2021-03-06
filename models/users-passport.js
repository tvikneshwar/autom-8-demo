/*
The MIT License (MIT)

Copyright (c) 2015 Lighthouse Automation

https://github.com/Lighthouse-Automation/autom-8-demo

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

/*jslint node: true */
"use strict";

/* Initiialise and setup passport for user auth */

var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	users = require('./users-level')();

var ppOpts = {
	usernameField: 'username',
	passwordField: 'password',
	passReqToCallback: true
};

passport.use('local-add-user', new LocalStrategy(ppOpts,
	function (req, username, password, done) {
		users.findOne(username, function (err, user) {
			if (err) { //Somehow the lookup failed
				return done(err);
      }
			if (user) { //There is already a user with that name
				return done(null, false, 'User : ' + username + ' already exists.');
			}
			users.addOne(username, password, {}, function (err) {
				if (err) { //Couldn't save user
					return done(err);
        }
				//We have saved a new user to the model
				return done(null);
			});
		});
	}));

passport.use('local-login', new LocalStrategy(ppOpts,
	function (req, username, password, done) {
		users.checkPass(username, password, function (err, user) {
			if (err) { //Somehow the password check failed
				//If it is an AuthErr then the username/password is invalid
        if (err.name === 'AuthErr') {
          return done(null, false, err.message);
        }
        //Otherwise it is some other sort of lookup error...
				return done(err);
      }
      //Else we have found our user, return it
			return done(null, user);
		});
	}));

module.exports = passport;
