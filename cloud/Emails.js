/*******
	Parse Job to send emails to new users
********/
Parse.Cloud.job("sendIntroEmail", function(request, status) 
{


	// email text
	var emailHTMLs = ["<body style='font-family: sans-serif; background-color:#f4f5f6; align:center;'><div style='border-collapse: collapse; border-radius:5px; width:600px;display:block; margin:0 auto;background-color:#fff' ><!-- Header--><div style= 'background-color:#0867ab;height:600px0px;padding:10px'><a href='http://getRipple.io'><img class='rippleImg' id='rippleImg' src='http://i.imgur.com/jpFF83L.png' height='55px' padding-top='10px'></a><div style='float:right'><p style='padding: 2px 10px 0px 0px; align:center'><span style='align:center'><a href='https://twitter.com/RippleMeThis'><img src='http://i.imgur.com/YaSuV6L.png' width='30px'></a>&nbsp; &nbsp;<a href='https://www.facebook.com/exploreRipple'><img src='http://i.imgur.com/DKfGlqd.png' width='30px'></a>&nbsp; &nbsp;<a href='http://instagram.com/ripple.app'><img src='http://i.imgur.com/s1IWrSm.png' width='30px'></a>&nbsp; &nbsp;<a href='https://medium.com/@RippleMeThis'><img src='http://i.imgur.com/x0DStK1.png' width='30px'></a></span></p></div></div><!-- Main content--><div style='width:600px; display:block; margin:0 auto; color:#055a93; padding:30px;' ><p style='font-size:18px; padding:0px 40px 0px 0px; color:#055a93;' align='left' >Hi ", ", </p><p style='font-size:18px; padding: 0px 40px 0px 0px; color:#055a93;' align='left'>Welcome to Ripple! Are you ready for an adventure? </p><p style='font-size:18px; padding: 0px 40px 0px 0px; color:#055a93;' align='left'>Ripple empowers you to share with new audiences around the world.<br/><br/><br><img src='http://i.imgur.com/6h6xqms.jpg' width='540px' align='left;''></p><p style='font-size:18px; padding: 0px 50px 0px 0px; color:#055a93;' align='left'>Our world is full of passionate people, beautiful places, and vibrant cultures. Everyone should be able to experience its diversity anytime, anywhere. That is why we built Ripple -- to empower you to share your passions, photos, thoughts, and jokes all over the world. </p><p style='padding: 0px 0px 0px 0px'><p style='font-size:36px; padding:30px 0px 0px 0px; color:#055a93;'><b><i>Get started:</i></b></p><ol style='font-size:18px; padding:px 10px 0px 0px; color:#055a93;' align = 'center;'><p><li>Swipe right to spread a ripple, and left to dismiss it.</li></p><p><li>Tap on a ripple to see the map or add a comment.</li></p><p><li>Start a ripple yourself and watch it spread!</li></p><p><li>Lastly, follow people that interest you!</li></p></ol></p><p style='font-size:18px; text-align:center;padding:20px 50px 0px 0px; color:#055a93;'>Learn more about <a href='http://www.getRipple.io/howitworks.html' target='_blank'>how it works</a></p></div><hr size='1'><div style='margin-top:20px;'><!-- Signature --><p align='center' style='font-size:24px; color:#055a93; height:40px; padding:20px'>Have feedback/questions? Email or <a href='https://twitter.com/ripplemethis' target='_blank'>tweet</a> at us.</p></div></div></body>"];

	//current time and cutoff Date
	var currentDate = Date.now();
	var timeDelta = 3600*1000 * 2; //last number is number of hours
	var cutoffDate = new Date(currentDate - (timeDelta));

	var Mandrill = require('mandrill');
	Mandrill.initialize('olbClql1REx5wStRa3IcOg');

	// query for all users who were created in the last 12 hours. 
	var userQuery = new Parse.Query(Parse.User);
	userQuery.greaterThan("createdAt", cutoffDate);

	userQuery.find({
		success:function(users)
		{
			var emailList = [];

			users.forEach(function(user) 
			{
				//grab email and add to emailList
				if (user.get("email"))
				{
					emailList.push({"username":user.get("username"), "email":user.get("email")});
				}
			});

			//now send an email!
			for (var i=0; i<emailList.length; i++)
			{

				// send email
				Mandrill.sendEmail({
				message: {
						html: emailHTMLs[0] + emailList[i]["username"] + emailHTMLs[1],
						subject: "Welcome to Ripple!",
						from_email: "wellRippleMeThis@gmail.com",
						from_name: "Ripple",
						to: [
						  {
						    email: emailList[i]["email"],
						    name: emailList[i]["username"]
						  }
						]
					},
					async: true
					},{
						success: function(httpResponse) {
							console.log("sent an email to " + emailList[i]["username"]);
						},
						error: function(httpResponse) 
						{
							console.error(httpResponse);
							status.error("Uh oh, something went wrong");
						}
					}
				);
			}

			status.success("sent mails to " + emailList.length + " people");
		},
		error:function(error)
		{
			status.error("error in query for users: " + error);
		}
	});
});
