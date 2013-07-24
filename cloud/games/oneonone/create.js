Parse.Cloud.define("saveNewGame", function(request, response) {
  var checkForSuccess, complete, createGame, createMove, createPlayer, createRound, init, instances, objs, returnMediaPointer, saveGame, saveMoves, savePlayers, success, triggerCallback;
  init = function() {
    createGame();
    createRound();
    createPlayer();
    createMove();
    return saveGame();
  };
  createGame = function() {
    objs.Game = Parse.Object.extend("Game");
    return instances.game = new objs.Game(request.params.game);
  };
  createRound = function() {
    objs.Round = Parse.Object.extend("Round");
    instances.round = new objs.Round(request.params.round);
    return instances.round.set("game", instances.game);
  };
  createMove = function(callback) {
    var i, m, media_data, media_type, query, _results;
    objs.Media = Parse.Object.extend("Media");
    objs.Move = Parse.Object.extend("Move");
    i = request.params.moves.length - 1;
    _results = [];
    while (i >= 0) {
      media_type = request.params.moves[i].media_type;
      media_data = request.params.moves[i].media;
      delete request.params.moves[i].media;
      m = new objs.Move(request.params.moves[i]);
      m.set("round", instances.round);
      query = new Parse.Query(objs.Media);
      query.equalTo("api_id", media_data.api_id);
      query.first({
        success: function(results) {
          var media;
          if (results === undefined || results.length === 0) {
            media = new objs.Media(media_data);
            return media.save(null, {
              success: function(media) {
                m.set("media", returnMediaPointer(media));
                instances.movesToSave.push(m);
                if (i === -1) {
                  console.log("Calling saveMoves...");
                  return saveMoves();
                }
              },
              error: function(error) {
                console.log("Media not created");
                response.error(error);
                return false;
              }
            });
          } else {
            m.set("media", returnMediaPointer(results));
            instances.movesToSave.push(m);
            if (i === -1) {
              console.log("Calling saveMoves...");
              return saveMoves();
            }
          }
        },
        error: function(error) {
          console.log("Query Error on findOrReturnMedia");
          console.log(error);
          return false;
        }
      });
      _results.push(i--);
    }
    return _results;
  };
  createPlayer = function() {
    var i, p, playersToSave;
    objs.Player = Parse.Object.extend("Player");
    playersToSave = [];
    i = request.params.players.length - 1;
    while (i >= 0) {
      p = new objs.Player(request.params.players[i]);
      p.set("game", instances.game);
      playersToSave.push(p);
      i--;
    }
    return instances.playersToSave = playersToSave;
  };
  saveGame = function() {
    return instances.round.save(null, {
      success: function(round) {
        console.log("saved game and round");
        success.game = true;
        savePlayers();
        complete.game = true;
        return checkForSuccess();
      },
      error: function(error) {
        throw "Got an error " + error.code + " : " + error.message;
        complete.game = true;
        return checkForSuccess();
      }
    });
  };
  savePlayers = function() {
    console.log("Saving " + instances.playersToSave.length + " players");
    return Parse.Object.saveAll(instances.playersToSave, {
      success: function(obj) {
        console.log("Players Saved...");
        success.players = true;
        complete.players = true;
        return checkForSuccess();
      },
      error: function(obj, error) {
        console.log("\n\n ERROR!! - from savePlayers");
        console.log(error);
        complete.players = true;
        return checkForSuccess();
      }
    });
  };
  saveMoves = function() {
    console.log("Saving " + instances.movesToSave.length + " moves");
    return Parse.Object.saveAll(instances.movesToSave, {
      success: function(obj) {
        success.move = true;
        console.log("Moves Saved...");
        complete.move = true;
        return checkForSuccess();
      },
      error: function(obj, error) {
        console.log("\n\n ERROR!! - from saveMoves");
        console.log(error);
        complete.move = true;
        return checkForSuccess();
      }
    });
  };
  checkForSuccess = function() {
    var allDone, allSuccessful, key;
    allDone = true;
    allSuccessful = true;
    for (key in complete) {
      if (complete[key] === false) {
        allDone = false;
      }
    }
    if (allDone === true) {
      console.log("All done...");
      for (key in success) {
        if (success[key] === false) {
          allSuccessful = false;
        }
      }
      if (allSuccessful === true) {
        return response.success("Your game was created");
      } else {
        return response.error("There was a problem creating your game");
      }
    } else {
      return console.log("Still waiting...");
    }
  };
  returnMediaPointer = function(result) {
    var id, pointer;
    if (result.objectId !== undefined) {
      id = result.objectId;
    } else {
      id = result.id;
    }
    pointer = {
      __type: "Pointer",
      className: "Media",
      objectId: id
    };
    console.log("\n\n-----------------");
    console.log(pointer);
    console.log("\n\n-----------------");
    return pointer;
  };
  triggerCallback = function(callback, data) {
    console.log("Triger...");
    return callback.call(data);
  };
  objs = {};
  instances = {};
  complete = {
    game: false,
    players: false,
    move: false
  };
  success = {
    game: false,
    players: false,
    move: false
  };
  instances.movesToSave = [];
  return init();
});
