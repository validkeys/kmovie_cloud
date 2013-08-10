var _,
  __slice = [].slice;

_ = require('underscore');

Parse.Cloud.define("mediaFindOrCreate", function(request, response) {
  var Media, data, mQuery;
  console.log("Media find or create");
  data = request.params;
  if ((data.api_id != null) && data.type === "movie") {
    Media = Parse.Object.extend("Media");
    mQuery = new Parse.Query(Media);
    mQuery.equalTo("api_id", data.api_id);
    mQuery.equalTo("type", "movie");
    return mQuery.first({
      success: function(result) {
        var newMedia;
        console.log("Result:\n");
        console.log(result);
        if (result !== void 0 && result.length !== 0) {
          return response.success(result);
        } else {
          data.imported = false;
          delete data.id;
          newMedia = new Media();
          console.log("saving:\n");
          console.log(data);
          return newMedia.save(data, {
            success: function(result) {
              console.log("SUCCESS!");
              return response.success(result);
            },
            error: function() {
              var args;
              args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
              console.log(args);
              throw "Error!: ";
              return response.error("Error!");
            }
          });
        }
      },
      error: function(msg) {
        throw "Error" + error.code + ": " + error.message;
      }
    });
  }
});

Parse.Cloud.define("checkForNewRound", function(request, response) {
  var Move, Round, checkRound, data, mQuery, moves_num, player_num, round, roundPointer;
  data = request.params.toJSON();
  moves_num = 0;
  player_num = 0;
  round = data.round;
  roundPointer = {
    __type: "Pointer",
    className: "Round",
    objectId: round.objectId
  };
  Move = Parse.Object.extend("Move");
  mQuery = new Parse.Query(Move);
  mQuery.equalTo("round", roundPointer);
  mQuery.count({
    success: function(num_moves) {
      moves_num = num_moves;
      return console.log("Theres are " + num_moves + " moves in this round");
    }
  });
  Round = Parse.Object.extend("Round");
  checkRound = new Round({
    objectId: round.objectId
  });
  return checkRound.fetch({
    success: function(data) {
      var Player, game, pQuery;
      game = data.get("game");
      Player = Parse.Object.extend("Player");
      pQuery = new Parse.Query(Player);
      pQuery.equalTo("game", game);
      pQuery.equalTo("accepted", true);
      return pQuery.count({
        success: function(player_count) {
          player_num = player_count;
          console.log("There are " + player_count + " players in this round");
          if (moves_num === player_num) {
            return Parse.Cloud.run("latestRound", {
              game: game.toJSON().objectId
            }, {
              success: function(results) {
                var newRound, round_number;
                round_number = results.get("round_number");
                newRound = new Round();
                data = {
                  game: game,
                  round_number: round_number + 1
                };
                return newRound.save(data, {
                  success: function(result) {
                    return response.success(result);
                  },
                  error: function(error) {
                    throw "Error creating new round";
                    return console.log(error);
                  }
                });
              }
            });
          }
        },
        error: function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          console.log("!ERROR!");
          return console.log(args);
        }
      });
    }
  });
});
