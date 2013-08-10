Parse.Cloud.beforeSave("Round", function(request, response) {
  var Round, query;
  Round = Parse.Object.extend("Round");
  query = new Parse.Query(Round);
  query.equalTo("game", request.object.get("game"));
  query.equalTo("round_number", request.object.get("round_number"));
  if (request.object.existed() === true) {
    query.notEqualTo("objectId", request.object.get("objectId"));
  }
  return query.first({
    success: function(object) {
      if (object === void 0 || object.length === 0) {
        return response.success();
      } else {
        return response.error("This round number already exists for this game");
      }
    },
    error: function(error) {
      console.log("\n\n\n");
      console.log("!! > Error creating round : " + error.code + " : " + error.message);
      return console.log("\n\n\n");
    }
  });
});

Parse.Cloud.afterSave("Round", function(request) {
  var Game, query, round,
    _this = this;
  if (request.object.existed() === false) {
    round = request.object;
    Game = Parse.Object.extend("Game");
    query = new Parse.Query(Game);
    query.equalTo("objectId", round.get("game").objectId);
    query.select("initiator");
    return query.first({
      success: function(initiator) {
        var groupACL;
        groupACL = new Parse.ACL();
        groupACL.setReadAccess(initiator.get("initiator"), true);
        groupACL.setWriteAccess(initiator.get("initiator"), true);
        groupACL.setPublicReadAccess(true);
        round.setACL(groupACL);
        round.save();
        initiator.set("current_round", request.object.get("round_number"));
        return initiator.save();
      },
      error: function(error) {
        console.log("\n\n ERROR finding game initiator in round afterSave: " + error.code + " : " + error.message);
        return console.log("Round objectId: " + round.get("objectId"));
      }
    });
  }
});
