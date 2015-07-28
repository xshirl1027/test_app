'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Messageboard = mongoose.model('Messageboard'),
	_ = require('lodash');

/**
 * Create a Messageboard
 */
exports.create = function(req, res) {
	var messageboard = new Messageboard(req.body);
	messageboard.user = req.user;

	messageboard.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(messageboard);
		}
	});
};

/**
 * Show the current Messageboard
 */
exports.read = function(req, res) {
	res.jsonp(req.messageboard);
};

/**
 * Update a Messageboard
 */
exports.update = function(req, res) {
	var messageboard = req.messageboard ;

	messageboard = _.extend(messageboard , req.body);

	messageboard.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(messageboard);
		}
	});
};

/**
 * Delete an Messageboard
 */
exports.delete = function(req, res) {
	var messageboard = req.messageboard ;

	messageboard.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(messageboard);
		}
	});
};

/**
 * List of Messageboards
 */
exports.list = function(req, res) {
	var keyNames = Object.keys(req.query);
	var val = req.query[keyNames[0]];
	
	var messageboardsErr = function(err, messageboards){
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(messageboards);
		}
	};
	
	if (keyNames.length === 0) {
		Messageboard.find().sort('-created').populate('user', 'displayName').exec(messageboardsErr);
	}
	else{
		Messageboard.find({ $text: { $search: val }}).sort('-created').exec(messageboardsErr);
	}
};

/**
 * Messageboard middleware
 */
exports.messageboardByID = function(req, res, next, id) { 
	Messageboard.findById(id).populate('user', 'displayName').exec(function(err, messageboard) {
		if (err) return next(err);
		if (! messageboard) return next(new Error('Failed to load Messageboard ' + id));
		req.messageboard = messageboard ;
		next();
	});
};

 
/**
 * Messageboard authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.messageboard.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
