var _;

_ = require('underscore');

Parse.Cloud.useMasterKey();

Parse.Cloud.define("latestRound", function(request, response) {
  var Round, gamePointer, game_object_id, query;
  game_object_id = request.params.game;
  Round = Parse.Object.extend("Round");
  query = new Parse.Query(Round);
  gamePointer = {
    __type: "Pointer",
    className: "Game",
    objectId: game_object_id
  };
  query.equalTo("game", gamePointer);
  query.descending("round_number");
  return query.first({
    success: function(results) {
      return response.success(results);
    },
    error: function(error) {
      throw "error finding latest round";
      return response.error("Error");
    }
  });
});
