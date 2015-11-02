

// Get mini ripple data structure used for creating the map
Parse.Cloud.define("getMiniRipplesGraph", function(request, response) 
{
  	var MiniRipple = Parse.Object.extend("MiniRipple");
	var miniRippleQuery = new Parse.Query(MiniRipple);

	// Create pointer to ripple
	var Ripple = Parse.Object.extend("Ripple");
	var ripple = new Ripple();
	ripple.id = request.params.rippleId;
	
	miniRippleQuery.equalTo("ripple", ripple);
	miniRippleQuery.equalTo("isPropagated", true);
	miniRippleQuery.descending("createdAt");
	miniRippleQuery.limit(1000);

	var miniRippleArray = [];
	

	miniRippleQuery.find().then(function(miniRipples) {

		// First create the mini ripple objects
		for (var i = 0; i < miniRipples.length; i++)
		{
			var miniRippleObject = miniRipples[i];
			var miniRipple = {};
			miniRipple["miniRippleId"] = miniRippleObject.id;
			miniRipple["rippleId"] = ripple.id;
			miniRipple["lastUpdated"] = miniRippleObject.updatedAt;
			miniRipple["geoPoint"] = miniRippleObject.get("location");
			miniRipple["sender"] = miniRippleObject.get("sender").id;
			miniRipple["receiver"] = miniRippleObject.get("receiver").id;

			miniRipple["isFirstWave"] = true;
			miniRipple["children"] = [];

			miniRippleArray.push(miniRipple);
		}

		// Now do the linking
		for (var i = 0; i < miniRippleArray.length; i++)
		{
			var miniRippleTo = miniRippleArray[i];

			for (var j = 0; j < miniRippleArray.length; j++)
			{
				var miniRippleFrom = miniRippleArray[j];
				if (miniRippleTo["sender"].valueOf() == miniRippleFrom["receiver"].valueOf())
				{
					miniRippleFrom["children"].push(miniRippleTo["miniRippleId"]);
					miniRippleTo["isFirstWave"] = false;
					break;
				}
			}
		}

		response.success(miniRippleArray);

	});
});


