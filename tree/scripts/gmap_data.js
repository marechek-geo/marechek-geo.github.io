
	var gMap = new Object();
	var gMapOptions = new Object();
	gMap.reasons=[];
	gMap.reasons['ErrorMessage']           = 'Google Maps API failed to locate this place';
	if (typeof google != 'undefined') {		// i.e. GoogleMaps code has loaded OK
		gMap.types=[-1,google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN];

//		gMap.reasons[G_GEO_MISSING_ADDRESS]    = 'Missing Address: The address was either missing or had no value.';
		gMap.reasons[google.maps.GeocoderStatus.ZERO_RESULTS]    = 'Unknown Address: No corresponding geographic location could be found for the specified address.';
//		gMap.reasons[G_GEO_UNAVAILABLE_ADDRESS]= 'Unavailable Address: The geocode for the given address cannot be returned due to legal or contractual reasons.';
		gMap.reasons[google.maps.GeocoderStatus.INVALID_REQUEST]            = 'Bad Key: The API key is either invalid or does not match the domain for which it was given';
		gMap.reasons[google.maps.GeocoderStatus.OVER_QUERY_LIMIT]   = 'Too Many Queries: The daily geocoding quota for this site has been exceeded.';
		gMap.reasons[google.maps.GeocoderStatus.REQUEST_DENIED]       = 'Server error: The geocoding request could not be successfully processed.';
	} else {
		alert('Failed to load Google Maps API - check Internet connection !!');
	}
	gMap.typeDefault=1;
