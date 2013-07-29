var currentUser, gameIds, gamesList, getGamesList, getRounds, init, loadGames, loadPlayers, manifest, mergePlayerData, models, payload;

models = {};

currentUser = {};

gamesList = [];

gameIds = [];

payload = {};

manifest = [];

init = function() {
  models.Player = Parse.Object.extend("Player");
  models.Game = Parse.Object.extend("Game");
  currentUser = {
    __type: "Pointer",
    className: "_User",
    objectId: "C21b7TAQBB"
  };
  return $.when(getGamesList()).then(function(results) {
    console.log("getGamesList complete");
    return $.when(loadGames()).then(function(results) {
      _.each(results, function(game) {
        return manifest.push(game);
      });
      console.log(manifest);
      console.log("loadGames complete");
      return $.when(loadPlayers()).then(function(results) {
        console.log("loadPlayers complete");
        return console.log(manifest);
      });
    });
  });
};

getGamesList = function() {
  var fixtureData;
  console.log("Fetching games...");
  fixtureData = [
    {
      "game": {
        "__type": "Pointer",
        "className": "Game",
        "objectId": "zpWR6UtdK3"
      },
      "player": {
        "__type": "Pointer",
        "className": "_User",
        "objectId": "C21b7TAQBB"
      },
      "accepted": true,
      "createdAt": "2013-07-27T21:25:06.079Z",
      "updatedAt": "2013-07-27T21:25:06.524Z",
      "objectId": "IvAJmISUmL",
      "ACL": {
        "C21b7TAQBB": {
          "read": true,
          "write": true
        },
        "*": {
          "read": true
        }
      }
    }, {
      "game": {
        "__type": "Pointer",
        "className": "Game",
        "objectId": "dGR7HZeJqh"
      },
      "player": {
        "__type": "Pointer",
        "className": "_User",
        "objectId": "C21b7TAQBB"
      },
      "accepted": true,
      "createdAt": "2013-07-27T21:09:42.847Z",
      "updatedAt": "2013-07-27T21:09:43.076Z",
      "objectId": "vCswqNVXjz",
      "ACL": {
        "C21b7TAQBB": {
          "read": true,
          "write": true
        },
        "*": {
          "read": true
        }
      }
    }
  ];
  return fixtureData;
};

loadGames = function() {
  var fixtureData;
  console.log("loadGames");
  fixtureData = [
    {
      "initiator": {
        "__type": "Pointer",
        "className": "_User",
        "objectId": "C21b7TAQBB"
      },
      "active": true,
      "current_round": 1,
      "total_points": 0,
      "type": "one-on-one",
      "ACL": {
        "C21b7TAQBB": {
          "read": true,
          "write": true
        }
      },
      "objectId": "dGR7HZeJqh",
      "createdAt": "2013-07-27T21:09:39.887Z",
      "updatedAt": "2013-07-27T21:09:40.530Z",
      "__type": "Object",
      "className": "Game"
    }, {
      "initiator": {
        "__type": "Pointer",
        "className": "_User",
        "objectId": "C21b7TAQBB"
      },
      "active": true,
      "current_round": 1,
      "total_points": 0,
      "type": "one-on-one",
      "ACL": {
        "C21b7TAQBB": {
          "read": true,
          "write": true
        }
      },
      "objectId": "zpWR6UtdK3",
      "createdAt": "2013-07-27T21:25:00.075Z",
      "updatedAt": "2013-07-27T21:25:00.715Z",
      "__type": "Object",
      "className": "Game"
    }
  ];
  return fixtureData;
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

init();
