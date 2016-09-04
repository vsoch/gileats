/* 
      ___                                              ___           ___                       ___     
     /  /\        ___                                 /  /\         /  /\          ___        /  /\    
    /  /:/_      /  /\                               /  /:/_       /  /::\        /  /\      /  /:/_   
   /  /:/ /\    /  /:/      ___     ___             /  /:/ /\     /  /:/\:\      /  /:/     /  /:/ /\  
  /  /:/_/::\  /__/::\     /__/\   /  /\           /  /:/ /:/_   /  /:/~/::\    /  /:/     /  /:/ /::\ 
 /__/:/__\/\:\ \__\/\:\__  \  \:\ /  /:/          /__/:/ /:/ /\ /__/:/ /:/\:\  /  /::\    /__/:/ /:/\:\
 \  \:\ /~~/:/    \  \:\/\  \  \:\  /:/           \  \:\/:/ /:/ \  \:\/:/__\/ /__/:/\:\   \  \:\/:/~/:/
  \  \:\  /:/      \__\::/   \  \:\/:/             \  \::/ /:/   \  \::/      \__\/  \:\   \  \::/ /:/ 
   \  \:\/:/       /__/:/     \  \::/               \  \:\/:/     \  \:\           \  \:\   \__\/ /:/  
    \  \::/        \__\/       \__\/                 \  \::/       \  \:\           \__\/     /__/:/   
     \__\/                                            \__\/         \__\/                     \__\/    

Web Worker!

*/

// Function for worker to get files
function workerJSON(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);  // synchronous request
    xhr.send(null);
    return xhr.responseText;
}

// The main calling function for the worker, will use switch to call other functions
onmessage = function(e) {

    switch(e.data.command) {
        case "updateMap":
            console.log("Worker updating map!");
            update_map();
            break;
        case "getData":
            const result = JSON.parse(workerJSON(e.data.url));
            postMessage(result);
            break;
        default:
            console.log("Command not recognized!")
    }

    // Have the worker terminate itself
    console.log("Terminating worker...");
    close();
};
