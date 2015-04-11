
var
  log = require('./hendrix').log,
  localConfig = require('../../winter-bandpad/public/js/localConfig'),
  request = require("request"),
  crypto = require('crypto'),
  _ = require('underscore'),
  sendgrid  = require('sendgrid')('amitgur', 'hendrix123');

exports.sendAppMail = function (subject, text, callback){

  var
    email = new sendgrid.Email({
      to:       localConfig.APP_SYSTEM_MAIL,
      from:     localConfig.APPMAIL,
      subject:  subject,
      html: text
    });

  sendgrid.send(email, function(err, json) {
    if (err) {
      log(err);
      return callback(err);
    }
    log("send system mail: " + text);
    return callback();
  });
}


exports.sendAppTemplateMail = function (toEmail, context, template, callback){

  var
    registerData = require('../../winter-bandpad/config/registerData')[template];

  // add prices
  context = _.extend(localConfig.BANDPAD_PRICES, context);


  request.post({
      url:'https://a.klaviyo.com/api/v1/email-template/' + registerData.template + '/render',
      form: {
        context: JSON.stringify(context),
        api_key: 'pk_b6ed4d5e280550fd9b4a319faf40be55ad'
      }
    },
    function(err,httpResponse,body){
      if (httpResponse.statusCode !== 200) {

        // todo: on error, send mail to admin and show simple error to user
        var error = JSON.parse(body).message;
        log(err);
        return callback(error);
      }

      var emailTemplate = JSON.parse(body);

      var email = new sendgrid.Email({
        to:       toEmail,
        from:     localConfig.APPMAIL,
        subject:  registerData.subject,
        html: emailTemplate.data.html,
        text: emailTemplate.data.text
      });
      sendgrid.send(email, function(err, json) {
        if (err) {
          log(err);
          return callback(err);
        }
        log("send " + template+ " mail to: " + toEmail);
        return callback();
      });
    });
}