/******
	Ripple: sort order, has receiverId
	MiniRipple: is attached to ripple. IsPropagated=true.
******/
Parse.Cloud.define("getPropagatedRipples", function(request, response) 
{
	// get sortMethod
	var sortMethod = Math.floor(request.params.sortMethod);
	if (sortMethod == 1)
	{
		var Ripple = Parse.Object.extend("Ripple");
		var rippleQuery = new Parse.Query(Ripple);

		rippleQuery.containsAll("receiverIdsPropagated", [request.user.id]);
		if (sortMethod == 1)
		{
			rippleQuery.descending("numPropagated");
		}
		else
		{
			rippleQuery.descending("createdAt");
		}
		if (request.params.skip != null)
		{
			rippleQuery.skip(request.params.skip);
			rippleQuery.limit(25);
		}

		var rippleArray = [];

		rippleQuery.find().then(function(ripples) {
			for (var i = 0; i < ripples.length; i++)
			{
				var ripple = {};
				var rippleObject = ripples[i];
				ripple["rippleId"] = rippleObject.id;
				ripple["text"] = rippleObject.get("text");
				ripple["image"] = rippleObject.get("image");
				ripple["imageHeight"] = rippleObject.get("imageHeight");
				ripple["imageWidth"] = rippleObject.get("imageWidth");
				ripple["creatorName"] = rippleObject.get("creatorName");
				ripple["creatorId"] = rippleObject.get("creator").id;
				ripple["numPropagated"] = rippleObject.get("numPropagated");
				ripple["geoPoint"] = rippleObject.get("startLocation");
				ripple["createdAt"] = rippleObject.createdAt;
				ripple["isActedUpon"] = 1;
				var numPropagated = rippleObject.get("numPropagated");
				var rippleExposure = numPropagated / 10.0;
				if (rippleExposure > 3)
					rippleExposure = 3;
				else
					rippleExposure = Math.floor(rippleExposure);
				ripple["rippleExposure"] = rippleExposure;

				// get number of comments, and commentId array as well 
				var commentIds = rippleObject.get("commentIds");
				ripple["commentIds"] = commentIds;

				if (commentIds)
					ripple["numberOfComments"] = Math.floor(commentIds.length);
				else
					ripple["numberOfComments"] = 0;

				// get location strings
				var city = rippleObject.get("city");
				var country = rippleObject.get("country");
				if (city)
					ripple["city"] = city;
				if (country)
					ripple["country"] = country;

				rippleArray.push(ripple);
			}

			response.success(rippleArray);

		});
	}
	else
	{
		var MiniRipple = Parse.Object.extend("MiniRipple");
		var miniRippleQuery = new Parse.Query(MiniRipple);
		miniRippleQuery.equalTo("receiver", request.user);
		// miniRippleQuery.greaterThan("createdAt", {"__type":"Date","iso":cutoffDate});
		miniRippleQuery.equalTo("isPropagated", true);
		miniRippleQuery.descending("updatedAt");

		if (request.params.skip != null)
		{
			miniRippleQuery.skip(request.params.skip);
			miniRippleQuery.limit(25);
		}

		var rippleArray = [];
		var rippleIdArray = [];

		miniRippleQuery.find().then(function(miniRipples) {
			
			for (var i = 0; i < miniRipples.length; i++)
			{
				var ripple = {};
				var miniRippleObject = miniRipples[i];
				var rippleObject = miniRippleObject.get("ripple");
				ripple["rippleId"] = rippleObject.id;
				ripple["miniRippleId"] = miniRippleObject.id;

				rippleArray.push(ripple);
				rippleIdArray.push(rippleObject.id);
			}

			var Ripple = Parse.Object.extend("Ripple");
			var rippleQuery = new Parse.Query(Ripple);
			rippleQuery.containedIn("objectId", rippleIdArray);

			return rippleQuery.find();

		}).then(function(ripples) {
			for (var i = 0; i < ripples.length; i++)
			{
				var rippleObject = ripples[i];
				var ripple;
				for (var j = 0; j < rippleArray.length; j++)
				{
					ripple = rippleArray[j];
					if (ripple["rippleId"] == rippleObject.id)
						break;
				}
				ripple["text"] = rippleObject.get("text");
				ripple["image"] = rippleObject.get("image");
				ripple["imageHeight"] = rippleObject.get("imageHeight");
				ripple["imageWidth"] = rippleObject.get("imageWidth");
				ripple["creatorName"] = rippleObject.get("creatorName");
				ripple["creatorId"] = rippleObject.get("creator").id;
				ripple["numPropagated"] = rippleObject.get("numPropagated");
				ripple["geoPoint"] = rippleObject.get("startLocation");
				ripple["createdAt"] = rippleObject.createdAt;
				var numPropagated = rippleObject.get("numPropagated");
				var rippleExposure = numPropagated / 10.0;
				if (rippleExposure > 3)
					rippleExposure = 3;
				else
					rippleExposure = Math.floor(rippleExposure);
				ripple["rippleExposure"] = rippleExposure;

				// get number of comments, and commentId array as well 
				var commentIds = rippleObject.get("commentIds");
				ripple["commentIds"] = commentIds;

				if (commentIds)
					ripple["numberOfComments"] = Math.floor(commentIds.length);
				else
					ripple["numberOfComments"] = 0;

				// get location strings
				var city = rippleObject.get("city");
				var country = rippleObject.get("country");
				if (city)
					ripple["city"] = city;
				if (country)
					ripple["country"] = country;
			}
			response.success(rippleArray);
		});
	}
});

