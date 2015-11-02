/* BT601
// Assassins CloudCode
// Created August 2014
// 
*/

require('cloud/Cloud_Jobs.js');
require('cloud/User_Functions.js');
require('cloud/Get_Ripples.js');
require('cloud/Top_Ripples.js');
require('cloud/Ripple_Tools.js');
require('cloud/Pending_Ripples.js');
require('cloud/Emails.js');
require('cloud/Comments.js');



// reach level hash table with score cutoff as key and name + new reach level as children
var CUTOFF_LEVELS ={0: 		{"reach": 7, "level": "Sea Serpent"} , //0
					5: 		{"reach": 8, "level": "Narwhal"}, // 5
					25: 	{"reach": 9, "level": "Magikarp"}, // 25
					50: 	{"reach": 10, "level": "Yellow Submarine"}, // 50
					100: 	{"reach": 12, "level": "Mermaid"}, // 100
					210: 	{"reach": 15, "level": "Lochness Monster"}, // 210
					350:	{"reach": 18, "level": "Siren"}, // 250
					550: 	{"reach": 21, "level": "Leviathan"}, // 550
					1000: 	{"reach": 25, "level": "Hydra"},  // 1000
					1500:	{"reach": 28, "level": "Lady of the Lake"}, // 1500
					2000:	{"reach": 30, "level": "Captain Hook"}, // 2000
					2500:	{"reach": 33, "level": "Kraken"}, // 2500
					3250:	{"reach": 36, "level": "Medusa"}, // 3250
					5000:	{"reach": 40, "level": "Blastoise"}, // 5000
					7500:	{"reach": 45, "level": "Moby Dick"}, // 7500
					10000:	{"reach": 50, "level": "Aqua Man"}, // 10000
					15000: 	{"reach": 55, "level": "Captain Jack Sparrow"}, // 15000
					25000: 	{"reach": 60, "level": "Lord of Ripple"}, //25000
					35000: 	{"reach": 65, "level": "Lady of Ripple"}, // 35000
					50000:	{"reach": 70, "level": "Poseidon"} // 50000

}
					
// array of ordered Reach_level score cutoffs and keys 
var NETWORK_SCORE_CUTOFFS = [0,5,25,50,100,210,350,550,1000,1500,2000,2500,3250,5000,7500,10000,15000,25000,35000,50000];

// ripple milestones with number to increment score with
var MILESTONE_RIPPLE_ARRAY =	{
								//20 : 2,
								//35 : 3,
								50 : 5,
								//70 : 7,
								100 : 10,
								150 : 15,
								200 : 20,
								250 : 20,
								300: 40,
								350: 80};

var MINIMUM_PROPAGATIONS_FOR_FUTURE = 10;
var SPREADER_ACCOUNTS = ["4XPaxiSrnL","AmMgFilvXL","v5fyUY04BY","HDeeVSytgI","1kxK7LrUfC","COmQkHhBB6","M0xBVV1mMz","j64t0KSzcZ","syni7dWHF3","1HfWGwIvlf","6Ul4fTFxkL","Chp0t6XIxC","jl0U01vGk1","g4kvzJ02T0","9WZtYxlQ3U","LoUnCgUwd6","mYXHbAYoBe","7qgWBMZJu5","1qpfxsO487","PRGbHNnnVu","C3eut05Gvj","S3ODG9HrxK","VWjvSgvu3v","zfbux2yGi2","DfycH0fVbK","JrJgeL3rIc","LToKvWzdrW","ShnDRqn4fq","BW9q2UbBJc","5eJFzwCIii","UtlMvipz6V","C1zpfroOM5","WEV7FPwbDC","kW1kTWmy5p","pS25MXMX5k","aznxsRCwYu","OTiCEA7Knu","QX5Atl3KNt","St5TnezJls","oKMACuM5F0","TbOwOPLlP5","QYoaiCqqny","ZDfdiIZbew","CWWnjIEcKc","ZYCY4sM3xR","9TUZ7kCN0k","zrg3nYrnr3","rdnZpP4Z5p","9mplV4wa7q","P9qTpCHLQb","hf6gYxboxU","Ag4sNdyhkK","Gkh5DWJGOP","SYBxY39KF9","iBW8ndaXmA","g5qb1wB0QT","aXBYs8YTJm","4AmQljSRoc","SxsvB4UISr","FsL2AKcz86","OmRAnFoEve","8uXGeCGhzG","ICd982JoGp","qLoRq2REjl","UIzyPjwL7f","47udlKOJwA","zhTYTCVXH4","EsupzpV5k8","Sk8oMcWOlV","Mz8TlqzOvl","11H8cKwzrS","91Rwfav11m","YQ4WqGThJi","T1DbKBSZbB","ZhWFFp4gsS","K4Ui8BkJS8","OQXa5gYj6E","uwVnKVofrR","RWDpEyawWQ","cNg6ph9ONR","vUffzsNsRg","CjDybLkcVy","aq2wt9uSnb","2OBGxHSaa5","emMGlpaxR3","cEG63ITS5e","uCZRK3DlLW","tmno4Hr3jW","o7FiulZi2B","NLuXKjy3TE","1I73TfpiIW","qeq0tiIR8y","AdpDcMgf6h","msWkwTIGTA","bKpHpfOKTN","qseN28yho1","ddy6Up068I","5ByJLvu26i","qqGJUxhmhm","PbDUlUbPca","XOU2nFTqiW","AHXH6MtLJN","96fp46w4K0","b66iWeuGjP","2uisZ96Jbt","5e2PcXpXQe","0gIXwNlnhq","Oj9ATz012P","7v5LUHupCh","9iiAVAhJ0q","40dWifSj2b","u5914MZ3VJ","h735ix9NbT","InjRujkipo","Jt4Mx4gCiq","xr6zZ3g5Ih","WkjUhkyIej","3VSlTplXea","ofUnUu0szY","sWSHIvfaic","sP83CjCNAt","9HJ05jD5JF","1k9Tjj0NnD","TFh0nA1jRg","aMGv4D5VTz","twE4R2wUPy","KuyGXiEiVt","DXv6GGCHWr","CkWGf850GK","o0yH86iqC4","Gfz8kNgViM","vsbBrFoF9N","QOVGkSGMNA","vaNmsegXA1","TlqfwQ5gM8","1leABMuboa"];



/*******************MAIN.JS*******************
*
* DEALS WITH SPREAD,DISMISS, GETTTING FIRST RIPPLES, AND REFERRALS
*
/*******************MAIN.JS*******************/


