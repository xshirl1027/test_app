'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Photo = mongoose.model('Photo'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, credentials2, user, user2, photo, photoGlobal;

/**
 * Photo routes tests
 */
describe('Photo CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Photo
		user.save(function() {
			photo = {
				src: 'Photo src'
			};

			done();
		});
	});

	it('should be able to save Photo instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Photo
				agent.post('/photos')
					.send(photo)
					.expect(200)
					.end(function(photoSaveErr, photoSaveRes) {
						// Handle Photo save error
						if (photoSaveErr) done(photoSaveErr);

						// Get a list of Photos
						agent.get('/photos')
							.end(function(photosGetErr, photosGetRes) {
								// Handle Photo save error
								if (photosGetErr) done(photosGetErr);

								// Get Photos list
								var photos = photosGetRes.body;

								// Set assertions
								(photos[0].user._id).should.equal(userId);
								(photos[0].src).should.match('Photo src');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Photo instance if not logged in', function(done) {
		agent.post('/photos')
			.send(photo)
			.expect(401)
			.end(function(photoSaveErr, photoSaveRes) {
				// Call the assertion callback
				done(photoSaveErr);
			});
	});

	it('should be able to update Photo instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Photo
				agent.post('/photos')
					.send(photo)
					.expect(200)
					.end(function(photoSaveErr, photoSaveRes) {
						// Handle Photo save error
						if (photoSaveErr) done(photoSaveErr);

						// Update Photo name
						photo.src = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Photo
						agent.put('/photos/' + photoSaveRes.body._id)
							.send(photo)
							.expect(200)
							.end(function(photoUpdateErr, photoUpdateRes) {
								// Handle Photo update error
								if (photoUpdateErr) done(photoUpdateErr);

								// Set assertions
								(photoUpdateRes.body._id).should.equal(photoSaveRes.body._id);
								(photoUpdateRes.body.src).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Photos if not signed in', function(done) {
		// Create new Photo model instance
		var photoObj = new Photo(photo);

		// Save the Photo
		photoObj.save(function() {
			// Request Photos
			request(app).get('/photos')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Photo if not signed in', function(done) {
		// Create new Photo model instance
		var photoObj = new Photo(photo);

		// Save the Photo
		photoObj.save(function() {
			request(app).get('/photos/' + photoObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('src', photo.src);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Photo instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Photo
				agent.post('/photos')
					.send(photo)
					.expect(200)
					.end(function(photoSaveErr, photoSaveRes) {
						// Handle Photo save error
						if (photoSaveErr) done(photoSaveErr);

						// Delete existing Photo
						agent.delete('/photos/' + photoSaveRes.body._id)
							.send(photo)
							.expect(200)
							.end(function(photoDeleteErr, photoDeleteRes) {
								// Handle Photo error error
								if (photoDeleteErr) done(photoDeleteErr);

								// Set assertions
								(photoDeleteRes.body._id).should.equal(photoSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Photo instance if not signed in', function(done) {
		// Set Photo user 
		photo.user = user;

		// Create new Photo model instance
		var photoObj = new Photo(photo);

		// Save the Photo
		photoObj.save(function() {
			// Try deleting Photo
			request(app).delete('/photos/' + photoObj._id)
			.expect(401)
			.end(function(photoDeleteErr, photoDeleteRes) {
				// Set message assertion
				(photoDeleteRes.body.message).should.match('User is not logged in');

				// Handle Photo error error
				done(photoDeleteErr);
			});

		});
	});

	it('should not be able to update Photo instance if not signed in', function(done) {
		// Set Photo user 
		photo.user = user;

		// Create new Photo model instance
		var photoObj = new Photo(photo);

		// Save the Photo
		photoObj.save(function() {
			// Try deleting Photo
			request(app).put('/photos/' + photoObj._id)
			.expect(401)
			.end(function(photoUpdateErr, photoUpdateRes) {
				// Set message assertion
				(photoUpdateRes.body.message).should.match('User is not logged in');

				// Handle Photo error error
				done(photoUpdateErr);
			});

		});
	});


	afterEach(function(done) {
		User.remove().exec();
		Photo.remove().exec();
		done();
	});
});

describe('ADDITIONAL Photo CRUD tests', function() {
		beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		credentials2 = {
			username: 'otherUsername',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Create another new user
		user2 = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials2.username,
			password: credentials2.password,
			provider: 'local'
		});

		// Save both users to the test db and create a new Photo in the first user's name
		user.save(function() {

			photoGlobal = new Photo({
				src: 'Photo src',
				user: user._id
			});

			// Save photo to the db
			photoGlobal.save(function() {
				// Save user2 to the test db
				user2.save(function(res) {
					done();
				});
			});
		});
	});

	it('should not be able to delete Photo instance if not its creator', function(done) {
		agent.post('/auth/signin')
			.send(credentials2)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Delete existing Photo
				agent.delete('/photos/' + photoGlobal._id)
					.send(photoGlobal)
					.expect(403)
					.end(function(photoDeleteErr, photoDeleteRes) {
						// Handle Photo error
						if (photoDeleteErr) done(photoDeleteErr);

						// Set message assertion
						(photoDeleteRes.text).should.match('User is not authorized');
						
						// Handle Photo save error
						done(photoDeleteErr);
					});
			});
	});

	it('should not be able to update Photo instance if not its creator', function(done) {
		agent.post('/auth/signin')
			.send(credentials2)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Delete existing Photo
				agent.put('/photos/' + photoGlobal._id)
					.send(photoGlobal)
					.expect(403)
					.end(function(photoPutErr, photoPutRes) {
						// Handle Photo error
						if (photoPutErr) done(photoPutErr);

						// Set message assertion
						(photoPutRes.text).should.match('User is not authorized');
						
						// Handle Photo save error
						done(photoPutErr);
					});
			});
	});

	afterEach(function(done) {
		User.remove().exec();
		Photo.remove().exec();
		done();
	});
});