/******
	Return user's ripples
******/
Parse.Cloud.define("getMyRipples", function(request, response) 
{
	// get sortMethod
	var rippleIdArray = [];
	var otherUserProfile = false;
	var sortMethod = Math.floor(request.params.sortMethod);

	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);
	var user;

	if (request.params.profileUser == null)
		user = request.user;
	else
	{
		var UserClass = Parse.Object.extend("_User");
		user = new UserClass();
		user.id = request.params.profileUser;
		otherUserProfile = true;
	}

	rippleQuery.equalTo("creator", user);
	if (sortMethod == 1)
	{
		rippleQuery.descending("numPropagated");
	}
	else
	{
		rippleQuery.descending("createdAt");
	}
	
	if (request.params.skip != null)
	{
		rippleQuery.skip(request.params.skip);
		rippleQuery.limit(25);
	}

	var rippleArray = [];

	rippleQuery.find().then(function(ripples){
		var rippleObjectArray = [];

		for (var i = 0; i < ripples.length; i++)
		{
			var ripple = {};
			var rippleObject = ripples[i];

			if (otherUserProfile)
			{
				rippleObjectArray.push(rippleObject);
				rippleIdArray.push(rippleObject.id);
			}

			ripple["rippleId"] = rippleObject.id;
			ripple["text"] = rippleObject.get("text");
			ripple["image"] = rippleObject.get("image");
			ripple["imageHeight"] = rippleObject.get("imageHeight");
			ripple["imageWidth"] = rippleObject.get("imageWidth");
			ripple["creatorName"] = rippleObject.get("creatorName");
			ripple["creatorId"] = rippleObject.get("creator").id;
			ripple["numPropagated"] = rippleObject.get("numPropagated");
			ripple["geoPoint"] = rippleObject.get("startLocation");
			ripple["createdAt"] = rippleObject.createdAt;
			ripple["isActedUpon"] = 0;


			// logic for number of circles to show
			var numPropagated = rippleObject.get("numPropagated");
			var rippleExposure = numPropagated / 10.0;
			if (rippleExposure > 3)
				rippleExposure = 3;
			else
				rippleExposure = Math.floor(rippleExposure);
			ripple["rippleExposure"] = rippleExposure;


			// get number of comments, and commentId array as well 
			var commentIds = rippleObject.get("commentIds");
			ripple["commentIds"] = commentIds;

			if (commentIds)
				ripple["numberOfComments"] = Math.floor(commentIds.length);
			else
				ripple["numberOfComments"] = 0;

			// get location strings
			var city = rippleObject.get("city");
			var country = rippleObject.get("country");
			if (city)
				ripple["city"] = city;
			if (country)
				ripple["country"] = country;

			rippleArray.push(ripple);
		}

		if (!otherUserProfile)
			response.success(rippleArray);

		// else find miniripples
		var MiniRipple = Parse.Object.extend("MiniRipple");
		var miniRippleQuery = new Parse.Query(MiniRipple);
		miniRippleQuery.equalTo("receiver", request.user);
		miniRippleQuery.containedIn("ripple",rippleObjectArray);

		return miniRippleQuery.find();
	}).then(function(miniripples) {

		for (var i=0;i<miniripples.length; i++)
		{
			var miniripple = miniripples[i];
			var mrRipple = miniripple.get("ripple");
			var index = rippleIdArray.indexOf(mrRipple.id);

			if (index != -1)
			{
				rippleArray[index]["miniRippleId"] = miniripple.id;
				
				var isPropagated = miniripple.get("isPropagated");
				if (isPropagated == undefined)
					rippleArray[index]["isActedUpon"] = 0;
				else if(isPropagated)
				{
					rippleArray[index]["isActedUpon"] = 1;
					console.log("TRUE " + rippleArray[index]["rippleId"]);
				}
				else
				{
					rippleArray[index]["isActedUpon"] = 2;
					console.log("FALSE " + rippleArray[index]["rippleId"]);
				}		
			}
		}
	}).then(function () {
		response.success(rippleArray);
	});
});

Parse.Cloud.define("getFollowingRipples", function(request, response)
{
	var userId = request.user.id;
	var rippleArray = [];
	var rippleIdArray = [];
	var userObject;

	// make call to user to find following array
	var userObjectQuery = new Parse.Query(Parse.User);
	userObjectQuery.select("following");

	userObjectQuery.get(userId).then(function(user) {
		return user;
	}).then(function(user) {
		userObject = user;
		var following = user.get("following");
		var followingObjects = [];

		if(following == undefined)
			response.success(null);

		// turn array of userIds to empty user objects
		for(var i=0; i<following.length; i++)
		{
			var follower = new Parse.User();
			follower.id = following[i];

			followingObjects.push(follower);
		}

		// grab all ripples of creator contained in
		var Ripple = Parse.Object.extend("Ripple");
		var rippleQuery = new Parse.Query(Ripple);
		rippleQuery.containedIn("creator", followingObjects);
		rippleQuery.descending("createdAt");

		if (request.params.skip != null)
		{
			rippleQuery.skip(request.params.skip);
			rippleQuery.limit(25);
		}

		return rippleQuery.find();
	}).then(function(ripples) {

		var rippleObjectArray = [];

		for (var i = 0; i < ripples.length; i++)
		{
			var ripple = {};
			var rippleObject = ripples[i];
			rippleObjectArray.push(rippleObject);
			rippleIdArray.push(rippleObject.id);

			ripple["rippleId"] = rippleObject.id;
			ripple["text"] = rippleObject.get("text");
			ripple["image"] = rippleObject.get("image");
			ripple["imageHeight"] = rippleObject.get("imageHeight");
			ripple["imageWidth"] = rippleObject.get("imageWidth");
			ripple["creatorName"] = rippleObject.get("creatorName");
			ripple["creatorId"] = rippleObject.get("creator").id;
			ripple["numPropagated"] = rippleObject.get("numPropagated");
			ripple["geoPoint"] = rippleObject.get("startLocation");
			ripple["createdAt"] = rippleObject.createdAt;
			ripple["isActedUpon"] = 0;

			// logic for number of circles to show
			var numPropagated = rippleObject.get("numPropagated");
			var rippleExposure = numPropagated / 10.0;
			if (rippleExposure > 3)
				rippleExposure = 3;
			else
				rippleExposure = Math.floor(rippleExposure);
			ripple["rippleExposure"] = rippleExposure;


			// get number of comments, and commentId array as well 
			var commentIds = rippleObject.get("commentIds");
			ripple["commentIds"] = commentIds;

			if (commentIds)
				ripple["numberOfComments"] = Math.floor(commentIds.length);
			else
				ripple["numberOfComments"] = 0;

			// get location strings
			var city = rippleObject.get("city");
			var country = rippleObject.get("country");
			if (city)
				ripple["city"] = city;
			if (country)
				ripple["country"] = country;

			rippleArray.push(ripple);
		}

		// create miniripple query
		var MiniRipple = Parse.Object.extend("MiniRipple");
		var miniRippleQuery = new Parse.Query(MiniRipple);
		miniRippleQuery.equalTo("receiver", userObject);
		miniRippleQuery.containedIn("ripple",rippleObjectArray);

		return miniRippleQuery.find();

	}).then(function(miniripples) {
		console.log("completed miniripple request with length " + miniripples.length);

		for (var i=0;i<miniripples.length; i++)
		{
			var miniripple = miniripples[i];
			var mrRipple = miniripple.get("ripple");
			var index = rippleIdArray.indexOf(mrRipple.id);

			if (index != -1)
			{
				console.log("found a miniripple for this user with id " + mrRipple.id + " with value " + miniripple.get("isPropagated") + ". index was " + index);
				
				var isPropagated = miniripple.get("isPropagated");
				if (isPropagated == undefined)
					rippleArray[index]["isActedUpon"] = 0;
				else if(isPropagated)
				{
					rippleArray[index]["isActedUpon"] = 1;
					console.log("TRUE " + rippleArray[index]["rippleId"]);
				}
				else
				{
					rippleArray[index]["isActedUpon"] = 2;
					console.log("FALSE " + rippleArray[index]["rippleId"]);
				}		
			}
		}
		// loop through miniripples
		// find find matching rippleobjects and change actedupon accordingly
	}).then(function () {
		response.success(rippleArray);
	});
});



