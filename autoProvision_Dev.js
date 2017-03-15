// Create users for your account (Node.js)

// To run this sample
//  1. Copy the file to your local machine and give .js extension (i.e. example.js)
//  2. Change "***" to appropriate values
//  3. Install async and request packages
//     npm install async
//     npm install request
//     npm install fs
//  4. execute
//     node example.js 
//

var     async = require("async"),		// async module
        request = require("request"),		// request module
    	fs = require("fs");			// fs module

var 	email = "",				// your account email
    	password = "",			// your account password
    	integratorKey = "",			// your Integrator Key (found on the Preferences -> API page)
    	baseUrl = ""; 				// we will retrieve this through the Login call

var numberOfUsers = 10;      // the number of users you want to create


var emailAddress='', userName='';
var usersArray = [];       // array that we will throw the stringified values in
for(var i = 0; i<numberOfUsers;i++){        
emailAddress += "evan.tcsmtest+E"+i+"@gmail.com";    // email template that we will use and iterate a number for i. 
userName += "Test UserE+"+i;                    // username template that we will use and iterate a number for i. 

var apiUsers = {
	
           
            "userName": userName,
            "userSettings":[{
      			"name":"apiAccountWideAccess",
      			"value":"true"
    		},
    		{
    			"name":"allowSendOnBehalfOf",
      			"value":"true"
    		}],
            "email": emailAddress,
            "forgottenPasswordInfo": {
                "forgottenPasswordAnswer1": "lsdjfqwerwers",
                "forgottenPasswordAnswer2": "zxvsdfwerasdfas",
                "forgottenPasswordAnswer3": "jhhkjdfiuidysfuiy",
                "forgottenPasswordAnswer4": "qswervtrnynt",
                "forgottenPasswordQuestion1": "adfwerqxvwsedf",
                "forgottenPasswordQuestion2": "asdfawerzbfad",
                "forgottenPasswordQuestion3": "sadfuioyiuwqer",
                "forgottenPasswordQuestion4": "asdfnbmnwqerqwe"
            },
            
            "password": "123456"
        } ;
        usersArray.push(JSON.stringify(apiUsers));    // adding the stringified verion to the array

        emailAddress='';     // reseting the values after each loop iteration 
        userName='';         // reseting the values after each loop iteration 


};
async.waterfall(
  [
    /////////////////////////////////////////////////////////////////////////////////////
    // Step 1: Login (used to retrieve your accountId and baseUrl)
    /////////////////////////////////////////////////////////////////////////////////////
    function(next) {
		var url = "https://demo.docusign.net/restapi/v2/login_information";
		var body = "";	// no request body for login api call
		
		// set request url, method, body, and headers
		var options = initializeRequest(url, "GET", body, email, password);
		
		// send the request...
		request(options, function(err, res, body) {
			if(!parseResponseBody(err, res, body)) {
				return;
			}
			baseUrl = JSON.parse(body).loginAccounts[0].baseUrl;
			next(null); // call next function
		});
	},
    
    /////////////////////////////////////////////////////////////////////////////////////
    // Step 2: Create new users
    /////////////////////////////////////////////////////////////////////////////////////
    function(next) {   	
    	var url = baseUrl + "/users";
    	
    	// defining the body with the usersArray
		var body = '{"newUsers": ['+usersArray+']}';
		
		// set request url, method, body, and headers
		var options = initializeRequest(url, "POST", body, email, password);
	
		// set Content-Type header to "application/json"
		options.headers["Content-Type"] = "application/json";

		// send the request...
		request(options, function(err, res, body) {
			//parseResponseBody(err, res, body);
			var resBody = JSON.parse(body);
			console.log("\r\nAPI Call Result: \r\n", resBody);
			if( res.statusCode != 200 && res.statusCode != 201)	{ // success statuses
			console.log("Error calling webservice, status is: ", res.statusCode);
			console.log("\r\n", err);
			return false;
			}
	
			console.log(getUserIds(resBody,"userId"));

			//console.log('This is the array: '+userIdsArray);
			return true;
		}) 
		

		}   


]);



//***********************************************************************************************
// --- HELPER FUNCTIONS ---
//***********************************************************************************************
function initializeRequest(url, method, body, email, password) {	
	var options = {
		"method": method,
		"uri": url,
		"body": body,
		"headers": {}
	};
	addRequestHeaders(options, email, password);
	return options;
}

///////////////////////////////////////////////////////////////////////////////////////////////
function addRequestHeaders(options, email, password) {	
	// JSON formatted authentication header (XML format allowed as well)
	dsAuthHeader = JSON.stringify({
		"Username": email,
		"Password": password, 
		"IntegratorKey": integratorKey	// global
	});
	// DocuSign authorization header
	options.headers["X-DocuSign-Authentication"] = dsAuthHeader;
}

///////////////////////////////////////////////////////////////////////////////////////////////
function parseResponseBody(err, res, body) {
	var resBody = JSON.parse(body);
	console.log("\r\nAPI Call Result: \r\n", resBody);
	if( res.statusCode != 200 && res.statusCode != 201)	{ // success statuses
		console.log("Error calling webservice, status is: ", res.statusCode);
		console.log("\r\n", err);
		return false;
	}
	
	//userIdsArray = [getUserIds(resBody,"userId")];
	//console.log('This is the array in the prb funciton: '+userIdsArray);
	return true;
	
}
/////////////////////////////////////////////////////////////////////////////////////////////

//return an array of user Ids 
function getUserIds(obj, key) {
	var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getUserIds(obj[i], key));
        } else if (i == key) {
            objects.push(obj[i]);
                    }
    }

    return objects;

}

