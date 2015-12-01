Parse.Cloud.job("clearDailyNotifications", function(request, status) 
{
	// Set up to modify user data
  	Parse.Cloud.useMasterKey();

	// query for all pending snipes
	var userQuery = new Parse.Query(Parse.User);

	userQuery.each(function(user)
	{
		user.set("notificationsToday", 0);

		return user.save();
  	}).then(function() {
	    // Set the job's success status
	    status.success("set all notification counts to 0.");
	  }, function(error) {
	    // Set the job's error status
	    status.error("Uh oh, something went wrong in setting accounts to 0.");
	});
});



Parse.Cloud.job("markInactiveUsers", function(request, status)
{
	Parse.Cloud.useMasterKey();

	var userQuery = new Parse.Query(Parse.User);
	var active = 0;
	var inactive = 0;

	//current time and cutoff Date
	var currentDateCreate = Date.now();
	var timeDeltaCreate = 3600 * 1000 * 336; //last number is number of hours
	var cutoffDateCreate = new Date(currentDateCreate - (timeDeltaCreate));

	userQuery.lessThan("createdAt", cutoffDateCreate);

	userQuery.each(function(user)
	{
		var MiniRipple = Parse.Object.extend("MiniRipple");
		var miniRippleQuery = new Parse.Query(MiniRipple);
		miniRippleQuery.exists("isPropagated");

		//current time and cutoff Date
		var currentDate = Date.now();
		var timeDelta = 3600 * 1000 * 336; //last number is number of hours
		var cutoffDate = new Date(currentDate - (timeDelta));

		miniRippleQuery.greaterThan("createdAt", cutoffDate);
		miniRippleQuery.equalTo("sender", user);

		return miniRippleQuery.first(
		{
			success: function(object) {
				if (object != undefined)
				{
					active = active + 1;
					user.set("isActive", true);
					user.save();
				}
				else
				{
					inactive = inactive + 1;
					user.set("isActive", false);
					user.save();
				}
			},
			error: function(error) {
				alert("error: " + error.message);
			}
		});
	}).then(function() {
		console.log("active: " + active);
		console.log("inactive: " + inactive);

		status.success("completed job");
	});	
});

/*******
	Parse Job to send emails to new users
********/
Parse.Cloud.job("sendAPush", function(request, status) 
{
	var users = ["f7vVRRWbe6"];//"1GDu999jAB","VMmbmvGgGu","8J9yIN73sE","bFzm0pTt7U","gvGvtKN3cx","GiZXxqcwGh","lVKwkO5FN7","2p4ui0ZoH3","EpnYUvielv","ffzWOQhFjM","1eVWlYoLv8","zsNSRfXaND"];
	var userObjects = [];

	// add to userObjects list
	for(var i=0; i<users.length; i++)
	{
		var user = new Parse.User();
		user.id = users[i];

		userObjects.push(user);
	}

	var pushQuery = new Parse.Query(Parse.Installation);
	pushQuery.containedIn('user', userObjects);

	// push it
	Parse.Push.send({
	  where: pushQuery, // Set our Installation query
	  data: {
	  	alert: "We featured you in our latest blog post! Check it out",
	  	"rippleId" : "AiHxla4R9Y"
	  }
	});

	status.success("sent pushQueryToSender");
});


/************DEPRECATED*****************//************DEPRECATED*****************/
/************DEPRECATED*****************//************DEPRECATED*****************/
/************DEPRECATED*****************//************DEPRECATED*****************/
Parse.Cloud.job("clearAnonymousWithNoInstallation", function(request, status) 
{
	var anonymousUsers = [];

	// Set up to modify user data
  	Parse.Cloud.useMasterKey();

	// query for all pending snipes
	var userQuery = new Parse.Query(Parse.User);
	

	userQuery.each(function(user)
	{
		//console.log(user.get("authData"));
		if (user.get("authData") && "anonymous" in user.get("authData"))
		{	
			anonymousUsers.push(user);
		}
	}).then(function() {

		var findInstallation = new Parse.Query(Parse.Installation);
		findInstallation.containedIn('user', anonymousUsers);

		findInstallation.find({
			success:function(installations)
			{
				console.log("anonymousUsers is length " + anonymousUsers.length + " findInstallations is length " + installations.length);

				// loop 	through installations and add userId's in an array
				var installationUserIds = [];

				// add userId to an array
				for (var i=0; i<installations.length; i++)
				{
					installationUserIds.push(installations[i].get("user").id);
					console.log("pushed " + installations[i].get("user").id + " to installationUserIds");
				}

				var deleteArray = [];

				for (var j=0; j<anonymousUsers.length; j++)
				{
					if (installationUserIds.indexOf(anonymousUsers[j].id) == -1) 
					{
						deleteArray.push(anonymousUsers[j]);
					}
				}

				Parse.Object.destroyAll(deleteArray, {
					success: function(deletedUser)
					{
						status.success("deleted anonymous users");
					},
					error: function(error)
					{
						status.error("couldn't delete anonymous user " + deletedUser.id);
					}
				});

			},
			error: function(error)
			{
				console.log("failed to query for installation with user " + user.id);
			}
		});
	});
});


