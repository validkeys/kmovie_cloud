var _;

_ = require('underscore');

Parse.Cloud.define("listGames", function(request, response) {
  var currentUser, gameIds, gamesList, getGamesList, getRounds, init, loadGames, loadPlayers, manifest, mergePlayerData, models, payload;
  models = {};
  currentUser = {};
  gamesList = [];
  gameIds = [];
  payload = {};
  manifest = [];
  init = function() {
    currentUser = request.params.user;
    return Parse.Promise.when(getGamesList()).then(function(results) {
      console.log("getGamesList complete");
      return Parse.Promise.when(loadGames()).then(function(results) {
        _.each(results, function(game) {
          return manifest.push(game);
        });
        console.log(manifest);
        console.log("loadGames complete");
        return Parse.Promise.when(loadPlayers()).then(function(results) {
          console.log("loadPlayers complete");
          return console.log(manifest);
        });
      });
    });
  };
  getGamesList = function() {
    var pQuery;
    console.log("Fetching games...");
    models.Player = Parse.Object.extend("Player");
    pQuery = new Parse.Query(models.Player);
    pQuery.equalTo("player", currentUser);
    return pQuery.find({
      success: function(results) {
        gamesList = results;
        return results;
      },
      error: function(error) {
        response.error(error.code + ":" + error.message);
        return error;
      }
    });
  };
  loadGames = function() {
    var query;
    console.log("loadGames");
    gameIds = [];
    _.map(gamesList, function(el) {
      return gameIds.push(el.get("game").toJSON().objectId);
    });
    models.Game = Parse.Object.extend("Game");
    query = new Parse.Query(models.Game);
    query.containedIn("objectId", gameIds);
    return query.find();
  };
  loadPlayers = function() {
    var gamePointers, query;
    console.log("loadPlayers");
    query = new Parse.Query(models.Player);
    gamePointers = [];
    _.map(gamesList, function(el) {
      var tmp;
      tmp = {
        __type: "Pointer",
        className: "Game",
        objectId: el.get("game").toJSON().objectId
      };
      return gamePointers.push(tmp);
    });
    query.containedIn("game", gamePointers);
    return query.find({
      success: function(results) {
        return Parse.Promise.when(mergePlayerData(results)).then(function(results) {
          return results;
        });
      }
    });
  };
  mergePlayerData = function(data) {
    var tmp;
    console.log("merging player data");
    tmp = {};
    _.each(data, function(player, i) {
      console.log("creating tmp table");
      if (tmp[player.get("game").toJSON().objectId] === void 0) {
        tmp[player.get("game").toJSON().objectId] = [];
      }
      return tmp[player.get("game").toJSON().objectId].push(player);
    });
    _.each(manifest, function(game, index) {
      console.log("game loop");
      game = game.toJSON();
      manifest[index]['players'] = [];
      if (tmp[game.objectId]) {
        console.log("adding to manifest");
        return manifest[0].kyle = "fun";
      }
    });
    console.log("calling true");
    return true;
  };
  getRounds = function() {
    var Round;
    console.log("Fetching rounds...");
    console.log(payload);
    Round = Parse.Object.extend("Round");
    return _.each(payload, function(game, index) {
      var query;
      console.log(index);
      query = new Parse.Query(Round);
      query.equalTo("game", game);
      return query.find({
        success: function(game, rounds) {},
        error: function(error) {
          console.log("> Error");
          return console.log(error);
        }
      });
    });
  };
  return init();
});