/******
	Accept a referral
******/
Parse.Cloud.define("acceptReferral", function(request, response) 
{
	Parse.Cloud.useMasterKey();
	var token = request.params.token;

	var pointIncrease = 200;

	// First check if the user is already in QIN
	var receiverId = request.user.id;
	var receiverQuery = new Parse.Query(Parse.User);
	var receiverObject;
	var senderObject;
	var pathIdsKeep = null;

	receiverQuery.get(receiverId).then(function(receiver) {
		receiverObject = receiver;
		if (receiver.get("isQIN") == true)
		{
			response.success({"scoreIncrease" : -1});
		}

		// We passed. Let's go. Find the sender
		if (receiver.get("additional") == null)
			receiver.set("additional", token);

		var senderQuery = new Parse.Query(Parse.User);
		senderQuery.equalTo("username", token);
		return senderQuery.find();
		// return senderQuery.get(token);

	}).then(function(senders) {

		// error?
		var sender = senders[0];

		senderObject = sender;
		if (senderObject.get("isQIN") != true)
		{
			senderObject.set("isQIN", true);
		}

		receiverObject.set("isQIN", true);

		var promises = [];
		promises.push(senderObject.save());
		promises.push(receiverObject.save());

		return Parse.Promise.when(promises);

	}).then(function() {
		// If there is a referral path with sender at the end, use that.
		var ReferralPath = Parse.Object.extend("ReferralPath");
		var referralPathQuery = new Parse.Query(ReferralPath);

		referralPathQuery.equalTo("receiver", senderObject);
		return referralPathQuery.find();
		
	}).then(function(oldReferralPathArray) {
		var ReferralPath = Parse.Object.extend("ReferralPath");

		// Increment receiver's score.
		incrementPoints(receiverObject.id, pointIncrease);
		// Create new referral path
		if (oldReferralPathArray.length == 0)
		{
			var referralPath = new ReferralPath();
			var pathIds = [senderObject.id, receiverObject.id];
			referralPath.set("pathIds", pathIds);
			referralPath.set("receiver", receiverObject);

			
			// Reward the sender 500 points.	
			incrementPoints(senderObject.id, pointIncrease);

			// send push to ripple creator
			var pushQueryToSender = new Parse.Query(Parse.Installation);
			pushQueryToSender.equalTo('user', senderObject);
			Parse.Push.send({
				where: pushQueryToSender, // Set our Installation query
			    data: {
			  	  alert: "You just got 200 points for referring " + receiverObject.get("username"),
			  	  "goTo" : "MyRipplesViewController"
			  }
			});

			var promises = [];
			promises.push(senderObject.save());
			promises.push(referralPath.save());
			return Parse.Promise.when(promises);
		}
		else
		{
			var oldReferralPath = oldReferralPathArray[0];
			pathIdsKeep = oldReferralPath.get("pathIds");
			pathIds = oldReferralPath.get("pathIds").slice();
			var promises = [];

			

			pathIds.push(receiverObject.id);
			var referralPath = new ReferralPath();
			referralPath.set("pathIds", pathIds);
			referralPath.set("receiver", receiverObject);
			return referralPath.save();
		}
	}).then(function() {
		// Reward users in the path
		var promises = [];
		if (pathIdsKeep != null)
		{
			for (var i = 0; i < pathIdsKeep.length; i++)
			{
				var chainNumber = pathIdsKeep.length - (i + 1);
				var scoreIncrease = pointIncrease / Math.pow(2, chainNumber);
				alert(scoreIncrease);
				incrementPoints(pathIdsKeep[i], scoreIncrease);

				var pushQueryToSender = new Parse.Query(Parse.Installation);
				if (i == (pathIdsKeep.length - 1))
				{
					pushQueryToSender.equalTo('user', pathIdsKeep[i]);
					promises.push(Parse.Push.send({
						where: pushQueryToSender, // Set our Installation query
					    data: {
					  	  alert: "You just got " + scoreIncrease + " points for referring " + receiverObject.get("username"),
					  	  "goTo" : "MyRipplesViewController"
					  }
					}));
				}
				else 
				{
					pushQueryToSender.equalTo('user', pathIdsKeep[i]);
					promises.push(Parse.Push.send({
						where: pushQueryToSender, // Set our Installation query
					    data: {
					  	  alert: "You just got " + scoreIncrease + " points for indirectly referring " + receiverObject.get("username"),
					  	  "goTo" : "MyRipplesViewController"
					  }
					}));
				}
			}
		}
		alert("Say Geronimo");
		return Parse.Promise.when(promises);

	}).then(function() {
		// deal with the receiver:
		response.success({"scoreIncrease" : 200});
	});
});


Parse.Cloud.define("getNearestRipplesOnFirstLoad", function(request, response) {
	var userId = request.params.userId;
	var userLocation = request.params.userLocation;

	console.log("CALLED GETNEARESTRIPPLESONFIRSTLOAD");
	
	// get cutoff Date
	var currentDate = Date.now();
	var timeDelta = 3600*24000 * 3; //last number is number of days
	var cutoffDate = new Date(currentDate - (timeDelta));

	// grab x nearest ripples from
	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);

	rippleQuery.greaterThan("createdAt", cutoffDate);
	rippleQuery.withinKilometers("startLocation", userLocation, 5000);	
	rippleQuery.doesNotExist("killed");
	rippleQuery.limit(80);
	rippleQuery.descending("createdAt");

	rippleQuery.find({
		success: function(ripples)
		{
			// for each one, create a mini ripple and add to array to add
			var miniRippleArray = [];
			var MiniRipple = Parse.Object.extend("MiniRipple");

			// create user object
			var newUser = new Parse.User();
			newUser.id = userId;

			for(var i=0; i<ripples.length; i++)
			{
				var currentRipple = ripples[i];
				var miniRipple = new MiniRipple();

				miniRipple.set("sender", currentRipple.get("creator"));
				miniRipple.set("receiver", newUser);
				miniRipple.set("ripple", currentRipple);

				// make changes to ripples to add user to list
				currentRipple.addUnique("receiverIds", newUser.id);
				var relation = currentRipple.relation("receivers");
				relation.add(newUser);

				miniRippleArray.push(miniRipple);
			}

			// save all
			Parse.Object.saveAll(miniRippleArray,{
			    success: function(list)
			    {
			      response.success("saved getNearestRipplesOnFirstLoad");
			    },
			    error: function(error) 
			    {
			      // An error occurred while saving one of the objects.
			      response.error("failure on saving getNearestRipplesOnFirstLoad: " + error.code + " " + error.message);
			    },
			});
		},
		error: function(error)
		{
			console.log("error with making miniripples on first run: " + error);
		}
	});
});


