

/******
	get comments for a ripple
*******/
Parse.Cloud.define("getCommentsForRipple", function(request, response) 
{
	// get rippleId
	var rippleId = request.params.rippleId;

	// call ripple
	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);
	var commentIds;
	var commentArray = [];

	rippleQuery.get(rippleId).then(function(rippleObject) {
		// get list of commentIds
		commentIds = rippleObject.get("commentIds");
	}).then(function() {
		// for each comment, loop through and get necessary information
		var Comment = Parse.Object.extend("Comment");
		var commentQuery = new Parse.Query(Comment);
		commentQuery.containedIn("objectId", commentIds);
		commentQuery.ascending("createdAt");

		if (commentIds)
		{
			commentQuery.find({
				success: function(comments)
				{
					for(var j=0; j<comments.length; j++)
					{

						var commentObject ={};
						commentObject["username"] = comments[j].get("creatorName");
						commentObject["userId"] = comments[j].get("creator").id;
						commentObject["comment"] = comments[j].get("comment");
						commentObject["createdAt"] = comments[j].createdAt;
						commentObject["id"] = comments[j].id;
						commentObject["country"] = comments[j].get("country");
						commentObject["state"] = comments[j].get("state");
						commentObject["city"] = comments[j].get("city");

						commentArray.push(commentObject);
					}	

					response.success(commentArray);
				},
				error: function(error)
				{
					console.log("error in fetching comment: " +error);
					response.error("error in fetching comment: " +error);
				}
			});
		}

		else
			response.success(commentArray);
	});
});

/******
	save a comment to a ripple
*******/	
Parse.Cloud.define("addCommentToRipple", function(request, response) 
{
	// grab comment text, creator, Date, rippleId, 
	var commentText = request.params.commentText;
	var creatorUsername = request.params.creatorUsername;
	var creatorId = request.params.creatorId;
	var rippleId = request.params.rippleId;
	

	var country = null;
	if (request.params.country != null)
	{
		country = request.params.country;
		var city = request.params.city;
		var state = request.params.state;
	}

	// create new comment
	var Comment = Parse.Object.extend("Comment");
	
	var newComment = new Comment();
	newComment.set("comment", commentText);
	newComment.set("creatorName", creatorUsername);

	if (country != null)
	{
		newComment.set("country", country);
		newComment.set("city", city);
		newComment.set("state", state);
	}


	// create empty Ripple and user objects for pointers
	var Ripple = Parse.Object.extend("Ripple");
	var tempRipple = new Ripple();
	tempRipple.id = rippleId;
	newComment.set("ripple", tempRipple);

	var creator = new Parse.User();
	creator.id = creatorId;
	newComment.set("creator", creator);

	
	// create push notifications
	sendPushToCommenters(country, creator, tempRipple, creatorUsername);

	// save and perform operation to update ripple
	var newCommentId;
	newComment.save(null, {
		success: function(contract) {
			response.success("saved comment");
		},
		error: function(error) {
			console.log("failed to save comment: "+ request.error);
		}
	});

});

function sendPushToCommenters (country, commentCreator, tempRipple, creatorUsername)
{
	// get comments dealing with the ripple
	var Comment = Parse.Object.extend("Comment");
	var Ripple = Parse.Object.extend("Ripple");

	// ripple creator
	var rippleCreator;
	var rippleQuery = new Parse.Query(Ripple);
	rippleQuery.get(tempRipple.id, {
		success: function(ripple)
		{
			rippleCreator = ripple.get("creator");
		},
		error: function(error)
		{
			console.log("failed to get Bellow creator. fahk");
		}
	}).then(function(){
		var commentQuery = new Parse.Query(Comment);
		commentQuery.equalTo("ripple", tempRipple);

		//var usersOutsideofCountry = [];
		var usersInsideCountry = [];
		usersInsideCountryIds = [];

		commentQuery.find({
			success: function(comments)
			{
				// for each, add the user to the list to push to the right list
				comments.forEach(function(comment)
				{
					if (comment.get("creator").id != commentCreator.id && comment.get("creator").id != rippleCreator.id)
					{
						// if (comment.get("country") == country)
						var check = usersInsideCountryIds.indexOf(comment.get("creator").id);

						if (check == -1)
						{
							usersInsideCountry.push(comment.get("creator"));
							usersInsideCountryIds.push(comment.get("creator").id);
							console.log("GOT " + comment.get("creator").id);
						}
						
						/*
						else
						{
							var check = usersOutsideofCountry.indexOf(comment.get("creator"));

							if (check == -1)	
							usersOutsideofCountry.push(comment.get("creator"));
						}
						*/
					}
				});


			},
			error: function(error)
			{
				console.log("error sending push for adding comment: " + error.message);
			}
		}).then(function() {
			// send 3 rounds of pushes
			// send creator push now
			if (rippleCreator.id !=commentCreator.id)
			{	
				// send push to ripple creator
				var pushQueryToRippleCreator = new Parse.Query(Parse.Installation);
				pushQueryToRippleCreator.equalTo('user', rippleCreator);
				Parse.Push.send({
					where: pushQueryToRippleCreator, // Set our Installation query
				    data: {
				  	  alert: creatorUsername +  " commented on a post you created",
				  	  badge: "Increment",
				  	  "rippleId" : tempRipple.id
				  }
				});

				// Create a notification
				var Notification = Parse.Object.extend("Notification");
				var notification = new Notification();
				notification.set("user", rippleCreator);
				notification.set("text", creatorUsername +  " commented on a post you created");
				notification.set("isRead", false);
				notification.set("isSeen", false);
				notification.set("type", "Comment");
				notification.set("rippleId", tempRipple.id);
				notification.save();

				console.log("we have sent a push notifiction to bellow creator");
			}

			if (usersInsideCountry.length >0)
			{
				var pushQueryInCountry = new Parse.Query(Parse.Installation);
				pushQueryInCountry.containedIn('user', usersInsideCountry);
				Parse.Push.send({
				  where: pushQueryInCountry, // Set our Installation query
				  data: {
				  	alert: creatorUsername + " replied to a post you commented on",
				  	badge: "Increment",
				  	"rippleId" : tempRipple.id
				  }
				});

				for (var i = 0; i < usersInsideCountry.length; i++)
				{
					var commentUser = usersInsideCountry[i];
					// Create a notification
					var Notification = Parse.Object.extend("Notification");
					var notification = new Notification();
					notification.set("user", commentUser);
					notification.set("text", creatorUsername + " replied to a post you commented on");
					notification.set("isRead", false);
					notification.set("isSeen", false);
					notification.set("type", "Comment");
					notification.set("rippleId", tempRipple.id);
					notification.save();
				}
			}		
		});
	});
}


/******
	when save a comment, add it to the commentIds of the ripple
*******/
Parse.Cloud.afterSave("Comment", function(request) {
	var newCommentId = request.object.id;
	var rippleId = request.object.get("ripple").id;

	// perform query for Ripple with the objectId
	var Ripple = Parse.Object.extend("Ripple");
	var rippleQuery = new Parse.Query(Ripple);
	rippleQuery.get(rippleId, {
	 	success: function(ripple) 
	  	{
  			ripple.addUnique("commentIds", newCommentId);

	  		ripple.save();
	  	},
	  	error: function(error) 
	  	{
	   		console.log("error adding commentId to ripple " + rippleId);
	  	}
	});
});