/***************FOLLOWING RIPPLES NOT ACTED UPON
*
*************************************************/

Parse.Cloud.define("getPendingFollowingRipples", function(request, response)
{
	var rippleIdArray = [];
	var rippleObjectArray = [];
	rippleObjectArrayFinal = [];
	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);
	var user = request.user;
	var userId = request.user.id;

	// make call to user to find following array
	var userObjectQuery = new Parse.Query(Parse.User);
	userObjectQuery.select("following");
	userObjectQuery.get(userId).then(function(user) {
		return user;
	}).then(function(user) {
		userObject = user;
		var following = user.get("following");
		var followingObjects = [];

		if(following == undefined)
			response.success(null);

		// turn array of userIds to empty user objects
		for(var i=0; i<following.length; i++)
		{
			var follower = new Parse.User();
			follower.id = following[i];

			followingObjects.push(follower);
		}

		// grab all ripples of creator contained in
		var Ripple = Parse.Object.extend("Ripple");
		var rippleQuery = new Parse.Query(Ripple);
		rippleQuery.containedIn("creator", followingObjects);
		rippleQuery.descending("createdAt");
		rippleQuery.notEqualTo("receiverIdsPropagated",userId);
		rippleQuery.limit(400);

		// ripple 
		var currentDate = Date.now();
		var timeDelta = 3600*24000 * 65; //last number is number of days
		var cutoffDate = new Date(currentDate - (timeDelta));

		rippleQuery.greaterThan("createdAt",cutoffDate);
		/*if (request.params.skip != null)
		{
			rippleQuery.skip(request.params.skip);
			rippleQuery.limit(25);
		} */

		return rippleQuery.find();
	}).then(function(ripples) {

		console.log("returned ripples length of " + ripples.length);

		for (var i = 0; i < ripples.length; i++)
		{
			rippleIdArray.push(ripples[i].id);
			rippleObjectArray.push(ripples[i]);
		}

		// make call to check miniripples
		var userObject = new Parse.User();
		userObject.id = request.user.id;

		var MiniRipple = Parse.Object.extend("MiniRipple");
		var miniRippleQuery = new Parse.Query(MiniRipple);
		miniRippleQuery.equalTo("receiver", userObject);
		miniRippleQuery.containedIn("ripple",rippleObjectArray);
		// miniRippleQuery.exists("isPropagated");
		

		miniRippleQuery.limit(420);

		return miniRippleQuery.find();
	}).then(function(miniripples) {
		console.log("completed miniripple request with length " + miniripples.length);
		mrIds = [];

		for (var j=0; j<miniripples.length; j++)
		{
			var miniripple = miniripples[j];
			var mrRipple = miniripple.get("ripple");

			mrIds.push(mrRipple.id);
		}	

		for (var i=0;i < rippleObjectArray.length; i++)
		{
			var ripple = rippleObjectArray[i];
			var rId = ripple.id;

			if (mrIds.indexOf(rId) == -1)
				rippleObjectArrayFinal.push(ripple);
			else
			{
				//console.log('RID IS ' + rId + " and propagated is " + miniripple.get("isPropagated"));

				var index = mrIds.indexOf(rId);
				if (miniripples[index].get("isPropagated") == undefined)
				{
					// console.log("ripple is " + miniripples[index].get("isPropagated") + " and we are adding to rippleobjectarrayfinal");
					ripple.set("miniRippleId", miniripples[index].id);
					rippleObjectArrayFinal.push(ripple);
				}

			}
				
		
			
			/*if (index != -1)
			{
				if (miniripple.get("isPropagated") == false || miniripple.get("isPropagated") == true)
				{
					if(mrRipple.id == "6sn6BcOBMS")
						console.log("THIS SHOULD BE DELETED.LKJDSFS:DLFKJS. INDEX IS " + index);

					//console.log('INDEX IS ' + index + " and propagated is " + miniripple.get("isPropagated"));
					rippleObjectArray.splice(index, 1);
				}	
			}*/
			
			/*
			else
			{
				console.log('INDEX IS ' + index + " AND DOESN'T EXIST");
				rippleObjectArray.push(rippleObjectArray[index]);
			}*/


		}
	}).then(function () {
		console.log("the ripples now have a length of " + rippleObjectArrayFinal.length);

		var rippleArray = [];

		for (var i = 0; i < rippleObjectArrayFinal.length; i++)
		{
			var ripple = {};
			var rippleObject = rippleObjectArrayFinal[i];
			ripple["rippleId"] = rippleObject.id;
			ripple["text"] = rippleObject.get("text");
			ripple["image"] = rippleObject.get("image");
			ripple["imageHeight"] = rippleObject.get("imageHeight");
			ripple["imageWidth"] = rippleObject.get("imageWidth");
			ripple["creatorName"] = rippleObject.get("creatorName");
			ripple["creatorId"] = rippleObject.get("creator").id;
			ripple["numPropagated"] = rippleObject.get("numPropagated");
			ripple["geoPoint"] = rippleObject.get("startLocation");
			ripple["createdAt"] = rippleObject.createdAt;
			ripple["isFollowing"] = 0;

			if (rippleObject.get("miniRippleId"))
				ripple["miniRippleId"] = rippleObject.get("miniRippleId");

		 	var following = user.get("following");

		 	if (following !=null)
		 	{
			 	if (following.indexOf(ripple["creatorId"]) != -1)
			 		ripple["isFollowing"] = 1;
			}


			// get number of comments, and commentId array as well 
			var commentIds = rippleObject.get("commentIds");
			ripple["commentIds"] = commentIds;

			if (commentIds)
				ripple["numberOfComments"] = Math.floor(commentIds.length);
			else
				ripple["numberOfComments"] = 0;

			// get location strings
			var city = rippleObject.get("city");
			var country = rippleObject.get("country");
			if (city)
				ripple["city"] = city;
			if (country)
				ripple["country"] = country;

			rippleArray.push(ripple);
		}

		response.success(rippleArray);
	});	
});