/*
   For every miniripple that isPropagated == true,
   		Find ripple.
		Add receiverId of MiniRipple to ripple's receiverIdsPropagated
		save ripple 
*/
Parse.Cloud.job("addPropagatedReceiverIds", function(request, status) 
{
	// Set up to modify user data
  	// Parse.Cloud.useMasterKey();
	var RippleClass = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(RippleClass);
	rippleQuery.greaterThan("numPropagated", 0);
	rippleQuery.equalTo("objectId", "lf9Xs5D1Kw");

	var promises = [];

	rippleQuery.each(function(ripple)
	{
		//console.log("IN RIPPLE");
		var receiverIdsPropagated = ripple.get("receiverIdsPropagated");
		var numPropagated = ripple.get("numPropagated");
		if (receiverIdsPropagated == null)
		{
			receiverIdsPropagated = [];
		}
		if (numPropagated != receiverIdsPropagated.length)
		{
			//console.log("IN SECOND IF");
			var MiniRipple = Parse.Object.extend("MiniRipple");
			var miniRippleQuery = new Parse.Query(MiniRipple);
			miniRippleQuery.equalTo("isPropagated", true);
			
			miniRippleQuery.equalTo("ripple", ripple);
			miniRippleQuery.limit(1000);

			return miniRippleQuery.find({
			  success: function(results) {
			  	for (var i = 0; i < results.length; i++)
			  	{
			  		var receiverId = results[i].get("receiver").id;

					if (receiverIdsPropagated.indexOf(receiverId) == -1)
					{
						console.log("ALMOST THERE: " + receiverId);
				  		receiverIdsPropagated.push(receiverId);
				  		ripple.set("receiverIdsPropagated", receiverIdsPropagated);
				  		promises.push(ripple.save());
				  	}
			  	}



			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});
		}
	}).then(function() {
		console.log(promises.length);
		return Parse.Promise.when(promises);
	}).then(function() {
		status.success("Here i am");
	
	});
});


/*
// UPDATE POINNTS FOR people
*/
Parse.Cloud.job("updateUserPoints", function(request, status) 
{
	Parse.Cloud.useMasterKey();
	userPoints = request.params.pointDict;

	var objectIds = Object.keys(userPoints);
	console.log(objectIds);

	// query 
	var userQuery = new Parse.Query(Parse.User);
	userQuery.containedIn("objectId", objectIds);

	userQuery.each( function(user)
	{	
		Parse.Cloud.useMasterKey();

		if (objectIds.indexOf(user.id) != -1)
		{
			
			user.set("score", Math.floor(userPoints[user.id])+ Math.floor(user.get("score")));
			var userobject = new Parse.Query(Parse.User);

			var reachDict = [];
			reachDict = levelChange(user);

			if (reachDict[0] != "")
				user.set("reach", Math.floor(reachDict[0]));

			if (reachDict[1] !="")
				user.set("reachLevel", reachDict[1]);
			
			Parse.Cloud.useMasterKey();
			user.save();
	  }

	  return user.save();

  	}).then(function() {
	    // Set the job's success status
	    status.success("updated all scores");
	  }, function(error) {
	    // Set the job's error status
	    status.error("Uh oh, something went wrong: " + error.code + " " + error.message);
	});
});

function levelChange(user)
{

	// check if we have leveled up
	var currentReach = user.get("reachLevel");
	var score =Math.floor(user.get("score"));

	var reach = "";
	var reachLevel = "";


	console.log("current reachLevel is " + currentReach + " and has score of " + score + ". Userobject is " + user);
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
					reachLevel=  CUTOFF_LEVELS[NETWORK_SCORE_CUTOFFS[i - 1]]["level"];
					reach =  CUTOFF_LEVELS[NETWORK_SCORE_CUTOFFS[i - 1]]["reach"];


					// send a push to the initial user
					var reachIncreasePush = new Parse.Query(Parse.Installation);
					reachIncreasePush.equalTo('user', user);							 
					Parse.Push.send({
					  where: reachIncreasePush, // Set our Installation query
					  data: {
					  	alert: "We've changed our level structure! Your ripples now go to " + CUTOFF_LEVELS[NETWORK_SCORE_CUTOFFS[i - 1]]["reach"] + " people",
					  	"goTo" : "MyRipplesViewController"
					  }
					});

				}
			}
			break;
		}
	}

	return [reach, reachLevel];
}