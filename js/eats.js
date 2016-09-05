/* ---------------------------
Utils
----------------------------*/
function getCookieToken(cookiename) {
    cookiename = cookiename || 'gileats';
    return $.cookie(cookiename);    
}


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
var url = "https://dl.dropboxusercontent.com/s/9ymw0a4822nryj6/db.json?dl=0";
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

var image = 'img/favicon/apple-icon-57x57.png';
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

/* ---------------------------
Dropbox General Functions
----------------------------*/

// Download a file (json) from Dropbox
function update_data(data,access_token) {
 
    return new Promise((resolve, reject) => {

        path = "/gileats";

        var dbx = new Dropbox({ accessToken: access_token });   
        var content = [JSON.stringify(data,null,'\t')];

        update = new File(content, 'db.json', {type: 'text/json;charset=utf-8'});        
        dbx.filesUpload({path: path + '/' + update.name, 
                         contents: update,
                         mode:'overwrite'})
        .then(function(response) {
            resolve(response);
        })
        .catch(function(error) {
            console.error(error);
            resolve(error);
        });
    });
};

// Get a shared link for a particular path
function getSharedLink(path,access_token) {

    return new Promise(function(resolve,reject){

        var dbx = new Dropbox({ accessToken: access_token });            
        dbx.sharingCreateSharedLink({path:path}).then(function(response){
            var sharedURL = response.url.replace('www.dropbox.com','dl.dropboxusercontent.com')
            resolve(sharedURL);
        }).catch(function(error){
            console.log(error);
            reject(error);
        });
    });

};

// Update entire database file (must be run manually)
function bigUpdate(access_token) {

    var dbx = new Dropbox({ accessToken: access_token });            
        
    // Create gileats folder, but overwrite old database
    createDB(access_token,'overwrite') // this is a promise
    .then(function(response) {

        // Regular expression for data
        var re = /^record_/;
        var data = {};

        // We need to wrap the download function in a promise
        function downloadPromise(pathname) { 
            return new Promise(function(resolve, reject) { 
                dbx.filesDownload({path:pathname}).then(function(response){
                    // Convert blob to file
                     var reader = new FileReader();
                     reader.onload = function(event){
                         var result = JSON.parse(reader.result)
                         return resolve(result);
                     };
                     reader.readAsText(response.fileBlob);
                }).catch(function(error){
                    return reject(error)
                })
            });
        }

        // Get all current data files, and write to new database
        dbx.filesListFolder({path: '/gileats'})
        .then(function(response) {
            var promises = [];
            response.entries.forEach(function(e) {
                // If we have a record, get it
                if (re.test(e.name) == true) {
                    // Retrieve the file and get a list of newRecords for data
                    promises.push(downloadPromise('/gileats/' + e.name))
                }
            })
 
            // Now run all promises, don't move on until last operation is complete
            Promise.all(promises).then(function(results) {

                 // For each data object, write to new data file
                 update_db(results).then(function(newData){
                     console.log(newData);
                     // Save the result back to the database
                     update_data(newData,access_token);
                 }).catch(function(err) {
                     console.log(err);
                 });
            })
        });
    });
}

// Create the database
function create_db(overwrite){

    // create file, and return promise (continue down chain)
    db = new File(["{}"], 'db.json' ,{type: 'text/json;charset=utf-8'});    
    if (overwrite == 'overwrite') {
        console.log('!!overwrite mode!!');
        return dbx.filesUpload({path: '/gileats/' + db.name, contents: db, mode:'overwrite'})
    } else {
        
        // Only create db if not there.
        var db_exists = true;
        dbx.filesListFolder({path: ''})
        .then(function(response) {
            response.entries.forEach(function(e) {
                if (e.name == 'db.json') {
                    db_exists = false;
                }
            })
            return db_exists;
        })
        .then(function(db_exists) {
            if (db_exists == true) {
                return dbx.filesUpload({path: '' + db.name, contents: db})
            }
            return Promise.resolve();
        })                
    }
}