Parse.Cloud.define("getPendingFollowingRipplesTEST", function(request, response)
{
	// arrays needed
	var rippleIdArray = [];
	var rippleObjectArray = [];
	var rippleObjectArrayFinal = [];
	var prObject = [];
	var miniRippleQueryArray = [];
	var rippleArray = [];
	var newRipplesToAddToPR = [];
	var prRemove = [];

	var followingObjects = [];
	var followingPRs = [];
	var following = [];

	var user = request.user;
	var userId = request.user.id;
	var lastUpdated;

	var Pending = Parse.Object.extend("Pending");
	var Ripple = Parse.Object.extend("Ripple");
	

	// make call to user to find following array
	var userObjectQuery = new Parse.Query(Parse.User);
	userObjectQuery.select("following");

	userObjectQuery.get(userId).then(function(user) {
		userObject = user;
		following = user.get("following");

		if(following == undefined)
			response.success(null);

		// turn array of userIds to empty user objects
		for(var i=0; i<following.length; i++)
		{
			var follower = new Parse.User();
			follower.id = following[i];

			followingObjects.push(follower);
		}

		// check Pending Ripples database
		var prQuery = new Parse.Query(Pending);
		prQuery.equalTo("user", request.user);
		return prQuery.first();

	}).then(function(prUser) {
		if (prUser)
		{
			prObject = prUser;
			console.log("prObject IS " + prObject);
			lastUpdated = prUser.updatedAt;

			followingPRs = prUser.get("following");
		}
		else
		{
			console.log("no prUSER!");
			prObject = null;
		}

		// grab all ripples of creator contained in
		var rippleQuery = new Parse.Query(Ripple);
		rippleQuery.containedIn("creator", followingObjects);
		rippleQuery.descending("createdAt");
		rippleQuery.notEqualTo("receiverIdsPropagated",userId);
		rippleQuery.limit(400);

		if (prObject != null && prObject.get("changedFollowers") != true)
			rippleQuery.greaterThan("createdAt",lastUpdated);

		else if (prObject == null || prObject.get("changedFollowers") == true)
		{
			// ripple 
			var currentDate = Date.now();
			var timeDelta = 3600*24000 * 65; //last number is number of days
			var cutoffDate = new Date(currentDate - (timeDelta));

			rippleQuery.greaterThan("createdAt",cutoffDate);
		}

		return rippleQuery.find();
	}).then(function(ripples) {
		miniRippleQueryArray = ripples;


		for (var i=0; i<ripples.length;i++)
			newRipplesToAddToPR.push(ripples[i].id);

		console.log("returned ripples length of " + ripples.length);

		// check length is bigger than 25. If not, then grab difference of 25, query, add, and check MR too
		var addToRippleIds;
		if(ripples.length < 25)
		{
			var difference = 25 - ripples.length;

			if (followingPRs.length >difference)
				addToRippleIds = followingPRs.slice(0,difference);
			else
				addToRippleIds = followingPRs;
		}
		else
			addToRippleIds = [];

		var addToRipplesQuery = new Parse.Query(Ripple);
		addToRipplesQuery.containedIn("objectId", addToRippleIds);
		addToRipplesQuery.descending("createdAt");

		return addToRipplesQuery.find();
	}).then(function(addToRipples) {
		console.log("RETURNED ANOTHER " + addToRipples.length + " RIPPLES TO ADD TO RIPPLES");
		miniRippleQueryArray = miniRippleQueryArray.concat(addToRipples);

		if (miniRippleQueryArray.length == 0)
			response.success(null);

		// make call to check miniripples
		var userObject = new Parse.User();
		userObject.id = request.user.id;

		var MiniRipple = Parse.Object.extend("MiniRipple");
		var miniRippleQuery = new Parse.Query(MiniRipple);
		miniRippleQuery.equalTo("receiver", userObject);
		miniRippleQuery.containedIn("ripple",miniRippleQueryArray);
		// miniRippleQuery.exists("isPropagated");

		miniRippleQuery.limit(420);

		return miniRippleQuery.find();
	}).then(function(miniripples) {
		console.log("completed miniripple request with length " + miniripples.length);
		mrIds = [];

		for (var j=0; j<miniripples.length; j++)
		{
			var miniripple = miniripples[j];
			var mrRipple = miniripple.get("ripple");

			mrIds.push(mrRipple.id);
		}	

		for (var i=0;i < miniRippleQueryArray.length; i++)
		{
			var ripple = miniRippleQueryArray[i];
			var rId = ripple.id;

			if (mrIds.indexOf(rId) == -1)
			{
				rippleObjectArrayFinal.push(ripple);
				if (newRipplesToAddToPR.indexOf(rId) != -1 && followingPRs.indexOf(rId) == -1)
					rippleIdArray.push(rId);
			}
			else
			{
				var index = mrIds.indexOf(rId);
				if (miniripples[index].get("isPropagated") == undefined)
				{
					// console.log("ripple is " + miniripples[index].get("isPropagated") + " and we are adding to rippleobjectarrayfinal");
					ripple.set("miniRippleId", miniripples[index].id);
					rippleObjectArrayFinal.push(ripple);

					if (newRipplesToAddToPR.indexOf(rId) != -1 && followingPRs.indexOf(rId) == -1)
						rippleIdArray.push(rId);
				}
				else
				{
					//remove from prUser list if it is in here. 
					if (followingPRs.indexOf(rId) != -1)
						prRemove.push(rId);
				}
			}
		}
	}).then(function () {
		console.log("the ripples now have a length of " + rippleObjectArrayFinal.length);
		var ripplesLength;

		if (rippleObjectArrayFinal.length > 25)
			ripplesLength = 25;
		else
			ripplesLength = rippleObjectArrayFinal.length;

		for (var i = 0; i < ripplesLength; i++)
		{
			var ripple = {};
			var rippleObject = rippleObjectArrayFinal[i];
			ripple["rippleId"] = rippleObject.id;
			ripple["text"] = rippleObject.get("text");
			ripple["image"] = rippleObject.get("image");
			ripple["imageHeight"] = rippleObject.get("imageHeight");
			ripple["imageWidth"] = rippleObject.get("imageWidth");
			ripple["creatorName"] = rippleObject.get("creatorName");
			ripple["creatorId"] = rippleObject.get("creator").id;
			ripple["numPropagated"] = rippleObject.get("numPropagated");
			ripple["geoPoint"] = rippleObject.get("startLocation");
			ripple["createdAt"] = rippleObject.createdAt;
			ripple["isFollowing"] = 1;

			if (rippleObject.get("miniRippleId"))
				ripple["miniRippleId"] = rippleObject.get("miniRippleId");

			// get number of comments, and commentId array as well 
			var commentIds = rippleObject.get("commentIds");
			ripple["commentIds"] = commentIds;

			if (commentIds)
				ripple["numberOfComments"] = Math.floor(commentIds.length);
			else
				ripple["numberOfComments"] = 0;

			// get location strings
			var city = rippleObject.get("city");
			var country = rippleObject.get("country");
			if (city)
				ripple["city"] = city;
			if (country)
				ripple["country"] = country;

			rippleArray.push(ripple);
		}


		// check if we have an entity
		if (prObject)
		{
			// update item
			console.log("pruser exists and we are adding. ");
			followingPRs = rippleIdArray.concat(followingPRs); 

			// all of it... we will remove it accordingly 
			prObject.set("following", followingPRs);

			for (var j=0; j<prRemove.length; j++)
				prObject.remove("following",prRemove[j]);

			prObject.set("changedFollowers", false);
			prObject.save();

		}

		else
		{
			console.log("creating pruser entry.");
			var prUser = new Pending();
			prUser.set("user", request.user);
			prUser.set("following",rippleIdArray);
			prUser.save();
		}

		
		response.success(rippleArray);
		
	});	
});


