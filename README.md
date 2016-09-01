# Gil Eats

![img/gil.png](img/gil.png)

What does Gil eat, and where does he get it from? The question of ages! I have a lot of fun getting him food, and he has a lot of fun eating it, and given that this trend will likely continue for many years, I wanted a way to keep a proper log of this data. I wanted pictures, locations, and reviews or descriptions. Thus, I wanted to create a simple database and visualization toward this goal. Specifically, I wanted the following:

- Gil can take a picture of his dinner, and upload it with some comments or review.
- The data (images and comments) are stored in a web-accessible location, in an organized fashion, making them immediately available for further (future!) analysis.
- The entire application is served statically, and the goal achieved with simple technology available to everyone (a.k.a, no paying for an instance on AWS).

### The Interface
The most appropriate visualization for this goal is a map. Likely we won't be encumbered with data anytime soon (even a few thousand records isn't too many to retrieve for one go) so to start I'll go for a simple rendering of images (as points) on the map.

### The "database"
Dropbox has a [nice API](https://dropbox.github.io/dropbox-api-v2-explorer) that is going to let me easily create an application, and then have (Gil) authenticate into his account in order to add a restaurant, which will be done with a form. The data (images and json with comments/review) will be retrieved from this same folder, and this is done on the page load, since


**under development**

- checks to do before upload (do we have an address? an image file?)
- first wanting to have individual files, realizing I can only get one file statically, and then I would need to keep data in one file, worrying about losing data / feasible to store in one, deciding on solution to keep records individually and update some master file when a new entry is made. Could be errors if the operation is closed when the file is being written, but then it will be re-generated next time an entry is made (and no data is lost)
- decision to make a hash based on location and name for individual record, and also storing a hash of just the location to generate the master file (with a lookup based on the location) - and a choice to use the places API in order to make that set of places finite. 
