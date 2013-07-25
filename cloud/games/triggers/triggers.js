var _;

_ = require('underscore');

Parse.Cloud.beforeSave("Game", function(request, response) {
  var User, errors, gameTypes, query;
  gameTypes = ["one-on-one", "group-play", "reco-request"];
  if (request.object.existed() === false) {
    errors = false;
    if (request.object.get("current_round") !== 1) {
      request.object.set("current_round", 1);
    }
    User = Parse.Object.extend("User");
    query = new Parse.Query(User);
    query.equalTo("objectId", request.object.get("initiator").objectId);
    query.first({
      success: function(results) {
        if (results.length === 0) {
          response.error("User not found");
          return errors = true;
        }
      },
      error: function(error) {
        response.error("Finding initiator query failed");
        return errors = true;
      }
    });
    if (request.object.get("total_points") !== 0) {
      request.object.set("total_points", 0);
    }
    if (_.include(gameTypes, request.object.get("type")) === false) {
      response.error("Game type not recognized");
      errors = true;
    }
    if (errors === false) {
      return response.success();
    }
  } else {
    return response.success();
  }
});

Parse.Cloud.afterSave("Game", function(request) {
  var game, groupACL;
  if (request.object.existed() === false) {
    game = request.object;
    game.set("active", true);
    groupACL = new Parse.ACL();
    groupACL.setReadAccess(request.object.get("initiator"), true);
    groupACL.setWriteAccess(request.object.get("initiator"), true);
    game.setACL(groupACL);
    return game.save();
  }
});
