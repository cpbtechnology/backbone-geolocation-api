backbone-geolocation-api
========================

Example usage within a Backbone.js view (assumes IE comment conditionals around <html>):

    var view = this;
    view.location = new LocationModel();
    view.location.showErrors(false);

    // IE9 can't retrieve the x-domain JSON result, so treat it as though it doesn't support the geolocation API.
    if (view.location.supportsGeolocation() && !$(document.documentElement).hasClass('ie9')) {
    	view.location.bind('change:zipCode', function() {
    		view.$el.find('.zip').val(view.location.get('zipCode'));
    	});
    	view.location.geolocate();
    }