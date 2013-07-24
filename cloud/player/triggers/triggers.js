var _;

_ = require('underscore');

Parse.Cloud.beforeSave("Player", function(request, response) {
  var Player, checkForComplete, complete, errors, key, query;
  errors = false;
  complete = {
    player_unique: false
  };
  checkForComplete = function() {
    var allDone, key;
    allDone = true;
    for (key in complete) {
      if (complete[key] === false) {
        allDone = false;
      }
    }
    if (allDone === true && errors === false) {
      return response.success();
    }
  };
  if (request.object.existed() === false) {
    Player = Parse.Object.extend("Player");
    query = new Parse.Query(Player);
    query.equalTo("player", request.object.get("player"));
    query.equalTo("game", request.object.get("game"));
    return query.first({
      success: function(object) {
        if (object === void 0 || object.length === 0) {
          complete.player_unique = true;
        } else {
          errors = true;
          response.error("Player already exists in this game");
        }
        return checkForComplete();
      },
      error: function(error) {
        response.error("Error checking for player existence: " + error.code(" : " + error.message));
        errors = true;
        return checkForComplete();
      }
    });
  } else {
    for (key in complete) {
      complete[key] = true;
    }
    return checkForComplete();
  }
});

Parse.Cloud.afterSave("Player", function(request) {
  var Game, player, query,
    _this = this;
  if (request.object.existed() === false) {
    player = request.object;
    Game = Parse.Object.extend("Game");
    query = new Parse.Query(Game);
    query.equalTo("objectId", player.get("game").objectId);
    query.select("initiator");
    return query.first({
      success: function(initiator) {
        var groupACL;
        console.log("\n\n----------------");
        console.log(initiator);
        console.log("\n\n----------------");
        groupACL = new Parse.ACL();
        groupACL.setReadAccess(request.object.get("player"), true);
        groupACL.setWriteAccess(request.object.get("player"), true);
        groupACL.setReadAccess(initiator.get("initiator"), true);
        groupACL.setWriteAccess(initiator.get("initiator"), true);
        groupACL.setPublicReadAccess(true);
        player.setACL(groupACL);
        return player.save();
      },
      error: function(error) {
        console.log("\n\n ERROR finding game initiator: " + error.code + " : " + error.message);
        return console.log("Player objectId: " + player.get("objectId"));
      }
    });
  }
});