Parse.Cloud.define("getStoredFollowingRipples", function(request, response)
{
	var followingPRs = [];
	var rippleArray = [];
	var Pending = Parse.Object.extend("Pending");
	var Ripple = Parse.Object.extend("Ripple");


	// check Pending Ripples database
	var prQuery = new Parse.Query(Pending);
	prQuery.equalTo("user", request.user);

	prQuery.first().then(function(prObject) {
		followingPRs = prObject.get("following");
		console.log("followingPRs has " + followingPRs.length);

		var skip = request.params.skip;
		var rippleIds = followingPRs.slice(skip, skip + 25);
		
		console.log("rippleIds has " + rippleIds.length +  " and skip is " + skip);

		var rippleQuery = new Parse.Query(Ripple);
		rippleQuery.containedIn("objectId",rippleIds);
		rippleQuery.limit(25);


		return rippleQuery.find();

	}).then(function(ripples){
		for (var i = 0; i < ripples.length; i++)
		{
			var ripple = {};
			var rippleObject = ripples[i];
			ripple["rippleId"] = rippleObject.id;
			ripple["text"] = rippleObject.get("text");
			ripple["image"] = rippleObject.get("image");
			ripple["imageHeight"] = rippleObject.get("imageHeight");
			ripple["imageWidth"] = rippleObject.get("imageWidth");
			ripple["creatorName"] = rippleObject.get("creatorName");
			ripple["creatorId"] = rippleObject.get("creator").id;
			ripple["numPropagated"] = rippleObject.get("numPropagated");
			ripple["geoPoint"] = rippleObject.get("startLocation");
			ripple["createdAt"] = rippleObject.createdAt;
			ripple["isFollowing"] = 1;

			if (rippleObject.get("miniRippleId"))
				ripple["miniRippleId"] = rippleObject.get("miniRippleId");

			// get number of comments, and commentId array as well 
			var commentIds = rippleObject.get("commentIds");
			ripple["commentIds"] = commentIds;

			if (commentIds)
				ripple["numberOfComments"] = Math.floor(commentIds.length);
			else
				ripple["numberOfComments"] = 0;

			// get location strings
			var city = rippleObject.get("city");
			var country = rippleObject.get("country");
			if (city)
				ripple["city"] = city;
			if (country)
				ripple["country"] = country;

			rippleArray.push(ripple);
		}

		response.success(rippleArray);
	});
});


