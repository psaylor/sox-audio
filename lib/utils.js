'use strict';

var exec = require('child_process').exec;

var whichCache = {};

var utils = {};

utils.args = function() {
	var list = [];

	// Append argument(s) to the list
	var argfunc = function() {
		if (arguments.length === 1 && Array.isArray(arguments[0])) {
			list = list.concat(arguments[0]);
		} else {
			// convert the arguments list to an Array for concatenation
			list = list.concat([].slice.call(arguments));
		}
	};

	argfunc.clear = function() {
		list = [];
	};

	argfunc.get = function() {
		return list;
	};

	argfunc.clone = function() {
		var cloned = utils.args();
		cloned(list);
		return cloned;
	};

	return argfunc;
};

utils.which = function(name, callback) {
	if (name in whichCache) {
		return callback(null, whichCache[name]);
	}
	var cmd = 'which ' + name;

	exec(cmd, function(err, stdout) {
		if (err) {
			callback(null, whichCache[name] = '');
		} else {
			callback(null, whichCache[name] = stdout.trim());
		}
	});
};

module.exports = utils;