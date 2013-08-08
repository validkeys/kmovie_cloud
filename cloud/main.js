var moment, _;

moment = require('moment');

_ = require('underscore');

require('cloud/games/triggers/triggers.js');

require('cloud/games/oneonone/create.js');

require('cloud/games/general/list.js');

require('cloud/round/triggers/triggers.js');

require('cloud/media/general.js');

require('cloud/media/triggers/triggers.js');

require('cloud/move/triggers/triggers.js');

require('cloud/player/triggers/triggers.js');

Parse.Cloud.beforeSave("Friend", function(request, response) {
  var friend, mainQuery, meQuery, themQuery;
  if (request.object.existed() === false) {
    friend = Parse.Object.extend("Friend");
    themQuery = new Parse.Query(friend);
    meQuery = new Parse.Query(friend);
    meQuery.equalTo("initiator", request.object.get("initiator"));
    meQuery.equalTo("recipient", request.object.get("recipient"));
    themQuery.equalTo("initiator", request.object.get("recipient"));
    themQuery.equalTo("recipient", request.object.get("in"));
    mainQuery = new Parse.Query.or(meQuery, themQuery);
    return mainQuery.find({
      success: function(results) {
        if (results.length > 0) {
          return response.error("Friend already exists");
        } else {
          return response.success();
        }
      },
      error: function(error) {
        return response.error(error);
      }
    });
  } else {
    return response.success();
  }
});

Parse.Cloud.afterSave("Friend", function(request) {
  var friend, groupACL, initiator, notification, recipient;
  initiator = request.object.get("initiator");
  recipient = request.object.get("recipient");
  friend = request.object;
  groupACL = new Parse.ACL();
  groupACL.setReadAccess(request.object.get("initiator"), true);
  groupACL.setWriteAccess(request.object.get("initiator"), true);
  groupACL.setReadAccess(request.object.get("recipient"), true);
  groupACL.setWriteAccess(request.object.get("recipient"), true);
  friend.setACL(groupACL);
  friend.save();
  notification = new Parse.Object("Notification");
  if (request.object.existed()) {
    return notification.save({
      user: initiator,
      item: "friend",
      descr: "request accepted",
      ref: request.object,
      msg: them.get("first_name") + " has accepted your friend request",
      recipient: recipient
    }, {
      success: function(notification) {
        return console.log("Notification created");
      },
      error: function(error) {
        throw "Got an error" + error.code + " : " + error.message;
      }
    });
  } else {
    return notification.save({
      user: recipient,
      item: "friend",
      descr: "request created",
      ref: request.object,
      msg: initiator.get("first_name") + " wants to be your friend",
      them: initiator
    }, {
      success: function(notification) {
        return console.log("Notification created");
      },
      error: function(error) {
        throw "Got an error" + error.code + " : " + error.message;
      }
    });
  }
});

Parse.Cloud.define("userSearch", function(request, response) {
  var query, user;
  if (request.params.q) {
    user = Parse.Object.extend("_User");
    query = new Parse.Query(user);
    query.startsWith("first_name", request.params.q);
    return query.find({
      success: function(results) {
        return response.success(results);
      },
      error: function() {
        return response.error("Couldnt find anything");
      }
    });
  } else {
    throw "No search params supplied";
  }
});