/******
	get a ripple for a push notification for v3
*******/
Parse.Cloud.define("getRippleForPush", function(request, response) 
{
	var rippleId = request.params.rippleId;
	var userId = request.user.id;

	var ripple = {};
	console.log("rippleId is " + rippleId + " and userId is: " + userId);


	// create query
	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);

	rippleQuery.get(rippleId).then(function(rippleObject) {
		console.log("rippleObjectId is " + rippleObject.id);

		// fill out items needed
		ripple["text"] = rippleObject.get("text");
		ripple["rippleId"] = rippleObject.id;
		ripple["image"] = rippleObject.get("image");
		ripple["imageHeight"] = rippleObject.get("imageHeight");
		ripple["imageWidth"] = rippleObject.get("imageWidth");
		ripple["creatorName"] = rippleObject.get("creatorName");
		ripple["creatorId"] = rippleObject.get("creator").id;
		ripple["numPropagated"] = rippleObject.get("numPropagated");
		ripple["geoPoint"] = rippleObject.get("startLocation");
		ripple["createdAt"] = rippleObject.createdAt;
		ripple["takenActionOnRipple"] = true;

		var numPropagated = rippleObject.get("numPropagated");
		var rippleExposure = numPropagated / 10.0;
		if (rippleExposure > 3)
			rippleExposure = 3;
		else
			rippleExposure = Math.floor(rippleExposure);
		ripple["rippleExposure"] = rippleExposure;

		// get number of comments, and commentId array as well 
		var commentIds = rippleObject.get("commentIds");
		ripple["commentIds"] = commentIds;

		if (commentIds)
			ripple["numberOfComments"] = Math.floor(commentIds.length);
		else
			ripple["numberOfComments"] = 0;

		// get location strings
		var city = rippleObject.get("city");
		var country = rippleObject.get("country");
		if (city)
			ripple["city"] = city;
		if (country)
			ripple["country"] = country;

		return rippleObject;

	}).then(function(rippleObject) {
		// prepare miniripple query so that we can find if we've taken action on dis ripple doe
		if (ripple["creatorId"] != userId)
		{
			console.log("checking if taken action");
			var MiniRipple = Parse.Object.extend("MiniRipple");
			var miniRippleQuery = new Parse.Query(MiniRipple);

			miniRippleQuery.equalTo("ripple", rippleObject);
			miniRippleQuery.equalTo("receiver", request.user);

			miniRippleQuery.first({
				success: function(miniRipple)
				{
					if (miniRipple)
					{
						if (miniRipple.get("isPropagated") == true)
							ripple["isActedUpon"] = 1;

						else if (miniRipple.get("isPropagated") == false)
							ripple["isActedUpon"] = 1;
						else
							ripple["isActedUpon"] = 0;
					}
					else
						ripple["isActedUpon"] = 0;

					response.success(ripple);
					
				},
				error: function(error)
				{
					console.log("couldn't get miniripple to determine if action was taken or not");
				}
			});
		}

		else
		{
			ripple["isActedUpon"] = -1;
			response.success(ripple);
		}
			
	});

});