Parse.Cloud.job("spreadNewRipples", function(request, status) 
{	
	// grab spreaders.
	var spreaderQuery = new Parse.Query(Parse.User);
	spreaderQuery.containedIn("objectId", SPREADER_ACCOUNTS);

	var spreaders = [];
	var miniRippleArray = [];
	var miniRippleIds = [];

	spreaderQuery.find().then(function(spreaderAccounts) { 
		spreaders = spreaderAccounts;

		// cutoff time
		var currentDate = Date.now();
		var timeInterval = 6 * 60 * 60 * 1000; // first number is hours to grab ripples from
		var cutoffDate = currentDate - timeInterval;
		cutoffDate = new Date(cutoffDate).toISOString();

		// grab all ripples that havent been spread in the last 12 hours
		var Ripple = Parse.Object.extend("Ripple");
		var rippleQuery = new Parse.Query(Ripple);
		rippleQuery.greaterThan("createdAt", {"__type":"Date","iso":cutoffDate});
		rippleQuery.equalTo("numPropagated",0);
		rippleQuery.notContainedIn("objectId",SPREADER_ACCOUNTS);
		rippleQuery.doesNotExist("killed");

		return rippleQuery.find();
	}).then(function(ripples) {

		console.log("number of ripples with 0 spreads in the last 6 hrs is " + ripples.length);

		for (var i=0; i<ripples.length; i++)
		{

			var ripple = ripples[i];
			var location = ripple.get("location");

			// find nearest accounts
			spreaders.sort(function(a,b){
				return ((Math.pow(a.get("location").latitude - ripple.get("startLocation").latitude,2) + Math.pow(a.get("location").longitude - ripple.get("startLocation").longitude,2)) - (Math.pow(b.get("location").latitude - ripple.get("startLocation").latitude,2) +	Math.pow(b.get("location").longitude - ripple.get("startLocation").longitude,2)))
			});

			var firstSpreader = spreaders[0];
			var secondSpreader = spreaders[1];

			// console.log("firstSpreader is " +firstSpreader.id + " and second spreader is "+ secondSpreader.id + " for ripple " + ripple.id);

			if (ripple.get("givenToSpreaderAccount") != true && ripple.get("killed") != true)
			{
				// create miniripples only if it hasn't been given to a spreader account
				var MiniRipple = Parse.Object.extend("MiniRipple");
				var miniRipple1 = new MiniRipple();
				var miniRipple2 = new MiniRipple();
				miniRipple1.set("receiver", firstSpreader);
				miniRipple2.set("receiver", secondSpreader);
				miniRipple1.set("ripple", ripple);
				miniRipple2.set("ripple", ripple);
				miniRipple1.set("sender", ripple.get("creator"));
				miniRipple2.set("sender", ripple.get("creator"));

				console.log("rippleId is " + ripple.id + "and creator is " + ripple.get("creator").id);

				miniRippleArray.push(miniRipple1);
				miniRippleArray.push(miniRipple2);
			}

		}

		// save all
		Parse.Object.saveAll(miniRippleArray,{
		    success: function(list)
		    {
		        status.success("created miniripples, stuuuupid!");
		    },
		    error: function(error) 
		    {	
		    	// An error occurred while saving one of the objects.
		    	status.error("ballsack. Failed to create miniripples for non-spread ripples: " + error.code + " " + error.message);
			}
		});
	});
});


/**********
FOR VERSION 5

ToDo:
- increase points on cloud
- check if we have leveled up
- if so, change level
- if so send push
- if so, change level
***********/
Parse.Cloud.define("dismissRipple", function(request, response) 
{
	var userId = request.user.id;

	// increment points. not calling increment points because we need to call success
	var userObject = new Parse.Query(Parse.User);
	userObject.get(userId).then(function(user) {
		// increment once because spread
		user.increment("score");
		levelCheck(user); 
			
		Parse.Cloud.useMasterKey();
		user.save();
	}).then(function() {
		response.success("gave point to dismiss zeh ripple");
	});
});

Parse.Cloud.define("dismissSwipeableRipple",function(request,response)
{
	// set ripple and user
	var user = request.user;
	var Ripple = Parse.Object.extend("Ripple");
	var ripple = new Ripple();
	ripple.id = request.params.rippleId;

	var hasMiniRipples = false;

	var MiniRipple = Parse.Object.extend("MiniRipple");
	var miniRippleQuery = new Parse.Query(MiniRipple);
	miniRippleQuery.equalTo("receiver",user);
	miniRippleQuery.equalTo("ripple", ripple);

	miniRippleQuery.first().then(function(miniRipple) {
		if (miniRipple)
		{
			hasMiniRipples = true;
			miniRipple.set("isPropagated",false);
			miniRipple.set("location",user.get("location"));
			response.success(miniRipple.save());	
		}

		var rippleQuery = new Parse.Query(Ripple);
		return rippleQuery.get(request.params.rippleId);
	}).then(function(rippleObject) {

		// update receiverIds
		//var relation = rippleObject.relation("receivers");
		var receiverIds = rippleObject.get("receiverIds");
		if (receiverIds.indexOf(user.id) == -1)
		{
			receiverIds.push(user.id);
			console.log("receiverIds are " + receiverIds);
			rippleObject.set("receiverIds",receiverIds);
			console.log("added to receiverIds");
			rippleObject.save();
		}

		console.log("we get to this point. creating miniripple" + rippleObject.id);

		var MiniRippleObject = Parse.Object.extend("MiniRipple");
		var newMiniRipple = new MiniRippleObject();
		newMiniRipple.set("ripple", rippleObject);
		newMiniRipple.set("sender", rippleObject.get("creator"));
		newMiniRipple.set("receiver", user);
		newMiniRipple.set("isPropagated",false);
		newMiniRipple.set("location",user.get("location"));

		console.log("saved miniripples " + rippleObject.id);

		//response.success(newMiniRipple.save());
		return newMiniRipple.save();
	}).then(function() {
	    // Set the job's success status
	    response.success("updated ripple and miniripple");
	  }, function(error) {
	    // Set the job's error status
	    response.error("Uh oh, something went wrong: " + error.code + " " + error.message);
	});
});

