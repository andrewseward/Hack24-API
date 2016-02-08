import * as slackClient from '../slackClient';

export var Invite = function(req, res) {
  console.log("POST: ");
  console.log(req.body);
  if (('key' in req.query) && (req.query['key'] == process.env.MAILCHIMP_KEY)) {
    var email = '';
    if ('data[email]' in req.body)
      email = req.body['data[email]'];
    else
       email = req.body['email'];
    if (email != ''){
      slackClient.Invite(email);
      return res.status(200).send('OK');
    }
    return res.status(400).send('Invalid email');
  }
  return res.status(403).send('Who dis?');
};
export var Check = function(req, res) { //needed for mailchimp webhooks
  console.log("GET: ");
  console.log(req.body);
  if (('key' in req.query) && (req.query['key'] == process.env.MAILCHIMP_KEY)) {
    return res.status(200).send('Still here!');
  }
  return res.status(403).send('Who dis?');
};