// Create the db file if it doesn't exist
function createDB(access_token,overwrite) {

     overwrite = overwrite || ''

     return new Promise((resolve, reject) => {
     
         // Create an instance of Dropbox with the access token 
         var dbx = new Dropbox({ accessToken: access_token });

        /* Create the database - the folder is created for us already in the "Apps" folder 
        of the user Dropbox, called "gileats" */
        create_db(overwrite)

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
    url = url || getCookieToken('url') || "https://dl.dropboxusercontent.com/s/0em1erbgdjbom93/db.json?dl=0";
    return get_url(url); // This is a promise
}

// Function to update the (file) database
function update_db(newRecords,url) {

    // If not an array, make it one
    if(Object.prototype.toString.call(newRecords) !== '[object Array]' ) {
        newRecords = [newRecords];
    }

    url = url || getCookieToken('url');
    
    var promise = get_map_data(url)
    .then(function(data){

         // Create a function to return promise to generate data
         function generateRecordPromise(newRecord) { 
            return new Promise(function(resolve, reject) { 

                return getSharedLink('/gileats/' + newRecord.image,access_token)
                .then(function(image_url){
                    newRecord['image_url'] = image_url;
                    return getSharedLink('/gileats/record_' + newRecord.id + '.json',access_token)
                    .then(function(record_url){
                       newRecord['record_url'] = record_url;
                       resolve(newRecord); 
                    })
                    .catch(function(error){
                        console.log(error);
                        reject(error);
                    })
                });
            });
         }

         var promises = [];
         newRecords.forEach(function(e) {
             promises.push(generateRecordPromise(e))
         })

        // Now run all promises to generate array of data
        return Promise.all(promises).then(function(newdata) {

            return new Promise(function(resolve,reject){

                // Add each new record
                $.each(newdata,function(i,newRecord){

                    // Generate a new record, a subset of information
                    var record = {id:newRecord.id,
                                  image:newRecord.image,
                                  image_url:newRecord.image_url,
                                  record_url:newRecord.record_url,
                                  review:newRecord.review,
                                  rating:newRecord.rating}

                    // Is the record in the current data?
                    var added = false;
                    $.each(data,function(location_id,e){
                        if (newRecord.location_id == location_id) {
                            data[location_id].records.push(record);
                            added = true;
                        }
                    });

                    // If the record wasn't added, the location_id isn't in the db
                    if (added == false) {

                        data[newRecord.location_id] = {"location": newRecord.location,
                                                       "name": newRecord.name,
                                                       "records":[record]}
                    }
                });
                resolve(data);
            });    

        });
    });
    return promise;
}

/* Function to get info on a particular image (not in use)
function getinfo(image_id) {
    
    // Get the data url from the hidden span 
    var record_url = document.getElementById(image_id).getAttribute('data-url');

    // Retrieve the data url that has meta data, etc.
    get_url(record_url).then(function(result){
       var image_caption = "<strong>Review:</strong> " + result.review + "<br><strong>Rating:</strong> " + result.rating + "/5 stars";
       document.getElementById("record_" + image_id).setAttribute('data-caption',image_caption); 
    })
}*/

// Function to update the map
function update_map(url){

    var promise = get_map_data(url); // This is a promise
  
    // TODO: update cache of data from url

    // When the data is retrieved, add to map
    promise.then(function(data) {

        // Add a marker for each data point
        // TODO: this should be done to render points only within viewable range, ok to start since number is tiny :)

        // Here we are adding the listener for each food stop
        $.each(data,function(location_id,e){

            // Parse latitude and longitude from "location"
            var lat = parseFloat(e.location.split(" ")[0].replace(",",""));
            var lng = parseFloat(e.location.split(" ")[1]);

            // Each location has multiple records with different pictures
            contentstring = "<h2>" + e.name + "</h2><div class='gallery'>"
            $.each(e.records,function(i,record){
                var image_caption = "<strong>Review:</strong> " + record.review + "<br><strong>Rating:</strong> " + record.rating + "/5 stars";
                contentstring = contentstring + '<a data-caption="' + image_caption +'" id="record_' + record.id + '" href="'+ record.image_url +'"><img src="' + record.image_url +'" height="100px"></a>\n'
            });
            contentstring = contentstring + '</div>'
            
            // Add all entries to the map as one point   
            var datum = new google.maps.Marker({ position: {lat: lat, lng: lng},
                                                 map: map.map,
                                                 title: e.name, // This should be the place name...
                                                 content: contentstring
                                               });

            // Generate info window dynamically when point is clicked
            datum.addListener('click', function() {
                
                var infowindow = new google.maps.InfoWindow({
                    content: this.content
                });

                // Initialize the image lightbox
                infowindow.open(map.map, this);
                baguetteBox.run('.gallery')
            })
        });
    
    });
}

// Trigger that is called when user pushes button to upload file/record to dropbox
function uploadFiles() {

    // Retrieve url and access token from fields
    url = document.getElementById('url').value || getCookieToken('url');
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

        var newRecord = {id:uid,
                      location_id: loc.hashCode(),
                      image: filename,
                      name: address, 
                      location: loc, 
                      date: datestr,
                      rating: rating,
                      review: review};

        var record = [JSON.stringify(newRecord)];

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
             })
             // Add new result to current result
             .then(function(response){

                 console.log(newRecord);
                 update_db(newRecord,url).then(function(data){
                     // Save the result back to the database
                     update_data(data,access_token)
                         .then(function(newdata){
                             update_map();
                             var results = document.getElementById('results');
                             results.textContent = '';
                     });
                 });
              });

        // If address and image not supplied, tell the user
        } else {
            var results = document.getElementById('results');
            results.textContent="Where is the food picture and address? :(";
        }
        return false
    }


// call update_map the first time
update_map();