/******
	get a ripple for a push notification
*******/
Parse.Cloud.define("getRippleForPushWithId", function(request, response) 
{
	var rippleId = request.params.rippleId;
	var userId = request.user.id;

	var ripple = {};
	console.log("rippleId is " + rippleId + " and userId is: " + userId);


	// create query
	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);

	rippleQuery.get(rippleId).then(function(rippleObject) {
		console.log("rippleObjectId is " + rippleObject.id);

		// fill out items needed
		ripple["text"] = rippleObject.get("text");
		ripple["rippleId"] = rippleObject.id;
		ripple["image"] = rippleObject.get("image");
		ripple["imageHeight"] = rippleObject.get("imageHeight");
		ripple["imageWidth"] = rippleObject.get("imageWidth");
		ripple["creatorName"] = rippleObject.get("creatorName");
		ripple["creatorId"] = rippleObject.get("creator").id;
		ripple["numPropagated"] = rippleObject.get("numPropagated");
		ripple["geoPoint"] = rippleObject.get("startLocation");
		ripple["createdAt"] = rippleObject.createdAt;
		ripple["takenActionOnRipple"] = true;

		var numPropagated = rippleObject.get("numPropagated");
		var rippleExposure = numPropagated / 10.0;
		if (rippleExposure > 3)
			rippleExposure = 3;
		else
			rippleExposure = Math.floor(rippleExposure);
		ripple["rippleExposure"] = rippleExposure;

		// get number of comments, and commentId array as well 
		var commentIds = rippleObject.get("commentIds");
		ripple["commentIds"] = commentIds;

		if (commentIds)
			ripple["numberOfComments"] = Math.floor(commentIds.length);
		else
			ripple["numberOfComments"] = 0;

		// get location strings
		var city = rippleObject.get("city");
		var country = rippleObject.get("country");
		if (city)
			ripple["city"] = city;
		if (country)
			ripple["country"] = country;

		return rippleObject;

	}).then(function(rippleObject) {
		// prepare miniripple query so that we can find if we've taken action on dis ripple doe
		if (ripple["creatorId"] != userId)
		{
			console.log("checking if taken action");
			var MiniRipple = Parse.Object.extend("MiniRipple");
			var miniRippleQuery = new Parse.Query(MiniRipple);

			miniRippleQuery.equalTo("ripple", rippleObject);
			miniRippleQuery.equalTo("receiver", request.user);

			miniRippleQuery.first({
				success: function(miniRipple)
				{
					if (miniRipple)
					{
						if (miniRipple.get("isPropagated") == true)
							ripple["isActedUpon"] = 1;

						else if (miniRipple.get("isPropagated") == false)
							ripple["isActedUpon"] = 1;
						else
							ripple["isActedUpon"] = 0;
					}
					else
						ripple["isActedUpon"] = 0;

					response.success(ripple);
					
				},
				error: function(error)
				{
					console.log("couldn't get miniripple to determine if action was taken or not");
				}
			});
		}

		else
		{
			ripple["isActedUpon"] = -1;
			response.success(ripple);
		}
			
	});
});