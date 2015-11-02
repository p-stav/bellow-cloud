/****
	Get Search Results for users
****/
Parse.Cloud.define("getUserSearchResults", function(request, response)
{
	// grab user following list
	var userId = request.user.id;


	// make call to user to find following array
	var userObject = new Parse.Query(Parse.User);
	userObject.select("following");

	userObject.get(userId).then(function(user) {
		return user;

	}).then(function(user) {
		var following = user.get("following");
		var results = [];
		// grab user results
		var userQuery = new Parse.Query(Parse.User);
		userQuery.startsWith("canonicalUsername", request.params.searchTerm.toLowerCase());
		//userQuery.exists("email");


		userQuery.find({
			success:function(users)
			{
				for (var i=0; i<users.length; i++)
				{
					if (users[i].id != userId)
					{
						var user = {};
						user["objectId"] = users[i].id;
						user["username"] = users[i].get("username");
						user["level"] = users[i].get("reachLevel");

						if (following)
						{
							if (following.indexOf(users[i].id) == -1)
								user["isFollowing"] = false;
							else
								user["isFollowing"] = true;
						}
						else
							user["isFollowing"] = false;


						results.push(user);
					}
				}

				response.success(results);

			},
			error: function(error)
			{
				console.log("couldn't get search user terms. Error: " + error.message);
			}
		});
	});
});

/****
	Get Search Results for users
****/
Parse.Cloud.define("getFollowingUsers", function(request, response)
{
	// grab user following list
	var userId = request.user.id;

	// make call to user to find following array
	var userObject = new Parse.Query(Parse.User);
	userObject.select("following");

	userObject.get(userId).then(function(user) {
		return user;

	}).then(function(user) {
		var following = user.get("following");
		var results = [];
		// grab user results
		var userQuery = new Parse.Query(Parse.User);
		userQuery.containedIn("objectId", user.get("following"));
		userQuery.ascending("canonicalUsername");
		userQuery.limit(1000);


		userQuery.find({
			success:function(users)
			{
				for (var i=0; i<users.length; i++)
				{
					if (users[i].id != request.user.id)
					{
						var user = {};
						user["objectId"] = users[i].id;
						user["username"] = users[i].get("username");
						user["level"] = users[i].get("reachLevel");
						user["isFollowing"] = true;

						results.push(user);
					}
				}

				response.success(results);
			},
			error: function(error)
			{
				console.log("couldn't get search user terms. Error: " + error.message);
			}
		});
	});

});

/*********
	Check if username is valid for FB/T login
*********/
Parse.Cloud.define("checkUsername", function(request, response) {
	var username = request.params.username;

	// query users
	var userQuery = new Parse.Query(Parse.User);
	userQuery.equalTo("username",username);

	userQuery.count ({
		success: function(count)
		{
			var returnValue = 0; // 0 for false

			if (count == 0)
				returnValue = 1; // 1 for true

			response.success({"check" : returnValue});
		},
		error:function(error)
		{
			response.error("error getting count: " + error.message);
		}
	});
});

/******
	increment the number of people who are following a user
******/
Parse.Cloud.define("addToFollowingNumber", function(request, response)
{
	// get user ID
	var userId = request.params.userId;

	//masterKey
	Parse.Cloud.useMasterKey();

	// request to get user
	var userQuery = new Parse.Query(Parse.User);
	userQuery.get(userId).then(function(user) {

	 	if (user.get("followingNumber") == null)
	 		user.set("followingNumber", 1);
	 	else
	 		user.increment("followingNumber");

	 	user.save();
		
	}).then(function() {
		// save PendingRipple action
		var Pending = Parse.Object.extend("Pending");
		var prQuery = new Parse.Query(Pending);
		prQuery.equalTo("user", request.user);
		return prQuery.first();

	}).then(function(prUser) {
		if (prUser)
		{
			prUser.set("changedFollowers", true)
			prUser.save();
		}

		response.success("successfully increment followingNumber for user " + userId);
	});
});

/******
	decrement the number of people following a user
******/
Parse.Cloud.define("removeFromFollowingNumber", function(request, response)
{
	// get user ID
	var userId = request.params.userId;

	//masterKey
	Parse.Cloud.useMasterKey();

	// request to get user
	var userQuery = new Parse.Query(Parse.User);
	userQuery.get(userId).then(function(user) {

	 	if (user.get("followingNumber") == null || user.get("followingNumber") == 0)
	 		user.set("followingNumber", 0);
	 	else
	 		user.set("followingNumber", user.get("followingNumber") - 1);

	 	user.save();

	}).then(function() {
		// save PendingRipple action
		var Pending = Parse.Object.extend("Pending");
		var prQuery = new Parse.Query(Pending);
		prQuery.equalTo("user", request.user);
		return prQuery.first();

	}).then(function(prUser) {
		if (prUser)
		{
			prUser.set("changedFollowers", true)
			prUser.save();
		}

		response.success("successfully increment followingNumber for user " + userId);
	});
});

/******
	Return object of our custom values
*******/
Parse.Cloud.define("getConfigObject", function(request, response) {
	var updateInterval = 0.0;
	var defaultRippleString = "Ripple your feedback about this app"
	var configObject = {"updateInterval" : updateInterval, "defaultRippleString" : defaultRippleString};
	response.success(configObject);
});