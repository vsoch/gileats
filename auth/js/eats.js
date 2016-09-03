/* ---------------------------
Utils
----------------------------*/

// Extend Strings to generate a unique hash code, will be used for image/record unique ids
String.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length === 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
};


/* ---------------------------
Google Map Customization 
----------------------------*/

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

// Autocomplete for addresses, we use this to ensure a finite set of places
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


/* ---------------------------
Worker General Functions
----------------------------*/

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
        worker.postMessage({url:url,command:"getData"});
    });
};


// Download a file (json) from Dropbox
function dropbox_download(path) {
 
    path = path || "/gileats/";

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
        worker.postMessage({ access_token:access_token,
                             path:path,
                             command:"filesGetDropbox"});
    });
};

// Create a dropbox folder if it doesn't exist
function createFolder(path,folder,access_token) {

     path = path || ''
     folder = folder || 'gileats'

     return new Promise((resolve, reject) => {
     
         // Create an instance of Dropbox with the access token 
         var dbx = new Dropbox({ accessToken: access_token });

         // If path folder doesn't exist, create it
         var create_folder = true;
         dbx.filesListFolder({path: path})
        .then(function(response) {
            response.entries.forEach(function(e) {
                if (e.name == folder) {
                    create_folder = false;
                }
            })
            return create_folder
        })
        .then(function(create_folder) {

            if (create_folder == true) {

                // Create folder, and return promise (continue down chain)
                return dbx.filesCreateFolder({path: '/' + folder})

            } else {

                // Folder is already created, return success
                resolve(create_folder);
            }
        })                

        // Return success after folder creation
       .then(function(response) {
           resolve(response);
        })

        // Return fail if folder creation has error
        .catch(function(error) {
            console.error(error);
            reject(error);
        });
       
    });
};

/* ---------------------------
Data General Functions
----------------------------*/

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

// Trigger that is called when user pushes button to upload file/record to dropbox
function uploadFiles() {

    var ACCESS_TOKEN = document.getElementById('access-token').value;
        
    // Create json record from form, required are an address and image file
    var address = document.getElementById('address-input').value;    // "Coho Data, Middlefield Road, Palo Alto, CA, United States"
    var fileInput = document.getElementById('file-upload');
        
    // Has the user made a selection?
    if ((address != "") && (fileInput.files.length > 0)) {
        var loc = document.getElementById('location').value              // "37.417157, -122.10435719999998"
        var datestr = document.getElementById('date').value
        var rating = $("input[name='rating']:checked"). val();
        var review = document.getElementById('review').value

        // Create uid for the entry
        var uid = (loc + datestr + rating + review).hashCode()

        // Here is our image file
        var image_file = fileInput.files[0];
        var filename = uid + "." + image_file.name.split('.').pop();

        var record = {id:uid,
                      location_id: loc.hashCode(),
                      image: filename,
                      name: address, 
                      location: loc, 
                      date: datestr,
                      rating: rating,
                      review: review};

        var record = [JSON.stringify(record)];

        // Connect to dropbox
        var dbx = new Dropbox({ accessToken: ACCESS_TOKEN });            
        file = new File(record, 'record_' + uid + '.json' ,{type: 'text/json;charset=utf-8'});        
        dbx.filesUpload({path: '/gileats/' + file.name, contents: file})
  
            // Upload individual record file
            .then(dbx.filesUpload({path: '/gileats/' + filename, contents: image_file}))
            .catch(function(error) {
                console.error(error);
            })

            // Then upload image file
            .then(function(response) {
                var results = document.getElementById('results');
                results.textContent = 'Image and data uploaded, dawg!';
                console.log(response);
             })
             .catch(function(error) {
                console.error(error);
             });

                    // Get current results

                    // Add new result to it
 
                    // Save back to result (override)

                    // Does the url change?

                    // THIS for saving data
                    // https://advancedweb.hu/2016/08/09/parallel-processing-in-js/?utm_source=codropscollective  

//pr.all for getting all jsons https://www.promisejs.org/patterns/

                    // TODO: make service workers to perform these functions!
                    // break functionality of update_map into different functions
                    // use those functions here to get results, then update the results file
                    // Finally, update the json file with the new entry
                    /**
	 * Create a new file with the contents provided in the request. Do not use this
	 * to upload a file larger than 150 MB. Instead, create an upload session with
	 * upload_session/start.
	 * @function Dropbox#filesUpload
	 * @arg {Object} arg - The request parameters.
	 * @arg {Object} arg.contents - The file contents to be uploaded.
	 * @arg {String} arg.path - Path in the user's Dropbox to save the file.
	 * @arg {Object} arg.mode - Selects what to do if the file already exists.
	 * @arg {Boolean} arg.autorename - If there's a conflict, as determined by mode,
	 * have the Dropbox server try to autorename the file to avoid conflict.
	 * @arg {Object|null} arg.client_modified - The value to store as the
	 * client_modified timestamp. Dropbox automatically records the time at which
	 * the file was written to the Dropbox servers. It can also record an additional
	 * timestamp, provided by Dropbox desktop clients, mobile clients, and API apps
	 * of when the file was actually created or modified.
	 * @arg {Boolean} arg.mute - Normally, users are made aware of any file
	 * modifications in their Dropbox account via notifications in the client
	 * software. If true, this tells the clients that this modification shouldn't
	 * result in a user notification.
	 * @returns {Object}
	               



                })
                .catch(function(error) {
                    console.error(error);
                });*/

        // If address and image not supplied, tell the user
        } else {
            var results = document.getElementById('results');
            results.textContent="Where is the food picture and address? :(";
        }
        return false
    }


// call update_map the first time
update_map();
