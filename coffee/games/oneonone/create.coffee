Parse.Cloud.define "saveNewGame", (request, response) ->
	
	# Placeholder for objects
	# -----------------------
	init = ->
		createGame()
		createRound()
		createPlayer()
		createMove()
		saveGame()
	
	# ++++++++++++++++++
	# Create the Game
	# ++++++++++++++++++
	createGame = ->
		objs.Game = Parse.Object.extend("Game")
		instances.game = new objs.Game(request.params.game)
	
	# ++++++++++++++++++
	# Create the Round
	# ++++++++++++++++++
	createRound = ->
		objs.Round = Parse.Object.extend("Round")
		instances.round = new objs.Round(request.params.round)
		instances.round.set "game", instances.game
	
	# +++++++++++++++++++++
	# Create the first move
	# +++++++++++++++++++++
	createMove = (callback) ->
		objs.Media = Parse.Object.extend("Media")
		objs.Move = Parse.Object.extend("Move")
		i = request.params.moves.length - 1

		while i >= 0
			media_type = request.params.moves[i].media_type
			media_data = request.params.moves[i].media
			delete request.params.moves[i].media

			m = new objs.Move(request.params.moves[i])
			
			# console.log(request.params.moves[i]);
			
			# media_opts = {
			# 	type: request.params.moves[i].media_type,
			# 	data: request.params.moves[i].media
			# };
			m.set "round", instances.round
			query = new Parse.Query(objs.Media)
			
			# console.log({"type":media_type,"api_id":media_data.api_id});
			query.equalTo "api_id", media_data.api_id
			
			# query.equalTo("type",media_type);
			query.first
				success: (results) ->
					
					# console.log("Search Results:");
					# console.log(results);
					if results is `undefined` or results.length is 0
						
						# console.log("Creating media...");
						media = new objs.Media(media_data)
						media.set("imported", false)

						# console.log "\n\n=========================\n\n"
						# console.log media.toJSON()
						# console.log "\n\n=========================\n\n"

						media.save null,
							success: (media) ->
								m.set "media", returnMediaPointer(media)
								instances.movesToSave.push m
								
								# This is a hack but it's late
								# fuck...
								if i is -1
									# console.log "Calling saveMoves..."
									saveMoves()

							error: (error) ->
								# console.log "Media not created"
								response.error error
								false

					else
						m.set "media", returnMediaPointer(results)
						instances.movesToSave.push m
						
						# This is a hack but it's late
						# fuck...
						if i is -1
							# console.log "Calling saveMoves..."
							saveMoves()

				error: (error) ->
					console.log "Query Error on findOrReturnMedia"
					console.log error
					false

			i--
	
	# ++++++++++++++++++
	# Create the Players
	# ++++++++++++++++++
	createPlayer = ->
		objs.Player = Parse.Object.extend("Player")
		playersToSave = []
		i = request.params.players.length - 1

		while i >= 0
			p = new objs.Player(request.params.players[i])
			p.set "game", instances.game
			playersToSave.push p
			i--
		instances.playersToSave = playersToSave
	
	# --------------
	# Saves
	# --------------
	saveGame = ->
		instances.round.save null,
			success: (round) ->
				success.game = true
				savePlayers()
				complete.game = true
				checkForSuccess()

			error: (args...) ->
				throw "Got an error saving the game"
				console.log args
				complete.game = true
				checkForSuccess()

	savePlayers = ->
		# console.log "Saving " + instances.playersToSave.length + " players"
		Parse.Object.saveAll instances.playersToSave,
			success: (obj) ->
				# console.log "Players Saved..."
				success.players = true
				complete.players = true
				checkForSuccess()

			error: (obj, error) ->
				console.log "\n\n ERROR!! - from savePlayers"
				console.log error
				complete.players = true
				checkForSuccess()

	saveMoves = ->
		# console.log "Saving " + instances.movesToSave.length + " moves"
		Parse.Object.saveAll instances.movesToSave,
			success: (obj) ->
				success.move = true
				# console.log "Moves Saved..."
				complete.move = true
				checkForSuccess()

			error: (obj, error) ->
				console.log "\n\n ERROR!! - from saveMoves"
				console.log error
				complete.move = true
				checkForSuccess()

	checkForSuccess = ->
		allDone = true
		allSuccessful = true
		for key of complete
			allDone = false  if complete[key] is false
		if allDone is true
			console.log "All done..."
			for key of success
				allSuccessful = false  if success[key] is false
			if allSuccessful is true

				requestData =
					game:
						objectId: instances.game.toJSON().objectId
						__type: "Pointer"
						className: "Game"
					user:
						objectId: instances.game.get("initiator").toJSON().objectId
						__type: "Pointer"
						className: "_User"

				
				# Now call the manifest
				Parse.Cloud.run("listGames", requestData,
					success: (results) ->
						response.success(results)
					error: (error) ->
						response.error "There was a problem retrieving this games manifest"
						throw "listGames error on new game create"
				)

			else
				response.error "There was a problem creating your game"
	
	# Helpers ->
	returnMediaPointer = (result) ->
		if result.objectId isnt `undefined`
			id = result.objectId
		else
			id = result.id
		pointer =
			__type: "Pointer"
			className: "Media"
			objectId: id

		pointer

	triggerCallback = (callback, data) ->
		callback.call data

	objs = {}
	instances = {}
	complete =
		game: false
		players: false
		move: false

	success =
		game: false
		players: false
		move: false

	instances.movesToSave = []
	init()