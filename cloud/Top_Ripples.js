

/******
	Top Ripples. Start with a single algorithm.
******/
Parse.Cloud.define("getTopRipples", function(request, response)
{
	var rippleIdArray = [];
	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);
	rippleQuery.descending("numPropagated");

	if (request.params.skip != null)
	{
		rippleQuery.skip(request.params.skip);
		rippleQuery.limit(26);
	}

	//current time and cutoff Date
	var currentDate = Date.now();
	var timeDelta = 3600*1000 * 120; //last number is number of hours
	var cutoffDate = new Date(currentDate - (timeDelta));
	rippleQuery.greaterThan("createdAt", cutoffDate);

	var awokenPhotography = new Parse.User();
	awokenPhotography.id = "qldcjMNbIH";
	rippleQuery.notEqualTo("creator",awokenPhotography);

	var rippleArray = [];
	rippleQuery.find().then(function(ripples){
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

		// make call to check miniripples
		var userObject = new Parse.User();
		userObject.id = request.user.id;

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

/******
	Top Ripples. Start with a single algorithm.
******/
Parse.Cloud.define("getPendingTopRipples", function(request, response)
{
	var rippleIdArray = [];
	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);
	var user = request.user;

	if (request.params.skip != null)
		rippleQuery.skip(request.params.skip);


	rippleQuery.descending("numPropagated");
	rippleQuery.greaterThan("numPropagated",100);
	rippleQuery.notEqualTo("receiverIdsPropagated",request.user.id);
	rippleQuery.notEqualTo("creator",request.user);
	rippleQuery.limit(400);

	//current time and cutoff Date
	var currentDate = Date.now();
	var timeDelta = 3600*1000 * 120; //last number is number of hours - 7 days
	var cutoffDate = new Date(currentDate - (timeDelta));

	rippleQuery.greaterThan("createdAt", cutoffDate);

	var rippleObjectArray = [];
	rippleObjectArrayFinal = [];
	var rippleArray = [];
	var pendingTopRipples = [];

	rippleQuery.find().then(function(ripples){
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
		//miniRippleQuery.exists("isPropagated");
		

		miniRippleQuery.limit(400);

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
					//console.log("ripple is " + miniripples[index].get("isPropagated") + " and we are adding to rippleobjectarrayfinal");
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
		// sort
		rippleObjectArrayFinal.sort(function(a,b){
			return b.get("numPropagated") - a.get("numPropagated")
		});

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

/******
	Top Ripples For Website. Start with a single algorithm.
******/
Parse.Cloud.define("getTopRipplesForWebsite", function(request, response)
{
	var rippleIdArray = [];
	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);
	rippleQuery.descending("numPropagated");

	if (request.params.skip != null)
	{
		rippleQuery.skip(request.params.skip);
		rippleQuery.limit(25);
	}

	//current time and cutoff Date
	var currentDate = Date.now();
	var timeDelta = 3600*1000 * 120; //last number is number of hours
	var cutoffDate = new Date(currentDate - (timeDelta));

	rippleQuery.greaterThan("createdAt", cutoffDate);


	var rippleArray = [];

	rippleQuery.find().then(function(ripples){
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
	}).then(function() {
		response.success(rippleArray);
	});
}); 

/******
	Top Ripples. Start with a single algorithm.
******/
/*
Parse.Cloud.define("getTopRipples", function(request, response)
{
	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);
	rippleQuery.descending("numPropagated");

	if (request.params.skip != null)
	{
		rippleQuery.skip(request.params.skip);
		rippleQuery.limit(25);
	}

	//current time and cutoff Date
	var currentDate = Date.now();
	var timeDelta = 3600*1000 * 120; //last number is number of hours
	var cutoffDate = new Date(currentDate - (timeDelta));

	rippleQuery.greaterThan("createdAt", cutoffDate);


	var rippleArray = [];

	rippleQuery.find().then(function(ripples){
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

		response.success(rippleArray);
	});
});*/