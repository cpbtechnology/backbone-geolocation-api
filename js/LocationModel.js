/**
	@class
		LocationModel contains functionality for performing browser geolocation and zip code lookup via external web service.
*/
var LocationModel = Backbone.Model.extend({
	'defaults': {
		'geoLocationServiceURL': 'http://where.yahooapis.com/geocode?gflags=R&flags=J&appid=nUSDKI5g&location=',
		'showErrorMessages': false,
		'localStorageTimeoutAsMS': 3600000
	},

	'initialize': function() {
		var model = this;
		log('Backbone : GeolocationModel : Initialized');
	},
/**
		@name LocationModel#geolocate
		@function
		@description
			Method to initiate geolocation.
	*/
	'geolocate': function() {
		var model = this,
			latestZipCode = localStorage.getItem('storedZipCode');

		if (latestZipCode) {
			var parsedZipCode = JSON.parse(latestZipCode),
				zipCode = parsedZipCode.zipCode,
				dateString = parsedZipCode.timestamp;

			if (model.isCurrentZipCode(dateString)) {
				model.set({
					'zipCode': zipCode
				});
			} else {
				navigator.geolocation.getCurrentPosition(geoSuccess, geoFail, {
					timeout: 10000
				});
			}
		} else {
			navigator.geolocation.getCurrentPosition(geoSuccess, geoFail, {
				timeout: 10000
			});
		}
/**
			@name LocationModel#geoSuccess
			@function
			@property position Current geolocation position.			
			@description
				Success callback method for navigator.geoloction.getCurrentPosition.		
		*/

		function geoSuccess(position) {
			var latitude = position.coords.latitude,
				longitude = position.coords.longitude;
			model.getZipCode(latitude, longitude);
		}
/**
			@name LocationModel#geoFail
			@function
			@property position Current geolocation position.			
			@description
				Fail callback method for navigator.geoloction.getCurrentPosition		
		*/

		function geoFail() {
			model.trigger('error', model.set({
				'errorMessage': 'Geolocation getCurrentPosition failed.'
			}));
		}
	},
/**
		@name LocationModel#getZipCode
		@function
		@property latitude Latitude of current position.
		@property longitude Longitude of current position.			
		@description
			Performs web service zip code lookup using the passed latitude and longitude.
	*/
	'getZipCode': function(latitude, longitude) {
		var model = this;
		var geoLocationServiceURL = model.get('geoLocationServiceURL') + latitude + '+' + longitude;

		$.getJSON(geoLocationServiceURL, function(data) {
			if (data.ResultSet !== undefined && data.ResultSet.Result !== undefined) {
				var newZipCode = data.ResultSet.Result.uzip;
				var zipCodeJSON = {
					'zipCode': newZipCode,
					'timestamp': new Date().getTime()
				};
				localStorage.setItem('storedZipCode', JSON.stringify(zipCodeJSON));
				model.setZipCode(newZipCode);
			} else if (data.ResultSet.Error !== undefined) {
				if (!model.showErrors()) {
					return;
				}
				model.trigger('error', model.set({
					'errorMessage': 'PlaceFinder API - ' + data.ResultSet.ErrorMessage
				}));
			} else {
				if (!model.showErrors()) {
					return;
				}
				model.trigger('error', model.set({
					'errorMessage': 'No zip code returned'
				}));
			}
		}).error(function() {
			if (!model.showErrors()) {
				return;
			}
			model.trigger('error', model.set({
				'errorMessage': 'JSON Failed'
			}));
		});
	},
/**
		@name LocationModel#setZipCode
		@function
		@property newZipCode Zip code to be set.			
		@description
			Sets the model's zip code attribute.
	*/
	'setZipCode': function(newZipCode) {
		this.set({
			'zipCode': newZipCode
		});
	},
/**
		@name LocationModel#showErrors
		@function
		@property {boolean} flag Set showErrors boolean value
		@description
			Determines whether or not to log errors.
	*/
	'showErrors': function(flag) {
		if (!flag) {
			return this.get('showErrorMessages') || true;
		}
		this.set({
			'showErrorMessages': flag
		});
	},
/**
		@name LocationModel#supportsGeolocation
		@function
		@returns {boolean} Whether geolocation is supported.
		@description
			Checks if browser supports geolocation.
	*/
	'supportsGeolocation': function() {
		if (navigator.geolocation) {
			log('Geolocation Supported');
			localStorage.setItem('geolocation', 'supported');
			return true;
		} else {
			this.trigger('error', this.set({
				'errorMessage': 'Geolocation Disabled'
			}));
			return false;
		}
	},
/**
		@name LocationModel#isCurrentZipCode
		@function
		@property dateString Date string to be checked.
		@returns {boolean} Whether zip code is current.		
		@description
			Checks if zip code is current when compared to localStorageTimeoutAsMS.
	*/
	'isCurrentZipCode': function(dateString) {
		var now = new Date().getTime().toString(),
			timeDiff = now - dateString;

		if (timeDiff < this.get('localStorageTimeoutAsMS')) {
			return true;
		} else {
			return false;
		}
	},
/**
		@name LocationModel#setErrors
		@function			
		@description
			Sets the model's error message attribute.
	*/
	'setErrors': function() {
		log('Error: ' + this.get('errorMessage'));
	}

});