/**** RIPPLE V5********
* Spread ripple to people nearby
* and to people who are following you
**********************/
Parse.Cloud.define("spreadNearbyAndFollowers", function(request, response) 
{
	// Get ripple object
	var rippleId = request.params.rippleId;
	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);

	var MiniRipple = Parse.Object.extend("MiniRipple");
	var miniRippleQuery = new Parse.Query(MiniRipple);

	var ripple;
	var userList = [];

	rippleQuery.get(rippleId).then(function(rippleObject) {
		ripple = rippleObject;

		// grab correct location depending on inputs

		var userGeoPoint;
		if ("location" in request.params)
			userGeoPoint = request.params.location;
		else
			userGeoPoint = request.user.get("location");
		
		// Create a query for places
		var queryNearby = new Parse.Query(Parse.User);
		var following = request.user.get("following");

		if (!following)
			following = [];

		queryNearby.notEqualTo("following",request.user.id);
		queryNearby.notEqualTo("objectId",request.user.id);

		// Don't spread to inactive users
		queryNearby.equalTo("isActive", true);
		queryNearby.doesNotExist("isActive");

		// grab user reach, print console log for reference, and query for reach number
		// but first, we check if reachNumber is in params (sent from Instagram Script)
		var reachNumber;
		if ("reachNumber" in request.params)
			reachNumber = request.params.reachNumber;
		else
			reachNumber = Math.floor(request.user.get("reach"));

		if (Math.floor(reachNumber) < 18)
		{
			queryNearby.limit(reachNumber + 5);
		}

		else if(reachNumber <= 25)
		{
			queryNearby.limit(30);
		}	

		else
		{
			queryNearby.limit(reachNumber);
		}

		// Interested in locations near user.
		queryNearby.withinKilometers("location", userGeoPoint,20037);

		return queryNearby.find();

	}).then(function(nearbyList) {
		// add nearbylist to userList
		userList = userList.concat(nearbyList);

		// query followers of this person who arent in 
		var queryFollowers = new Parse.Query(Parse.User);
		queryFollowers.equalTo("following",request.user.id);
		queryFollowers.notEqualTo("objectId",request.user.id);

		return queryFollowers.find();

	}).then(function(followingList) {
		// add followingList to userList
		userList = userList.concat(followingList);

		console.log("userList now has length" + userList.length);


		// Create mini-ripples
		var MiniRipple = Parse.Object.extend("MiniRipple");
		var relation = ripple.relation("receivers");
		var receiverIds = ripple.get("receiverIds");
		var numPropagated = ripple.get("numPropagated");
		ripple.set("numPropagated", numPropagated + 1);


		// perform check to set user's highestPropagated
		// get user information 
		var originalSender = ripple.get("creator");
		var originalSenderId = originalSender.id;

		var receiverIdsPropagated = ripple.get("receiverIdsPropagated");
		if (receiverIdsPropagated == null)
		{
			receiverIdsPropagated = [];
		}


		// assign mini ripples to the correct people
		var usersWithMiniRipple = [];
		var promises =[];
		var pushToRecipients = [];

		var miniripples = [];
		for (var i = 0; i < userList.length; i++)
		{
			if (usersWithMiniRipple.indexOf(userList[i].id) != -1)
				continue;

			usersWithMiniRipple.push(userList[i].id);

			// Create mini-ripple
			var miniRipple = new MiniRipple();
			miniRipple.set("ripple", ripple);
			miniRipple.set("receiver", userList[i]);

			// if we have given to spreader account, show it breh
			if (SPREADER_ACCOUNTS.indexOf(userList[i].id) != -1);
				ripple.set("givenToSpreaderAccount",true);

			// if from instagram, create sender object. Else, use request.user
			if("userId" in request.params)
			{
				var UserClass = Parse.Object.extend("_User");
				instaUser = new UserClass();

				instaUser.id = request.params.userId;
				miniRipple.set("sender", instaUser);
			}
			else
				miniRipple.set("sender", request.user);


			miniripples.push(miniRipple);

			// Add users to receivers of ripple
			relation.add(userList[i]);
			receiverIds.push(userList[i].id);

			// increment push notifications number, and only add to array if it equals 0 or %5 = 0
			/*
			userList[i].increment("notificationsToday");
			var notificationsToday = userList[i].get("notificationsToday");
			*/

			// see if user wasn't created in last hour
			/*
			var currentDate = Date.now();
			var timeDelta = 3600000 * 2; //last number is number of hours
			var cutoffDate = new Date(currentDate - (timeDelta));

			var recentlyCreated = false;

			if (Math.floor(userList[i].createdAt.getTime()) > Math.floor(cutoffDate.getTime()))
			{
				recentlyCreated = true;
			}

			if(notificationsToday == 15 && !recentlyCreated)
			{
				pushToRecipients.push(userList[i]);
				//console.log("userList[i] objectId is " + userList[i].id);
			}


			// add all to list so we can increment notification counter
			Parse.Cloud.useMasterKey();
			promises.push(
				userList[i].save(null, {
					success: function(contract) {
						// console.log("increment notificationsToday");
					},
					error: function(error) {
						console.log("failed to increment notificationsToday: "+ error.code);
					}
				})
			);
			*/
		}

		ripple.set("receiverIds", receiverIds);
		promises.push(ripple.save());

		promises.push(
			Parse.Object.saveAll(miniripples,{
				success: function(miniRipplesSaved)
				{
					//noop
				},
				error: function(error) {
					console.log("failed to save all miniripples: " + error.code);
				}
			})
		);

		

		/*
		// Push ripple to receivers
		var pushQuery = new Parse.Query(Parse.Installation);
		pushQuery.containedIn('user', pushToRecipients);
		
		promises.push(								 
			Parse.Push.send({
			  where: pushQuery, // Set our Installation query
			  data: {
			  	alert: "You have new ripples",
			  	//alert: "New ripple: " + stringToPush,
			  	"goTo" : "PropagateRippleTableViewController"
			  }
			})
		);
		*/

		Parse.Cloud.useMasterKey();
		return Parse.Promise.when(promises);
	}).then(function() {
		response.success("Success");
	});
});

Parse.Cloud.define("spreadSwipeableRipple", function(request, response) 
{
	// set ripple and user
	var user = request.user;
	var Ripple = Parse.Object.extend("Ripple");
	var ripple = new Ripple();
	ripple.id = request.params.rippleId;

	var hasMiniRipples = false;

	var MiniRipple = Parse.Object.extend("MiniRipple");
	var miniRippleQuery = new Parse.Query(MiniRipple);
	miniRippleQuery.equalTo("receiver",user);
	miniRippleQuery.equalTo("ripple", ripple);

	miniRippleQuery.first().then(function(miniRipple) {
		if (miniRipple)
		{
			hasMiniRipples = true;
			miniRipple.set("isPropagated",true);
			miniRipple.set("location",user.get("location"));	
			miniRipple.save();
		}

		var rippleQuery = new Parse.Query(Ripple);
		return rippleQuery.get(request.params.rippleId);
	}).then(function(rippleObject) {

		console.log("DOWEGETHERE? rippleId is: " + rippleObject.id);

		// update receiverIds
		//var relation = rippleObject.relation("receivers");
		var receiverIds = rippleObject.get("receiverIds");
		var receiverIdsPropagated = rippleObject.get("receiverIdsPropagated");
		if (receiverIds.indexOf(user.id) == -1)
		{
			receiverIds.push(user.id);
			console.log("receiverIds are " + receiverIds);
			rippleObject.set("receiverIds",receiverIds);
			console.log("added to receiverIds");
			rippleObject.save();
		}

		console.log("we get to this point. creating miniripple" + rippleObject.id);

		if (!hasMiniRipples)
		{
			var MiniRippleObject = Parse.Object.extend("MiniRipple");
			var newMiniRipple = new MiniRippleObject();
			newMiniRipple.set("ripple", rippleObject);
			newMiniRipple.set("sender", rippleObject.get("creator"));
			newMiniRipple.set("receiver", user);
			newMiniRipple.set("isPropagated",true);
			newMiniRipple.set("location",user.get("location"));

			console.log("saved miniripples " + rippleObject.id);
			return newMiniRipple.save();
		}		
	}).then(function() {
	    // Set the job's success status
	    response.success("updated ripple and miniripple");
	  }, function(error) {
	    // Set the job's error status
	    response.error("Uh oh, something went wrong: " + error.code + " " + error.message);
	});
});

