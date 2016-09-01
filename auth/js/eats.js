// Google Map Customization

var map;

var lat = 37.3861;
var long = -122.0839;

map = new GMaps({
	el: '#gmap',
	lat: lat,
	lng: long,
	scrollwheel:false,
	zoom: 16,
	zoomControl : false,
	panControl : false,
	streetViewControl : false,
	mapTypeControl: false,
	overviewMapControl: false,
	clickable: false
});

var image = '../img/favicon/apple-icon-57x57.png';
var marker = map.addMarker({
	lat: lat,
	lng: long,
	icon: image,
        draggable: true,
	animation: google.maps.Animation.DROP,
	verticalAlign: 'bottom',
	horizontalAlign: 'center',
	backgroundColor: '#ffffff',
});

var styles = [ 

{
	"featureType": "road",
	"stylers": [
	{ "color": "" }
	]
},{
	"featureType": "water",
	"stylers": [
	{ "color": "#A2DAF2" }
	]
},{
	"featureType": "landscape",
	"stylers": [
	{ "color": "#ABCE83" }
	]
},{
	"elementType": "labels.text.fill",
	"stylers": [
	{ "color": "#000000" }
	]
},{
	"featureType": "poi",
	"stylers": [
	{ "color": "#2ECC71" }
	]
},{
	"elementType": "labels.text",
	"stylers": [
	{ "saturation": 1 },
	{ "weight": 0.1 },
	{ "color": "#111111" }
	]
}

];

map.addStyle({
	styledMapName:"Styled Map",
	styles: styles,
	mapTypeId: "map_style"  
});

map.setStyle("map_style");

// Start the lat and long at the current location
$("#location").val(lat +", "+ long);

// Add event listener to fire a function when the marker is moved
marker.addListener('dragend', function(evt) {
    var lat = evt.latLng.lat().toFixed(3);
    var long = evt.latLng.lng().toFixed(3);
    $("#location").val(lat +", "+ long);
});
