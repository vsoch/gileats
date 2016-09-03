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
	zoomControl : true,
	panControl : true,
	streetViewControl : true,
	mapTypeControl: false,
	overviewMapControl: false,
	clickable: false
});

var image = '../img/favicon/apple-icon-57x57.png';
var gil = map.addMarker({
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
gil.addListener('dragend', function(evt) {
    console.log("hello! Have you ever seen a Gilfish? I'm a coffee cup with glasses!");
});

// Add link to restaurant selection input
var address_input = (document.getElementById('address-input'));

var autocomplete = new google.maps.places.Autocomplete(address_input);
autocomplete.bindTo('bounds', map.map);

var infowindow = new google.maps.InfoWindow();
var marker = new google.maps.Marker({
    map: map.map,
    anchorPoint: new google.maps.Point(0, -29),
    icon: image
});

autocomplete.addListener('place_changed', function() {
    infowindow.close();
    marker.setVisible(false);
    var place = autocomplete.getPlace();
    if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
        map.map.fitBounds(place.geometry.viewport);
    } else {
        map.map.setCenter(place.geometry.location);
        map.map.setZoom(17);  // Why 17? Because it looks good.
    }

    marker.setIcon(/** @type {google.maps.Icon} */({
        url: image,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
    }));

    // Update the hidden field to the location
    var lat = place.geometry.location.lat();
    var long = place.geometry.location.lng();
    var location = lat + ", " + long;
    $("#location").val(location);

    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    var address = '';
    if (place.address_components) {
        address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
    }

    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    infowindow.open(map.map, marker);
});

// Function to get a url, a promise controlling a worker
function get_url(url) {

    return new Promise((resolve, reject) => {
        const worker = new Worker("js/worker.js");
        worker.onerror = (e) => {
            worker.terminate();
            reject(e);
        };
        worker.onmessage = (e) => {
            worker.terminate();
            resolve(e.data);
        }
        worker.postMessage({url:url,"command":"getData"});
    });
};

function get_map_data(url){
    url = url || "https://dl.dropboxusercontent.com/s/m6fnsrc573duhyp/db.json?dl=0";
    return get_url(url); // This is a promise
}

// Function to update the (file) database
function update_db(url) {

    // TODO: check here if service worker has data cached
    var promise = get_map_data(url);

}

// Function to update the map
function update_map(url){

    var promise = get_map_data(url); // This is a promise
  
    // TODO: update cache of data from url

    // When the data is retrieved, add to map
    promise.then(function(data) {

        console.log(data);
        // Add a marker for each data point
        // TODO: this should be done to render points only within viewable range, ok to start since number is tiny :)

        // Here we are adding the listener for each food stop
        $.each(data,function(location_id,e){

            // Parse latitude and longitude from "location"
            var lat = parseFloat(e.location.split(" ")[0].replace(",",""));
            var lng = parseFloat(e.location.split(" ")[1]);

            // Each location has multiple records with different pictures
            contentstring = "<div id='content'><h2>" + location_id + "</h2>"
            $.each(e.records,function(i,e){
                console.log("Parsing picture " + e + " here...");
            });
            
            // Add all entries to the map as one point   
            var datum = new google.maps.Marker({ position: {lat: lat, lng: lng},
                                                 map: map.map,
                                                 title: location_id // This should be the place name...
                                               });

            // Generate info window dynamically when point is clicked
            datum.addListener('click', function() {
                console.log(this);
                console.log(this.title);
                var infowindow = new google.maps.InfoWindow({
                    content: "<h2>" + this.title + "</h2>"
                });
                infowindow.open(map.map, this);
            })
        });
    
    });

}

// call update_map the first time
update_map();
