var NUM_HOURS_CUTOFF = 72;

/******
	Return pending ripples
******/
Parse.Cloud.define("getPendingRipples", function(request, response) 
{
	// cutoff time
	var currentDate = Date.now();
	var timeInterval = NUM_HOURS_CUTOFF * 60 * 60 * 1000;
	var cutoffDate = currentDate - timeInterval;
	cutoffDate = new Date(cutoffDate).toISOString();

  	var MiniRipple = Parse.Object.extend("MiniRipple");
	var miniRippleQuery = new Parse.Query(MiniRipple);
	miniRippleQuery.equalTo("receiver", request.user);
	miniRippleQuery.greaterThan("createdAt", {"__type":"Date","iso":cutoffDate});
	miniRippleQuery.equalTo("isPropagated", null);
	miniRippleQuery.descending("createdAt");
	miniRippleQuery.limit(200);

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
		rippleQuery.limit(200);
		//rippleQuery.descending("numPropagated");

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
			ripple["isActedUpon"] = 0;

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


			// create sortMetric
			var createdTimestamp = Date.parse(rippleObject.createdAt);
			var difference = currentDate - createdTimestamp;
			var diffHours = difference/(1000*60*60);
			
			if (diffHours <=1)
				diffHours = 0.3;

			else if (diffHours <= 4)
				diffHours *= .5;

			/*else
				diffHours *= 0.5;

			if (diffHours ==0)
				diffHours = 1;
			*/

			var spread = ripple["numPropagated"];
			if (spread <=3 && diffHours <=4)
				spread = 3;

			ripple["sortMetric"] = 	spread/diffHours;

		}

		// sort
		rippleArray.sort(function(a,b){
			return b["sortMetric"] - a["sortMetric"]
		});

		
		response.success(rippleArray);

	});
});

Parse.Cloud.define("getPendingRipplesTriage", function(request, response) 
{ 
	// cutoff time
	var currentDate = Date.now();
	var timeInterval = 24*60 * 60 * 1000* 5; //last number is days (curently 5)
	var cutoffDate = currentDate - timeInterval;
	cutoffDate = new Date(cutoffDate).toISOString();

  	var MiniRipple = Parse.Object.extend("MiniRipple");
	var miniRippleQuery = new Parse.Query(MiniRipple);
	miniRippleQuery.equalTo("receiver", request.user);
	miniRippleQuery.greaterThan("createdAt", {"__type":"Date","iso":cutoffDate});
	miniRippleQuery.equalTo("isPropagated", null);
	//miniRippleQuery.descending("createdAt");

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
		rippleQuery.greaterThan("createdAt", {"__type":"Date","iso":cutoffDate});
		rippleQuery.containedIn("objectId", rippleIdArray);	
		//rippleQuery.descending("numPropagated");

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


			// create sortMetric
			var createdTimestamp = Date.parse(rippleObject.createdAt);
			var difference = currentDate - createdTimestamp;
			var diffHours = difference/(1000*60*60);
			
			if (diffHours <=1)
				diffHours = 0.3;

			else if (diffHours <= 4)
				diffHours *= .5;
			/*else
				diffHours *= 0.5;
			*/

			if (diffHours ==0)
				diffHours = 1;

			var spread = ripple["numPropagated"];
			if (spread == 0 && diffHours <=4)
				spread = 1.6;

			ripple["sortMetric"] = 	spread/diffHours;

		}

		// sort
		rippleArray.sort(function(a,b){
			return a["sortMetric"] - b["sortMetric"]
		});

		response.success(rippleArray);

	});
});