Parse.Cloud.define("spreadRippleTEST", function(request, response) 
{
	// Get ripple object
	var rippleId = request.params.rippleId;
	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);

	var MiniRipple = Parse.Object.extend("MiniRipple");
	var miniRippleQuery = new Parse.Query(MiniRipple);

	var ripple;

	rippleQuery.get(rippleId).then(function(rippleObject) {

		ripple = rippleObject;

		// grab correct location depending on inputs

		var userGeoPoint;
		if ("location" in request.params)
			userGeoPoint = request.params.location;
		else
			userGeoPoint = request.user.get("location");
		
		// Create a query for places
		var query = new Parse.Query(Parse.User);
		var receiverIds = ripple.get("receiverIds");
		receiverIds.push(request.user.id);

		query.notContainedIn("objectId", receiverIds);

		// Don't spread to inactive users
		query.equalTo("isActive", true);
		query.exists("isActive");

		// grab user reach, print console log for reference, and query for reach number
		// but first, we check if reachNumber is in params (sent from Instagram Script)
		var reachNumber;
		if ("reachNumber" in request.params)
			reachNumber = request.params.reachNumber;
		else
			reachNumber = Math.floor(request.user.get("reach"));

		if (Math.floor(reachNumber) < 18)
		{
			query.limit(reachNumber + 5);
		}

		else if(reachNumber <= 25)
		{
			query.limit(30);
		}	

		else
		{
			query.limit(reachNumber);
		}

		// Interested in locations near user.
		query.withinKilometers("location", userGeoPoint,20037);
		
		return query.find();
	}).then(function(userList) {

		// Create mini-ripples
		// userList.push(request.user);
		var MiniRipple = Parse.Object.extend("MiniRipple");
		var miniRipple;
		var relation = ripple.relation("receivers");
		var receiverIds = ripple.get("receiverIds");
		var numPropagated = ripple.get("numPropagated");
		ripple.set("numPropagated", numPropagated + 1);

		// get user information 
		var originalSender = ripple.get("creator");
		var originalSenderId = originalSender.id;

		var receiverIdsPropagated = ripple.get("receiverIdsPropagated");
		if (receiverIdsPropagated == null)
		{
			receiverIdsPropagated = [];
		}

		// make sure we call this if not running from Instagram Script
		if (!("userId" in request.params) && (originalSenderId != request.user.id))
		{
			receiverIdsPropagated.push(request.user.id);
			ripple.set("receiverIdsPropagated", receiverIdsPropagated);

			// call function to increment user points
			incrementPointsOnSpread(originalSenderId, request.user.id, ripple);
			sendRipplePush(ripple);
		}


		// assign mini ripples to the correct people
		var miniRipples = [];
		var promises =[];
		var pushToRecipients = [];
		for (var i = 0; i < userList.length; i++)
		{
			// Create mini-ripple
			miniRipple = new MiniRipple();
			miniRipple.set("ripple", ripple);
			miniRipple.set("receiver", userList[i]);

			// if we have given to spreader account, show it breh
			if (SPREADER_ACCOUNTS.indexOf(userList[i].id) != -1);
				ripple.set("givenToSpreaderAccount",true);

			// if from instagram, create sender object. Else, use request.user
			if("userId" in request.params)
			{
				var UserClass = Parse.Object.extend("_User");
				instaUser = new UserClass();

				instaUser.id = request.params.userId;
				miniRipple.set("sender", instaUser);
			}
			else
				miniRipple.set("sender", request.user);

			miniRipples.push(miniRipple);
			//promises.push(miniRipple.save());

			// Add users to receivers of ripple
			relation.add(userList[i]);
			receiverIds.push(userList[i].id);

			// increment push notifications number, and only add to array if it equals 0 or %5 = 0
			//userList[i].increment("notificationsToday");
			
			//var notificationsToday = userList[i].get("notificationsToday");


			// see if user wasn't created in last hour
			/*
			var currentDate = Date.now();
			var timeDelta = 3600000 * 2; //last number is number of hours
			var cutoffDate = new Date(currentDate - (timeDelta));

			var recentlyCreated = false;

			if (Math.floor(userList[i].createdAt.getTime()) > Math.floor(cutoffDate.getTime()))
			{
				recentlyCreated = true;
			}

			if(notificationsToday == 15 && !recentlyCreated)
			{
				pushToRecipients.push(userList[i]);
				//console.log("userList[i] objectId is " + userList[i].id);
			}
			*/
		}

		ripple.set("receiverIds", receiverIds);

			// push saveAlls to promises
			/*Parse.Cloud.useMasterKey();
			promises.push(
				Parse.Object.saveAll(userList,{
		    		success: function(userListSaved)
		    		{
		    			//noop
		    		},
					error: function(error) {
						console.log("failed to increment notificationsToday: "+ error.code);
					}
				})
			);*/

			promises.push(ripple.save());

			promises.push(
				Parse.Object.saveAll(miniRipples,{
					success: function(miniRipplesSaved)
					{
						// noop
					},
					error: function(error) {
						console.log("failed to save all miniripples: " + error.code);
					}
				})
			);


		/*
		// Push ripple to receivers
		var pushQuery = new Parse.Query(Parse.Installation);

		if (pushToRecipients.length >0);
		{
			pushQuery.containedIn('user', pushToRecipients);
		
			promises.push(								 
				Parse.Push.send({
				  where: pushQuery, // Set our Installation query
				  data: {
				  	alert: "You have new ripples",
				  	//alert: "New ripple: " + stringToPush,
				  	"goTo" : "PropagateRippleTableViewController"
				  }
				})
			);
		}
			*/

		Parse.Cloud.useMasterKey();
		return Parse.Promise.when(promises);
	}).then(function() {
		response.success("Success");
	});
});



