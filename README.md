# Campus Attendance Solution - API

* Setup
    1. Install latest npm and nodejs, mysql
    2. `npm install` to install all dependencies
    3. Rename __db/db.template.js__ to __db/db.js__, and replace the user and password for mysql connection
    4. Rename __config/serviceAccountKey.template.json__ to __config/serviceAccountKey.json__, and replace the keys based on FCM
    5. `npm run forever` to deploy to port 5000
    6. `npm run generate-docs` to generate documentation, output in __out/campusattendanceapi/1.0.0__
    
* Packages Installed
    * __babel__ - Some ES6 syntax are used, so babel is used here to compile them to ES5
    * __body-parser__ - Parse request data received to easily accessible object format  
    * __express__ - Middleware, most importantly for routing. See __routes/index.js__ 
    * __jsonwebtoken__ - To generate, keep track and verify API token
    * __mysql__ - Connections to mysql database
    * __jsdoc__ - To generate documentation
    
* Explanations
    * __package.json__ - Where all the dependencies are listed. When you install a package with `npm install x`, the configuration will be added here  
    * __app.js__ - The main file of the application, nothing much here except initializing necessary package  
    * __db/db.js__ - Database configuration and connection  
    * __config/config.js__ - Secret word for generating api token. Not supposed to be committed but here for learning purpose  
    * __routes/index.js__ - This is where the app decide which api calls goes to which functions  
    * __controllers/helperController.js__ - Contain utility function  
    * __controllers/mobileApiController.js__ - This is the code that handles the workload when api calls are made  
    * Every API call except __login__ requires api token. Get the postman collection in the link below, run the __login__ api call to get a 24 hour token. Use this token to replace the old token in other api call in the collection
    * For more details, check out the documentation

    ### [CLICK HERE FOR DOCUMENTATION](http://37.247.116.48/campusattendanceapi/)
    ### [CLICK HERE FOR POSTMAN COLLECTION](https://www.getpostman.com/collections/0e4aef6ab608ff0139f2)
    