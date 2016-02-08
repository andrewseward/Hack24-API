var request = require('request');

export var Invite = function(email) {
  console.log("Inviting to Slack: " + email);
  var url = 'https://'+ process.env.SLACK_TEAM + '.slack.com/api/users.admin.invite';
  var requestData =  '{'
        + '"email":"' + email + '",'
        + '"token":"' + process.env.SLACK_TOKEN + '",'
        + '"set_active":"true"}';
  console.log('URL: ' + url + ', RequestData: ' + requestData);
  request.post({
      url: url,
      form:JSON.parse(requestData)
      },
      function(err, httpResponse, body) {
        console.log("Request sent");
        if (err) {
          console.log("Error inviting:" + err);
          return res.send('Error:' + err);
        }
        body = JSON.parse(body);
        if (!body.ok) {
          var error = body.error;
          console.log("Error returned:" + error);
          if (error === 'already_invited' || error === 'already_in_team') {
            console.log("Already in team");
            return;
          }
        }
        console.log("Slack email invited");
      });

};