Parse.Cloud.define("spreadRipple", function(request, response) 
{
	// Get ripple object
	var rippleId = request.params.rippleId;
	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);

	var miniRippleId = request.params.miniRippleId;
	var MiniRipple = Parse.Object.extend("MiniRipple");
	var miniRippleQuery = new Parse.Query(MiniRipple);

	var ripple;

	rippleQuery.get(rippleId).then(function(rippleObject) {

		ripple = rippleObject;

		// grab correct location depending on inputs

		var userGeoPoint;
		if ("location" in request.params)
			userGeoPoint = request.params.location;
		else
			userGeoPoint = request.user.get("location");
		
		// Create a query for places
		var query = new Parse.Query(Parse.User);
		var receiverIds = ripple.get("receiverIds");
		receiverIds.push(request.user.id);

		query.notContainedIn("objectId", receiverIds);

		// Don't spread to inactive users
		query.equalTo("isActive", true);
		query.exists("isActive");

		// grab user reach, print console log for reference, and query for reach number
		// but first, we check if reachNumber is in params (sent from Instagram Script)
		var reachNumber;
		if ("reachNumber" in request.params)
			reachNumber = request.params.reachNumber;
		else
			reachNumber = Math.floor(request.user.get("reach"));

		if (Math.floor(reachNumber) < 18)
		{
			query.limit(reachNumber + 5);
		}

		else if(reachNumber <= 25)
		{
			query.limit(30);
		}	

		else
		{
			query.limit(reachNumber);
		}

		// Interested in locations near user.
		query.withinKilometers("location", userGeoPoint,20037);
		
		return query.find();
	}).then(function(userList) {

		// Create mini-ripples
		// userList.push(request.user);
		var MiniRipple = Parse.Object.extend("MiniRipple");
		var miniRipple;
		var relation = ripple.relation("receivers");
		var receiverIds = ripple.get("receiverIds");
		var numPropagated = ripple.get("numPropagated");
		ripple.set("numPropagated", numPropagated + 1);

		// get user information 
		var originalSender = ripple.get("creator");
		var originalSenderId = originalSender.id;

		var receiverIdsPropagated = ripple.get("receiverIdsPropagated");
		if (receiverIdsPropagated == null)
		{
			receiverIdsPropagated = [];
		}

		// make sure we call this if not running from Instagram Script
		if (!("userId" in request.params) && (originalSenderId != request.user.id))
		{
			receiverIdsPropagated.push(request.user.id);
			ripple.set("receiverIdsPropagated", receiverIdsPropagated);

			// call function to increment user points
			incrementPointsOnSpread(originalSenderId, request.user.id, ripple);
			sendRipplePush(ripple);
		}


		// assign mini ripples to the correct people
		var miniRipples = [];
		var promises =[];
		var pushToRecipients = [];
		for (var i = 0; i < userList.length; i++)
		{
			// Create mini-ripple
			miniRipple = new MiniRipple();
			miniRipple.set("ripple", ripple);
			miniRipple.set("receiver", userList[i]);

			// if we have given to spreader account, show it breh
			if (SPREADER_ACCOUNTS.indexOf(userList[i].id) != -1);
				ripple.set("givenToSpreaderAccount",true);

			// if from instagram, create sender object. Else, use request.user
			if("userId" in request.params)
			{
				var UserClass = Parse.Object.extend("_User");
				instaUser = new UserClass();

				instaUser.id = request.params.userId;
				miniRipple.set("sender", instaUser);
			}
			else
				miniRipple.set("sender", request.user);

			miniRipples.push(miniRipple);
			//promises.push(miniRipple.save());

			// Add users to receivers of ripple
			relation.add(userList[i]);
			receiverIds.push(userList[i].id);

			// increment push notifications number, and only add to array if it equals 0 or %5 = 0
			//userList[i].increment("notificationsToday");
			
			//var notificationsToday = userList[i].get("notificationsToday");


			// see if user wasn't created in last hour
			/*
			var currentDate = Date.now();
			var timeDelta = 3600000 * 2; //last number is number of hours
			var cutoffDate = new Date(currentDate - (timeDelta));

			var recentlyCreated = false;

			if (Math.floor(userList[i].createdAt.getTime()) > Math.floor(cutoffDate.getTime()))
			{
				recentlyCreated = true;
			}

			if(notificationsToday == 15 && !recentlyCreated)
			{
				pushToRecipients.push(userList[i]);
				//console.log("userList[i] objectId is " + userList[i].id);
			}
			*/
		}


			// push saveAlls to promises
			/*Parse.Cloud.useMasterKey();
			promises.push(
				Parse.Object.saveAll(userList,{
		    		success: function(userListSaved)
		    		{
		    			//noop
		    		},
					error: function(error) {
						console.log("failed to increment notificationsToday: "+ error.code);
					}
				})
			);*/

		ripple.set("receiverIds", receiverIds);

		promises.push(ripple.save());

		promises.push(
			Parse.Object.saveAll(miniRipples,{
				success: function(miniRipplesSaved)
				{
					//noop 
				},
				error: function(error) {
					console.log("failed to save all miniripples: " + error.code);
				}
			})
		);

		

		/*

		// Push ripple to receivers
		var pushQuery = new Parse.Query(Parse.Installation);

		if (pushToRecipients.length >0);
		{
			pushQuery.containedIn('user', pushToRecipients);
		
			promises.push(								 
				Parse.Push.send({
				  where: pushQuery, // Set our Installation query
				  data: {
				  	alert: "You have new ripples",
				  	//alert: "New ripple: " + stringToPush,
				  	"goTo" : "PropagateRippleTableViewController"
				  }
				})
			);
		}
		
		*/

		//Parse.Cloud.useMasterKey();
		return Parse.Promise.when(promises);
	}).then(function() {
		response.success("Success");
	});
/*
	// Get ripple object
	var rippleId = request.params.rippleId;
	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);

	var MiniRipple = Parse.Object.extend("MiniRipple");
	var miniRippleQuery = new Parse.Query(MiniRipple);

	var ripple;

	rippleQuery.get(rippleId).then(function(rippleObject) {

		ripple = rippleObject;

		// grab correct location depending on inputs

		var userGeoPoint;
		if ("location" in request.params)
			userGeoPoint = request.params.location;
		else
			userGeoPoint = request.user.get("location");
		
		// Create a query for places
		var query = new Parse.Query(Parse.User);
		var receiverIds = ripple.get("receiverIds");
		query.notContainedIn("objectId", receiverIds);
		query.notEqualTo("objectId",request.user.id);

		// Interested in locations near user.
		query.withinKilometers("location", userGeoPoint,20037);

		// Don't spread to inactive users
		query.notEqualTo("isActive", false);

		// grab user reach, print console log for reference, and query for reach number
		// but first, we check if reachNumber is in params (sent from Instagram Script)
		var reachNumber;
		if ("reachNumber" in request.params)
			reachNumber = request.params.reachNumber;
		else
			reachNumber = Math.floor(request.user.get("reach"));

		if (Math.floor(reachNumber) < 18)
		{
			query.limit(reachNumber + 5);
		}

		else if(reachNumber <= 25)
		{
			query.limit(30);
		}	

		else
		{
			query.limit(reachNumber);
		}

		
		return query.find();
	}).then(function(userList) {

		// Create mini-ripples
		// userList.push(request.user);
		var MiniRipple = Parse.Object.extend("MiniRipple");
		var miniRipple;
		var relation = ripple.relation("receivers");
		var receiverIds = ripple.get("receiverIds");
		var numPropagated = ripple.get("numPropagated");
		ripple.set("numPropagated", numPropagated + 1);


		// perform check to set user's highestPropagated
		// get user information 
		var originalSender = ripple.get("creator");
		var originalSenderId = originalSender.id;

		var receiverIdsPropagated = ripple.get("receiverIdsPropagated");
		if (receiverIdsPropagated == null)
		{
			receiverIdsPropagated = [];
		}

		// make sure we call this if not running from Instagram Script
		if (!("userId" in request.params) && (originalSenderId != request.user.id))
		{
			receiverIdsPropagated.push(request.user.id);
			ripple.set("receiverIdsPropagated", receiverIdsPropagated);

			// call function to increment user points
			incrementPointsOnSpread(originalSenderId, request.user.id, ripple);
			sendRipplePush(ripple);
		}


		// assign mini ripples to the correct people
		var promises =[];
		var pushToRecipients = [];
		for (var i = 0; i < userList.length; i++)
		{
			// Create mini-ripple
			miniRipple = new MiniRipple();
			miniRipple.set("ripple", ripple);
			miniRipple.set("receiver", userList[i]);

			// if we have given to spreader account, show it breh
			if (SPREADER_ACCOUNTS.indexOf(userList[i].id) != -1);
				ripple.set("givenToSpreaderAccount",true);

			// if from instagram, create sender object. Else, use request.user
			if("userId" in request.params)
			{
				var UserClass = Parse.Object.extend("_User");
				instaUser = new UserClass();

				instaUser.id = request.params.userId;
				miniRipple.set("sender", instaUser);
			}
			else
				miniRipple.set("sender", request.user);


			promises.push(miniRipple.save());

			// Add users to receivers of ripple
			relation.add(userList[i]);
			receiverIds.push(userList[i].id);

			// increment push notifications number, and only add to array if it equals 0 or %5 = 0
			userList[i].increment("notificationsToday");
			
			var notificationsToday = userList[i].get("notificationsToday");


			// see if user wasn't created in last hour
			var currentDate = Date.now();
			var timeDelta = 3600000 * 2; //last number is number of hours
			var cutoffDate = new Date(currentDate - (timeDelta));

			var recentlyCreated = false;

			if (Math.floor(userList[i].createdAt.getTime()) > Math.floor(cutoffDate.getTime()))
			{
				recentlyCreated = true;
			}

			if(notificationsToday == 15 && !recentlyCreated)
			{
				pushToRecipients.push(userList[i]);
				//console.log("userList[i] objectId is " + userList[i].id);
			}


			// add all to list so we can increment notification counter
			Parse.Cloud.useMasterKey();
			promises.push(
				userList[i].save(null, {
					success: function(contract) {
						// console.log("increment notificationsToday");
					},
					error: function(error) {
						console.log("failed to increment notificationsToday: "+ error.code);
					}
				})
			);
		}

		promises.push(ripple.save());

		// Push ripple to receivers
		var pushQuery = new Parse.Query(Parse.Installation);
		pushQuery.containedIn('user', pushToRecipients);
		
		promises.push(								 
			Parse.Push.send({
			  where: pushQuery, // Set our Installation query
			  data: {
			  	alert: "You have new ripples",
			  	//alert: "New ripple: " + stringToPush,
			  	"goTo" : "PropagateRippleTableViewController"
			  }
			})
		);

		Parse.Cloud.useMasterKey();
		return Parse.Promise.when(promises);
	}).then(function() {
		response.success("Success");
	});
*/
});


