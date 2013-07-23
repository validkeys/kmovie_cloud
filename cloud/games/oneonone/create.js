Parse.Cloud.define("saveNewGame", function(request, response){


	// Placeholder for objects
	// -----------------------
	
	var objs = {};
	var instances = {};

	var complete = {
		game: false,
		players: false,
		move: false
	};

	var success = {
		game: false,
		players: false,
		move: false
	};

	instances.movesToSave = [];



	function init(){
		createGame();
		createRound();
		createPlayer();
		createMove();
		saveGame();
	}





	// ++++++++++++++++++
	// Create the Game
	// ++++++++++++++++++

	function createGame(){
		objs.Game = Parse.Object.extend("Game");
		instances.game = new objs.Game(request.params.game);
	}







	// ++++++++++++++++++
	// Create the Round
	// ++++++++++++++++++

	function createRound(){
		objs.Round = Parse.Object.extend("Round");
		instances.round = new objs.Round(request.params.round);
		instances.round.set("game", instances.game);
	}








	// +++++++++++++++++++++
	// Create the first move
	// +++++++++++++++++++++
	
	function createMove(callback){


		objs.Media 	= Parse.Object.extend("Media");
		objs.Move 	= Parse.Object.extend("Move");




		for (var i = request.params.moves.length - 1; i >= 0; i--) {

			var media_type = request.params.moves[i].media_type;

			var media_data = request.params.moves[i].media;
			delete request.params.moves[i].media;

			var m = new objs.Move(request.params.moves[i]);

			// console.log(request.params.moves[i]);

			// media_opts = {
			// 	type: request.params.moves[i].media_type,
			// 	data: request.params.moves[i].media
			// };

			m.set("round", instances.round);

			var query = new Parse.Query(objs.Media);
			// console.log({"type":media_type,"api_id":media_data.api_id});
			query.equalTo("api_id", media_data.api_id);
			// query.equalTo("type",media_type);
			query.first({
				success: function(results){
					// console.log("Search Results:");
					// console.log(results);

					if(results == undefined || results.length == 0){
						// console.log("Creating media...");
						var media = new objs.Media(media_data);
						media.save(null,{
							success: function(media){
								m.set("media", returnMediaPointer(media));
								instances.movesToSave.push(m);

								// This is a hack but it's late
								// fuck...
								if(i === -1){
									console.log("Calling saveMoves...");
									saveMoves();
								}

							},
							error: function(error){
								console.log("Media not created");
								response.error(error);
								return false;
							}
						});
					}else{
						m.set("media", returnMediaPointer(results));
						instances.movesToSave.push(m);


						// This is a hack but it's late
						// fuck...
						if(i === -1){
							console.log("Calling saveMoves...");
							saveMoves();
						}
					}

				},
				error: function(error){
					console.log("Query Error on findOrReturnMedia");
					console.log(error);
					return false;
				}
			});

		};
	}


	




	// ++++++++++++++++++
	// Create the Players
	// ++++++++++++++++++

	function createPlayer(){
		objs.Player = Parse.Object.extend("Player");

		var playersToSave = [];

		for (var i = request.params.players.length - 1; i >= 0; i--) {
			var p = new objs.Player(request.params.players[i]);
			p.set("game", instances.game);
			playersToSave.push(p);
		};

		instances.playersToSave = playersToSave;
	}




	// --------------
	// Saves
	// --------------

	function saveGame(){
		instances.round.save(null,{
			success: function(round){
				console.log("saved game and round");
				success.game = true;
				savePlayers();
				complete.game = true;
				checkForSuccess();
			},
			error: function(error){
				console.log("\n\n ERROR!! - from saveGame");
				console.log(error);
				complete.game = true;
				checkForSuccess();
			}
		});
		
	}

	function savePlayers(){

		console.log("Saving " + instances.playersToSave.length + " players");

		Parse.Object.saveAll(instances.playersToSave,{
			success: function(obj){
				console.log("Players Saved...");
				success.players = true;
				complete.players = true;
				checkForSuccess();
			},
			error: function(obj, error){
				console.log("\n\n ERROR!! - from savePlayers");
				console.log(error)
				complete.players = true;
				checkForSuccess();
			}
		});

	}


	function saveMoves(){

		console.log("Saving " + instances.movesToSave.length + " moves");

		Parse.Object.saveAll(instances.movesToSave,{
			success: function(obj){
				success.move = true;
				console.log("Moves Saved...");
				complete.move = true;
				checkForSuccess();
			},
			error: function(obj, error){
				console.log("\n\n ERROR!! - from saveMoves");
				console.log(error)
				complete.move = true;
				checkForSuccess();
			}
		});


	}



	function checkForSuccess(){

		allDone 		= true;
		allSuccessful 	= true;

		for (var key in complete){
			if (complete[key] === false){
				allDone = false;
			}
		}

		if (allDone === true){
			console.log("All done...");

			for (var key in success){
				if (success[key] === false){
					allSuccessful = false;
				}
			}

			if(allSuccessful === true){
				response.success("Your game was created");
			} else {
				response.error("There was a problem creating your game");
			}

		} else {
			console.log("Still waiting...");
		}

	}


	// Helpers ->

	function returnMediaPointer(result)	{

		if(result.objectId !== undefined){
			id = result.objectId;
		}else{
			id = result.id;
		}

		pointer = {
			"__type": 		"Pointer",
			"className": 	"Media",
			"objectId": 	id
		};
		console.log("\n\n-----------------");
		console.log(pointer);
		console.log("\n\n-----------------");

		return pointer;		

	}

	function triggerCallback(callback, data){
		console.log("Triger...");
		callback.call(data);
	}

	init();


});