Parse.Cloud.define("getPendingRipplesTEST", function(request, response) 
{
	// cutoff time
	var currentDate = Date.now();
	var timeInterval = NUM_HOURS_CUTOFF * 60 * 60 * 1000;
	var cutoffDate = currentDate - timeInterval;
	var user = request.user;

	cutoffDate = new Date(cutoffDate).toISOString();

  	var MiniRipple = Parse.Object.extend("MiniRipple");
	var miniRippleQuery = new Parse.Query(MiniRipple);
	miniRippleQuery.equalTo("receiver", request.user);
	miniRippleQuery.greaterThan("createdAt", {"__type":"Date","iso":cutoffDate});
	miniRippleQuery.equalTo("isPropagated", null);
	miniRippleQuery.descending("createdAt");
	miniRippleQuery.limit(200);

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
		rippleQuery.limit(200);
		//rippleQuery.descending("numPropagated");

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
			ripple["isActedUpon"] = 0;
		 	ripple["isFollowing"] = 0;



		 	var following = user.get("following");

		 	if (following !=null)
		 	{
			 	if (following.indexOf(ripple["creatorId"]) != -1)
			 		ripple["isFollowing"] = 1;
			}

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


			// create sortMetric
			var createdTimestamp = Date.parse(rippleObject.createdAt);
			var difference = currentDate - createdTimestamp;
			var diffHours = difference/(1000*60*60);
			
			if (diffHours <=1)
				diffHours = 0.3;

			else if (diffHours <= 4)
				diffHours *= .5;

			/*else
				diffHours *= 0.5;

			if (diffHours ==0)
				diffHours = 1;
			*/

			var spread = ripple["numPropagated"];
			if (spread <=3 && diffHours <=4)
				spread = 3;

			ripple["sortMetric"] = 	spread/diffHours;

			if (ripple["isFollowing"] == true)
				ripple["sortMetric"] *=2.5;
		}

		// sort
		rippleArray.sort(function(a,b){
			return b["sortMetric"] - a["sortMetric"]
		});

		
		response.success(rippleArray);

	});
});


Parse.Cloud.define("getPendingRipplesBatch", function(request, response) 
{
	// cutoff time
	var currentDate = Date.now();
	var timeInterval = NUM_HOURS_CUTOFF * 60 * 60 * 1000;
	var cutoffDate = currentDate - timeInterval;
	var user = request.user;

	cutoffDate = new Date(cutoffDate).toISOString();

  	var MiniRipple = Parse.Object.extend("MiniRipple");
	var miniRippleQuery = new Parse.Query(MiniRipple);
	miniRippleQuery.equalTo("receiver", request.user);
	miniRippleQuery.greaterThan("createdAt", {"__type":"Date","iso":cutoffDate});
	miniRippleQuery.equalTo("isPropagated", null);
	miniRippleQuery.descending("createdAt");

	if (request.params.skip != null)
	{
		miniRippleQuery.skip(request.params.skip);
		miniRippleQuery.limit(25);
	}
	else
	{
		miniRippleQuery.limit(200);
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
		rippleQuery.limit(200);
		//rippleQuery.descending("numPropagated");

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
			ripple["isActedUpon"] = 0;
		 	ripple["isFollowing"] = 0;



		 	var following = user.get("following");

		 	if (following !=null)
		 	{
			 	if (following.indexOf(ripple["creatorId"]) != -1)
			 		ripple["isFollowing"] = 1;
			}

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


			// create sortMetric
			var createdTimestamp = Date.parse(rippleObject.createdAt);
			var difference = currentDate - createdTimestamp;
			var diffHours = difference/(1000*60*60);
			
			if (diffHours <=1)
				diffHours = 0.3;

			else if (diffHours <= 4)
				diffHours *= .5;

			/*else
				diffHours *= 0.5;

			if (diffHours ==0)
				diffHours = 1;
			*/

			var spread = ripple["numPropagated"];
			if (spread <=3 && diffHours <=4)
				spread = 3;

			ripple["sortMetric"] = 	spread/diffHours;

			if (ripple["isFollowing"] == true)
				ripple["sortMetric"] *=2.5;
		}

		// sort
		rippleArray.sort(function(a,b){
			return b["sortMetric"] - a["sortMetric"]
		});

		
		response.success(rippleArray);

	});
});