function incrementPointsOnSpread(originalSenderId, spreadUserId, ripple)
{
	// grab user object
	var originalUserObject = new Parse.Query(Parse.User);


	// declaring array of people we wanted to push to
	var userNotifications = [];

	originalUserObject.get(originalSenderId, {
		success: function(user)
		{
			// increment once because spread
			user.increment("score");
			levelCheck(user); 
				

			// check if numPropagated is greater than highestpropagated
			if (ripple.get("numPropagated") > Math.floor(user.get("highestPropagated")))
			{
				user.set("highestPropagated", ripple.get("numPropagated"));
			}			


			Parse.Cloud.useMasterKey();
			user.save();
		},
		error: function(error)
		{
			console.log( "error getting originalSender: " + error.code);
		}
	});


	incrementPoints(spreadUserId, 1);
}

function incrementPoints (spreadUserId, points)
{
	var spreadUserObject = new Parse.Query(Parse.User);
	// console.log("increment points for " + spreadUserId + "with " + points + " points");
	spreadUserObject.get(spreadUserId, {
		success: function(user)
		{
			// increment once because spread
			user.set("score", user.get("score") + points);
			levelCheck(user); 
				
			Parse.Cloud.useMasterKey();
			user.save();
		},
		error: function(error)
		{
				console.log("error getting originalSender: " + error.message);
		}
	});
}


function levelCheck(user)
{
	// check if we have leveled up
	var currentReach = user.get("reachLevel");
	var score =Math.floor(user.get("score"));

	for(var i=0; i<NETWORK_SCORE_CUTOFFS.length; i++)
	{
		if (score < NETWORK_SCORE_CUTOFFS[i])
		{

			// if the current networks Score doesn't equate to their current reach level, change
			if (NETWORK_SCORE_CUTOFFS[i - 1])
			{
				if (CUTOFF_LEVELS[NETWORK_SCORE_CUTOFFS[i-1]]["level"] != currentReach)
				{

					// update and send push notification if there is a next level
					user.set("reachLevel", CUTOFF_LEVELS[NETWORK_SCORE_CUTOFFS[i - 1]]["level"]);
					user.set("reach", CUTOFF_LEVELS[NETWORK_SCORE_CUTOFFS[i - 1]]["reach"]);
					user.save();

					// send a push to the initial user
					var reachIncreasePush = new Parse.Query(Parse.Installation);
					reachIncreasePush.equalTo('user', user);							 
					Parse.Push.send({
					  where: reachIncreasePush, // Set our Installation query
					  data: {
					  	alert: "You've leveled up! Your ripples now spread to " + CUTOFF_LEVELS[NETWORK_SCORE_CUTOFFS[i - 1]]["reach"] + " people",
					  	"goTo" : "MyRipplesViewController"
					  }
					});

					// create notification for user
					var Notification = Parse.Object.extend("Notification");
					var notification = new Notification();
					notification.set("user", user);
					notification.set("text", "You've leveled up! Your ripples now spread to " + CUTOFF_LEVELS[NETWORK_SCORE_CUTOFFS[i - 1]]["reach"] + " people");
					notification.set("isRead", false);
					notification.set("isSeen", false);
					notification.set("type", "User");
					notification.save();
				}
			}
			break;
		}
	}
}

function sendRipplePush(ripple)
{
	var newNumPropagated = Math.floor(ripple.get("numPropagated"));
	var user = ripple.get("creator");

	// check if we push notification about Ripple
	if (MILESTONE_RIPPLE_ARRAY[newNumPropagated]) 
	{
		var pushToOriginator = new Parse.Query(Parse.Installation);
		pushToOriginator.equalTo('user', user);							 
		Parse.Push.send({
		  where: pushToOriginator, // Set our Installation query
		  data: {
		  	alert: "A ripple of yours has been spread " + newNumPropagated + " times",
		  	badge: "Increment",
		  	"rippleId" : ripple.id
		  }
		});

		// Create a notification
		var Notification = Parse.Object.extend("Notification");
		var notification = new Notification();
		notification.set("user", user);
		notification.set("text", "A ripple of yours has been spread " + newNumPropagated + " times");
		notification.set("isRead", false);
		notification.set("isSeen", false);
		notification.set("type", "Ripple");
		notification.set("rippleId", ripple.id);
		notification.save();
	}
}



