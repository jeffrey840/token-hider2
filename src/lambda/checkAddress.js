const axios = require("axios");
const turf = require("@turf/turf");

exports.handler = async (event) => {
	// URL for fetching GeoJSON data of school districts
	const geojsonURL = "https://raw.githubusercontent.com/jeffrey840/zipcode_2/main/Hcc_districts_Geojson/merged_districts.geojson";
	const { address } = event.queryStringParameters; // Expecting address instead of lat/lng

	try {
		// Geocode the address to get lat/lng
		const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.API_TOKEN}`;
		const geocodeResponse = await axios.get(geocodeUrl);
		if (geocodeResponse.data.status !== 'OK' || !geocodeResponse.data.results.length) {
			throw new Error("Geocoding failed or returned no results");
		}
		const location = geocodeResponse.data.results[0].geometry.location;

		// Fetch the school districts GeoJSON
		const geojsonResponse = await axios.get(geojsonURL);
		const districtsGeoJSON = geojsonResponse.data;

		// Create a point for the geocoded address
		const point = turf.point([location.lng, location.lat]);
		let isInside = false;

		// Check if the point is inside any of the polygons in the GeoJSON
		console.log(`Checking location: ${JSON.stringify(point.geometry)}`);
		turf.featureEach(districtsGeoJSON, (feature, index) => {
			if (turf.booleanPointInPolygon(point, feature)) {
				console.log(`Point is inside feature ${index}`);
				isInside = true;
			}
		});

		if (!isInside) {
			console.log("Point is not inside any feature");
		}

		return {
			statusCode: 200,
			body: JSON.stringify({
				isInside,
				location // Return the geocoded location to the client if needed
			})
		};
	} catch (error) {
		console.error(error); // Logging the error can help in debugging
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Error processing the request." })
		};
	}
};
