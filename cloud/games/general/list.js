var _;

_ = require('underscore');

Parse.Cloud.define("listGames", function(request, response) {
  var currentUser, gameIds, gamePointers, gamesList, getGamesList, init, loadGames, loadMoves, loadPlayers, loadRounds, manifest, mergePlayerData, mergeRoundsAndMoves, models, payload;
  currentUser = request.params.user;
  models = {};
  gamesList = [];
  gameIds = [];
  gamePointers = [];
  payload = {};
  manifest = [];
  init = function() {
    models.Player = Parse.Object.extend("Player");
    models.Game = Parse.Object.extend("Game");
    models.Round = Parse.Object.extend("Round");
    models.Move = Parse.Object.extend("Move");
    return Parse.Promise.when(getGamesList()).then(function(results) {
      if (results.length === 0) {
        response.success("");
      }
      _.each(gamesList, function(el) {
        var tmp;
        tmp = {
          __type: "Pointer",
          className: "Game",
          objectId: el.game.objectId
        };
        return gamePointers.push(tmp);
      });
      return Parse.Promise.when(loadGames()).then(function(results) {
        _.each(results, function(game) {
          return manifest.push(game.toJSON());
        });
        return Parse.Promise.when(loadRounds()).then(function(rounds) {
          payload.rounds = [];
          _.each(rounds, function(round) {
            return payload.rounds.push(round.toJSON());
          });
          return Parse.Promise.when(loadMoves()).then(function(moves) {
            payload.moves = [];
            _.each(moves, function(move) {
              return payload.moves.push(move);
            });
            return Parse.Promise.when(mergeRoundsAndMoves()).then(function(data) {
              console.log("round and move merge complete");
              return Parse.Promise.when(loadPlayers()).then(function(results) {
                return response.success(manifest);
              });
            });
          });
        });
      });
    });
  };
  getGamesList = function() {
    var ggl_promise, pQuery;
    ggl_promise = new Parse.Promise();
    pQuery = new Parse.Query(models.Player);
    pQuery.equalTo("player", currentUser);
    return pQuery.find({
      success: function(results) {
        _.each(results, function(game) {
          return gamesList.push(game.toJSON());
        });
        return ggl_promise.resolve(results);
      },
      error: function(error) {
        response.error(error.code + ":" + error.message);
        return ggl_promise.reject(error);
      }
    });
  };
  loadGames = function() {
    var lg_promise, query;
    lg_promise = new Parse.Promise();
    gameIds = [];
    _.map(gamesList, function(el) {
      return gameIds.push(el.game.objectId);
    });
    query = new Parse.Query(models.Game);
    query.containedIn("objectId", gameIds);
    return query.find({
      success: function(results) {
        console.log("> loadGames success...");
        return lg_promise.resolve(results);
      },
      error: function(error) {
        return lg_promise.reject(error);
      }
    });
  };
  loadPlayers = function() {
    var lp_promise, query;
    console.log("loading players ...");
    lp_promise = new Parse.Promise();
    query = new Parse.Query(models.Player);
    query.containedIn("game", gamePointers);
    query.include("player");
    return query.find({
      success: function(results) {
        console.log("players fetched");
        console.log(results);
        payload.players = results;
        return Parse.Promise.when(mergePlayerData(results)).then(function(results) {
          return lp_promise.resolve(results);
        });
      }
    });
  };
  mergePlayerData = function(data) {
    var counter, mpd_promise, tmp;
    mpd_promise = new Parse.Promise();
    console.log("merging player data");
    tmp = {};
    _.each(data, function(player, i) {
      var game_id;
      game_id = player.get("game").toJSON().objectId;
      if (tmp[game_id] === void 0) {
        tmp[game_id] = [];
      }
      return tmp[game_id].push(player);
    });
    counter = 1;
    _.each(manifest, function(game, index) {
      manifest[index]['players'] = [];
      if (tmp[game.objectId]) {
        manifest[index].players = tmp[game.objectId];
      }
      if (counter === manifest.length) {
        console.log("> merging player success ....");
        return mpd_promise.resolve(manifest);
      } else {
        return counter++;
      }
    });
    return mpd_promise;
  };
  loadRounds = function() {
    var lr_promise, query;
    console.log("Fetching rounds...");
    lr_promise = new Parse.Promise();
    query = new Parse.Query(models.Round);
    query.containedIn("game", gamePointers);
    return query.find({
      success: function(results) {
        console.log("> loadRounds success....");
        return lr_promise.resolve(results);
      },
      error: function(error) {
        return lr_promise.reject(error);
      }
    });
  };
  loadMoves = function() {
    var lm_promise, query, roundPointers;
    lm_promise = new Parse.Promise();
    console.log("Fetching moves...");
    roundPointers = [];
    _.each(payload.rounds, function(el) {
      var tmp;
      tmp = {
        __type: "Pointer",
        className: "Round",
        objectId: el.objectId
      };
      return roundPointers.push(tmp);
    });
    query = new Parse.Query(models.Move);
    query.containedIn("round", roundPointers);
    query.include("media");
    query.include("user");
    return query.find({
      success: function(results) {
        console.log("> loadMoves success ....");
        return lm_promise.resolve(results);
      },
      error: function(error) {
        return lm_promise.reject(error);
      }
    });
  };
  mergeRoundsAndMoves = function() {
    var counter, mrm_promise, tmpMoves, tmpRounds;
    console.log("merging rounds and moves");
    mrm_promise = new Parse.Promise();
    tmpRounds = {};
    tmpMoves = {};
    _.each(payload.moves, function(move, i) {
      if (tmpMoves[move.get("round").toJSON().objectId] === void 0) {
        tmpMoves[move.get("round").toJSON().objectId] = [];
      }
      return tmpMoves[move.get("round").toJSON().objectId].push(move);
    });
    _.each(payload.rounds, function(round, i) {
      var round_game_id;
      console.log("creating tmpRounds table");
      round_game_id = round.game.objectId;
      if (tmpRounds[round_game_id] === void 0) {
        tmpRounds[round_game_id] = [];
      }
      if (tmpMoves[round.objectId]) {
        round.moves = tmpMoves[round.objectId];
      }
      return tmpRounds[round_game_id].push(round);
    });
    counter = 1;
    _.each(manifest, function(game, index) {
      manifest[index]['rounds'] = [];
      if (tmpRounds[game.objectId]) {
        console.log("adding to manifest");
        manifest[index].rounds = tmpRounds[game.objectId];
      }
      if (counter === manifest.length) {
        console.log("> merging success ....");
        return mrm_promise.resolve({
          test: true
        });
      } else {
        return counter++;
      }
    });
    return mrm_promise;
  };
  return init();
});