/**********DEPRECATED*********************DEPRECATED*********************DEPRECATED*********************DEPRECATED***********
/**********DEPRECATED*********************DEPRECATED*********************DEPRECATED*********************DEPRECATED***********
/**********DEPRECATED*********************DEPRECATED*********************DEPRECATED*********************DEPRECATED***********/
Parse.Cloud.define("propagateRipple", function(request, response) 
{
	// Get ripple object
	var rippleId = request.params.rippleId;
	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);

	var miniRippleId = request.params.miniRippleId;
	var MiniRipple = Parse.Object.extend("MiniRipple");
	var miniRippleQuery = new Parse.Query(MiniRipple);

	var ripple;

	rippleQuery.get(rippleId).then(function(rippleObject) {

		ripple = rippleObject;
		// Choose which people the ripple goes to
		var userGeoPoint = request.user.get("location");
		// Create a query for places
		var query = new Parse.Query(Parse.User);
		var receiverIds = ripple.get("receiverIds");

		query.notContainedIn("objectId", receiverIds);

		// Interested in locations near user.
		query.withinKilometers("location", userGeoPoint,20037);

		// Don't spread to inactive users
		query.notEqualTo("isActive", false);

		// grab user reach, print console log for reference, and query for reach number
		var reachNumber = Math.floor(request.user.get("reach"));

		if (Math.floor(reachNumber) < 12)
		{
			query.limit(reachNumber + 10);
		}

		else if(reachNumber <= 25)
		{
			query.limit(28);
		}	

		else
		{
			query.limit(reachNumber);
		}

		return query.find();
	}).then(function(userList) {

		// Create mini-ripples
		// userList.push(request.user);
		var MiniRipple = Parse.Object.extend("MiniRipple");
		var miniRipple;
		var relation = ripple.relation("receivers");
		var receiverIds = ripple.get("receiverIds");
		var numPropagated = ripple.get("numPropagated");
		ripple.set("numPropagated", numPropagated + 1);


		// perform check to set user's highestPropagated
		// get user information 
		var originalSender = ripple.get("creator");
		var originalSenderId = originalSender.id;

		var receiverIdsPropagated = ripple.get("receiverIdsPropagated");
		if (receiverIdsPropagated == null)
		{
			receiverIdsPropagated = [];
		}
		if (originalSenderId != request.user.id)
		{
			receiverIdsPropagated.push(request.user.id);
			ripple.set("receiverIdsPropagated", receiverIdsPropagated);
		}

		// grab user object
		var originalSenderObject = new Parse.Query(Parse.User);

		// declaring array of people we wanted to push to
		var userNotifications = [];

		originalSenderObject.get(originalSenderId, {
			success: function(user)
			{
				var newNumPropagated = Math.floor(ripple.get("numPropagated"));
				var currentReach = user.get("reachLevel");
				var score;

				if ((MILESTONE_RIPPLE_ARRAY[newNumPropagated]) 
					&& ((Math.floor(user.get("highestPropagated")) < newNumPropagated) || (newNumPropagated >= MINIMUM_PROPAGATIONS_FOR_FUTURE)))
				{
					// Increase the network score
					score = user.get("score");
					var incrementNum = Math.floor(MILESTONE_RIPPLE_ARRAY[newNumPropagated]);
					score = Math.floor(score + incrementNum);
					user.set("score", score); // there is a save later

					/*
					var stringToPush = ripple.get("text");
					if (stringToPush.length > 15)
						stringToPush = stringToPush.substring(0,13) + "...";
					*/
					var pushToOriginator = new Parse.Query(Parse.Installation);
					pushToOriginator.equalTo('user', user);							 
					Parse.Push.send({
					  where: pushToOriginator, // Set our Installation query
					  data: {
					  	alert: "A ripple of yours has been spread " + newNumPropagated + " times",
					  	badge: "Increment",
					  	"rippleId" : ripple.id
					  }
					});

					// Create a notification
					var Notification = Parse.Object.extend("Notification");
					var notification = new Notification();
					notification.set("user", user);
					notification.set("text", "A ripple of yours has been spread " + newNumPropagated + " times");
					notification.set("isRead", false);
					notification.set("isSeen", false);
					notification.set("type", "Ripple");
					notification.set("rippleId", ripple.id);
					notification.save();
				
					// perform check to see if we update user reachLevel
					for(var i=0; i<NETWORK_SCORE_CUTOFFS.length; i++)
					{
						if (score < NETWORK_SCORE_CUTOFFS[i])
						{
							// if the current networks Score doesn't equate to their current reach level, change
							if (NETWORK_SCORE_CUTOFFS[i - 1])
							{
								if (CUTOFF_LEVELS[NETWORK_SCORE_CUTOFFS[i-1]]["level"] != currentReach)
								{
									// update and send push notification if there is a next level
									user.set("reachLevel", CUTOFF_LEVELS[NETWORK_SCORE_CUTOFFS[i - 1]]["level"]);
									user.set("reach", CUTOFF_LEVELS[NETWORK_SCORE_CUTOFFS[i - 1]]["reach"]);
									// send a push to the initial user
									var reachIncreasePush = new Parse.Query(Parse.Installation);
									reachIncreasePush.equalTo('user', user);							 
									Parse.Push.send({
									  where: reachIncreasePush, // Set our Installation query
									  data: {
									  	alert: "You've leveled up! Your ripples now spread to " + CUTOFF_LEVELS[NETWORK_SCORE_CUTOFFS[i - 1]]["reach"] + " people",
									  	"goTo" : "MyRipplesViewController"
									  }
									});


									console.log("sent push to original poster to share update in reach level");

									// create notification for user
									var Notification = Parse.Object.extend("Notification");
									var notification = new Notification();
									notification.set("user", user);
									notification.set("text", "You've leveled up! Your ripples now spread to " + CUTOFF_LEVELS[NETWORK_SCORE_CUTOFFS[i - 1]]["reach"] + " people");
									notification.set("isRead", false);
									notification.set("isSeen", false);
									notification.set("type", "User");
									notification.save();
								}
							}
							break;
						}
					}
					Parse.Cloud.useMasterKey();
					user.save();
				}

				console.log("we have received user object to check highestpropagated. highest is " + user.get("highestPropagated") + " and numProp is " + ripple.get("numPropagated"));
				var highestPropagated = user.get("highestPropagated");

				// check if numPropagated is greater than highestpropagated
				if (ripple.get("numPropagated") > highestPropagated)
				{
					Parse.Cloud.useMasterKey();
					console.log("updated highestPropagated to " + ripple.get("numPropagated"));
					user.set("highestPropagated", ripple.get("numPropagated"));
					user.save();
				}
			},
			error: function(error)
			{
					console.log( "error getting originalSender: " + error.message);
			}
		});

		// assign mini ripples to the correct people
		var promises =[];
		var pushToRecipients = [];

		console.log("userlist has length " +  userList.length);
		for (var i = 0; i < userList.length; i++)
		{
			// Create mini-ripple
			miniRipple = new MiniRipple();
			miniRipple.set("ripple", ripple);
			miniRipple.set("sender", request.user);
			miniRipple.set("receiver", userList[i]);
			// miniRipple.set("isPropagated", false);

			promises.push(miniRipple.save());

			// Add users to receivers of ripple
			relation.add(userList[i]);
			receiverIds.push(userList[i].id);

			// increment push notifications number, and only add to array if it equals 0 or %5 = 0
			userList[i].increment("notificationsToday");
			
			var notificationsToday = userList[i].get("notificationsToday");
			if(notificationsToday == 15)
			{
				pushToRecipients.push(userList[i]);
			}
			// add all to list so we can increment notification counter
			Parse.Cloud.useMasterKey();
			promises.push(
				userList[i].save(null, {
					success: function(contract) {
						//console.log("increment notificationsToday");
					},
					error: function(error) {
						console.log("failed to increment notificationsToday: "+ error.code);
					}
				})
			);
		}

		promises.push(ripple.save());

		// Push ripple to receivers
		var pushQuery = new Parse.Query(Parse.Installation);
		pushQuery.containedIn('user', pushToRecipients);
		//pushQuery.containedIn('user', userList);
		
		promises.push(								 
			Parse.Push.send({
			  where: pushQuery, // Set our Installation query
			  data: {
			  	alert: "You have new ripples",
			  	//alert: "New ripple: " + stringToPush,
			  	"goTo" : "PropagateRippleTableViewController"
			  }
			})
		);

		Parse.Cloud.useMasterKey();
		return Parse.Promise.when(promises);
	}).then(function() {
		response.success("Success");
	});
});