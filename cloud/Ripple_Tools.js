

/******
	delete a ripple

	input: Ripple object ID
*******/
Parse.Cloud.define("deleteRipple", function(request, response) 
{
	// get rippleId
	var rippleId = request.params.rippleId;

	// call ripple
	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);
	var rippleToDelete;



	rippleQuery.get(rippleId).then(function(rippleObject) {
		// check that user matches the ripple

		if (rippleObject.get("creator").id != request.user.id)
		{
			response.error("User deleting ripple he didn't start");
		}


		rippleToDelete = rippleObject;

		// get mini ripples
		var MiniRipple = Parse.Object.extend("MiniRipple");
		var miniRippleQuery = new Parse.Query(MiniRipple);
		miniRippleQuery.equalTo("ripple", rippleObject);
		miniRippleQuery.limit(1000);

		return miniRippleQuery.find();

	}).then(function(miniRippleArray) {
		// delete mini ripples
	
		if (miniRippleArray)
		{
			return Parse.Object.destroyAll(miniRippleArray);
		}
	//}).then(function() {
		//return Parse.Object.destroyAll([rippleToDelete]);
	}).then(function() {
		response.success(Parse.Object.destroyAll([rippleToDelete]));
	});
});

/******
	Kill a ripple - remove mini-ripples that haven't spread yet
******/
Parse.Cloud.define("killRipple", function(request, response) 
{
	var rippleId = request.params.rippleId;

	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);
	
	rippleQuery.get(rippleId).then(function(ripple) {
		//mark ripple as killed
		ripple.set("killed",true);
		ripple.save();
		
		// make miniripple requests. 
		var MiniRipple = Parse.Object.extend("MiniRipple");
		var miniRippleQuery = new Parse.Query(MiniRipple);
		
		var Ripple = Parse.Object.extend("Ripple");
		var tempRipple = new Ripple();
		tempRipple.id = rippleId;
		miniRippleQuery.equalTo("ripple", tempRipple);
		miniRippleQuery.doesNotExist("isPropagated");
		miniRippleQuery.limit(1000);

		return miniRippleQuery.find();

	}).then(function(miniRipples) {
		if (miniRipples.length > 1000)
		{
			response.error("More than 1000 mini ripples. Possibly an error?");
		}
		else
		{
			//response.success(miniRipples.length + " mini ripples found");
			return Parse.Object.destroyAll(miniRipples);
		}
	}).then(function() {
    	response.success("Successfully deleted mini-ripples");
	}, 	
	function(error) {
    	response.error("Failed to destroy mini-ripples");
	});
});

/******
	Grab the leaderboards
******/
Parse.Cloud.define("getLeaderboard", function(request, response) 
{
	var minScore = 5000;

	var levelArray = [];

	var Level = Parse.Object.extend("Level");
	var levelQuery = new Parse.Query(Level);
	levelQuery.greaterThanOrEqualTo("minScore", minScore);
	levelQuery.descending("minScore");

	levelQuery.find().then(function(levelObjects) 
	{
		for (var i = 0; i < levelObjects.length; i++)
		{
			var levelObject = levelObjects[i];
			var level = {};
			level["minScore"] = levelObject.get("minScore");
			level["name"] = levelObject.get("name");
			level["reach"] = levelObject.get("reach");
			level["userArray"] = [];
			levelArray.push(level);
		}

		var userQuery = new Parse.Query(Parse.User);
		userQuery.descending("score");
		userQuery.greaterThanOrEqualTo("score", minScore);

		return userQuery.find();
	}).then(function(userObjects) 
	{
		for (var i = 0; i < userObjects.length; i++)
		{
			for (var j = 0; j < levelArray.length; j++)
			{
				var userObject = userObjects[i];
				if (userObject.get("score") >= levelArray[j]["minScore"])
				{
					var user = {};
					user["username"] = userObject.get("username");
					user["highestPropagated"] = userObject.get("highestPropagated");
					user["score"] = userObject.get("score");
					levelArray[j]["userArray"].push(user);
					break;
				}
			}
		}
	}).then(function() 
	{
		response.success(levelArray);
	});
});