models 		= {}

currentUser = {}
gamesList 	= []

# Container for Game IDs

gameIds 	= []

# Container for game pointers

gamePointers = []
# gamePointers = [{"__type":"Pointer","className":"Game","objectId":"zpWR6UtdK3"},{"__type":"Pointer","className":"Game","objectId":"dGR7HZeJqh"}]


payload 	= {}

# The final return var
manifest = []

init = ->

	# ------------
	# Set up models
	# ------------
	models.Player 	= Parse.Object.extend("Player")
	models.Game 	= Parse.Object.extend("Game")
	models.Round 	= Parse.Object.extend("Round")
	models.Move 	= Parse.Object.extend("Move")





	
	# currentUser = request.params.user
	# vvvv REPLACE vvvv
	
	currentUser =
		__type: "Pointer"
		className: "_User"
		objectId: "C21b7TAQBB"

	# --------------
	# 


	Parse.Promise.when(getGamesList()).then (results) ->

		console.log "getGamesList complete"

		_.each gamesList, (el) ->

			tmp =
				__type: "Pointer"
				className: "Game"
				objectId: el.game.objectId
			
			gamePointers.push tmp


		Parse.Promise.when(loadGames()).then (results) ->

			# -----------------
			# Load in the games
			# -----------------
			
			_.each results, (game) ->
				manifest.push game.toJSON()

			console.log "loadGames complete"

			# -------------------
			# LOAD ROUNDS & MOVES
			# -------------------

			Parse.Promise.when(loadRounds()).then (rounds) ->
				payload.rounds = []

				_.each rounds, (round) ->
					payload.rounds.push round.toJSON()

				console.log "loadRounds complete"
				

				Parse.Promise.when(loadMoves()).then (moves) ->

					payload.moves = []

					_.each moves, (move) ->
						payload.moves.push move.toJSON()

					console.log "loadMoves complete"
					
					Parse.Promise.when(mergeRoundsAndMoves()).then (data) ->
						console.log "round and move merge complete"

						Parse.Promise.when(loadPlayers()).then (results) ->
							console.log "loadPlayers complete"
							# response.success(manifest)
							# console.log manifest


# --------------
# GAMES
# --------------


getGamesList = ->

	console.log "Fetching games..."

	# --------
	# fixtureData = [{"game":{"__type":"Pointer","className":"Game","objectId":"zpWR6UtdK3"},"player":{"__type":"Pointer","className":"_User","objectId":"C21b7TAQBB"},"accepted":true,"createdAt":"2013-07-27T21:25:06.079Z","updatedAt":"2013-07-27T21:25:06.524Z","objectId":"IvAJmISUmL","ACL":{"C21b7TAQBB":{"read":true,"write":true},"*":{"read":true}}},{"game":{"__type":"Pointer","className":"Game","objectId":"dGR7HZeJqh"},"player":{"__type":"Pointer","className":"_User","objectId":"C21b7TAQBB"},"accepted":true,"createdAt":"2013-07-27T21:09:42.847Z","updatedAt":"2013-07-27T21:09:43.076Z","objectId":"vCswqNVXjz","ACL":{"C21b7TAQBB":{"read":true,"write":true},"*":{"read":true}}}]
	# gamesList = fixtureData
	# fixtureData
	# --------

	# Get the list of games where the current user is a player
	ggl_promise = new Parse.Promise()
	pQuery 			= new Parse.Query(models.Player)

	pQuery.equalTo "player", currentUser

	pQuery.find
		success: (results) ->
			# gamesList = results
			_.each results, (game) ->
				gamesList.push game.toJSON()

			ggl_promise.resolve(results)
			# results
		error: (error) ->
			response.error(error.code + ":" + error.message)
			ggl_promise.reject(error)
			# error

loadGames = ->
	console.log "loadGames"
	lg_promise = new Parse.Promise()
	# -----------
	# fixtureData = [{"initiator":{"__type":"Pointer","className":"_User","objectId":"C21b7TAQBB"},"active":true,"current_round":1,"total_points":0,"type":"one-on-one","ACL":{"C21b7TAQBB":{"read":true,"write":true}},"objectId":"dGR7HZeJqh","createdAt":"2013-07-27T21:09:39.887Z","updatedAt":"2013-07-27T21:09:40.530Z","__type":"Object","className":"Game"},{"initiator":{"__type":"Pointer","className":"_User","objectId":"C21b7TAQBB"},"active":true,"current_round":1,"total_points":0,"type":"one-on-one","ACL":{"C21b7TAQBB":{"read":true,"write":true}},"objectId":"zpWR6UtdK3","createdAt":"2013-07-27T21:25:00.075Z","updatedAt":"2013-07-27T21:25:00.715Z","__type":"Object","className":"Game"}]
	# fixtureData
	# -----------
	

	# get a list of all game IDs
	# -----------
	
	gameIds = []

	_.map gamesList, (el) ->
		gameIds.push el.game.objectId

	# Now build the query.....
	query = new Parse.Query(models.Game)

	query.containedIn "objectId", gameIds

	query.find
		success: (results) ->
			console.log "> loadGames success..."
			lg_promise.resolve results
		error: (error) ->
			lg_promise.reject error
	
# --------------
# PLAYERS
# --------------

loadPlayers = ->
	console.log "loading players ..."
	lp_promise = new Parse.Promise()
	

	# -------------
	# fixtureData = [{"game":{"__type":"Pointer","className":"Game","objectId":"dGR7HZeJqh"},"player":{"username":"validkeys","email":"validkeys@gmail.com","first_name":"Kyle","last_name":"Davis","success":{},"error":{},"games":{"__type":"Relation","className":"Game"},"createdAt":"2013-07-02T02:29:49.175Z","updatedAt":"2013-07-26T14:08:20.693Z","objectId":"C21b7TAQBB","__type":"Object","className":"_User"},"accepted":true,"createdAt":"2013-07-27T21:09:42.847Z","updatedAt":"2013-07-27T21:09:43.076Z","objectId":"vCswqNVXjz","ACL":{"C21b7TAQBB":{"read":true,"write":true},"*":{"read":true}}},{"game":{"__type":"Pointer","className":"Game","objectId":"dGR7HZeJqh"},"player":{"email":"tobin@pressly.com","error":{},"first_name":"tobin","image":"tobin.jpeg","last_name":"d","success":{},"username":"tobin","games":{"__type":"Relation","className":"Game"},"createdAt":"2013-07-03T03:13:32.003Z","updatedAt":"2013-07-26T13:53:04.209Z","objectId":"AdVWvtqR0h","__type":"Object","className":"_User"},"accepted":false,"createdAt":"2013-07-27T21:09:42.284Z","updatedAt":"2013-07-27T21:09:42.534Z","objectId":"JZcbCENWtl","ACL":{"AdVWvtqR0h":{"read":true,"write":true},"C21b7TAQBB":{"read":true,"write":true},"*":{"read":true}}},{"game":{"__type":"Pointer","className":"Game","objectId":"zpWR6UtdK3"},"player":{"username":"validkeys","email":"validkeys@gmail.com","first_name":"Kyle","last_name":"Davis","success":{},"error":{},"games":{"__type":"Relation","className":"Game"},"createdAt":"2013-07-02T02:29:49.175Z","updatedAt":"2013-07-26T14:08:20.693Z","objectId":"C21b7TAQBB","__type":"Object","className":"_User"},"accepted":true,"createdAt":"2013-07-27T21:25:06.079Z","updatedAt":"2013-07-27T21:25:06.524Z","objectId":"IvAJmISUmL","ACL":{"C21b7TAQBB":{"read":true,"write":true},"*":{"read":true}}},{"game":{"__type":"Pointer","className":"Game","objectId":"zpWR6UtdK3"},"player":{"email":"tobin@pressly.com","error":{},"first_name":"tobin","image":"tobin.jpeg","last_name":"d","success":{},"username":"tobin","games":{"__type":"Relation","className":"Game"},"createdAt":"2013-07-03T03:13:32.003Z","updatedAt":"2013-07-26T13:53:04.209Z","objectId":"AdVWvtqR0h","__type":"Object","className":"_User"},"accepted":false,"createdAt":"2013-07-27T21:25:04.799Z","updatedAt":"2013-07-27T21:25:05.449Z","objectId":"l51fHyZDPv","ACL":{"AdVWvtqR0h":{"read":true,"write":true},"C21b7TAQBB":{"read":true,"write":true},"*":{"read":true}}}]
	# $.when(mergePlayerData(fixtureData)).then ->
	# 	fixtureData
	# -------------



	# # Now build the query.....
	query = new Parse.Query(models.Player)
	query.containedIn "game", gamePointers
	query.include("player")

	query.find
		success: (results) ->
			console.log "players fetched"
			console.log results

			# merge in the results
			Parse.Promise.when(mergePlayerData(results)).then (results) ->
				lp_promise.resolve(results)




# merge the player data
# into the manifest data
mergePlayerData = (data) ->

	mpd_promise = new Parse.Promise()

	console.log "merging player data"

	tmp = {}

	_.each data, (player, i) ->

		game_id = player.get("game").toJSON().objectId

		if tmp[game_id] is undefined
			tmp[game_id] = []

		tmp[game_id].push player.toJSON()

	counter = 1

	_.each manifest, (game, index) ->
		
		manifest[index]['players'] = []

		if tmp[game.objectId]
			manifest[index].players = tmp[game.objectId]

		if counter == manifest.length
			console.log "> merging player success ...."
			mpd_promise.resolve(manifest)
		else
			counter++		
	
	mpd_promise

loadRounds = ->

	console.log "Fetching rounds..."
	lr_promise = new Parse.Promise()

	# ----------------
	# fixtureData = [{"game":{"__type":"Pointer","className":"Game","objectId":"dGR7HZeJqh"},"round_number":1,"createdAt":"2013-07-27T21:09:40.961Z","updatedAt":"2013-07-27T21:09:42.016Z","objectId":"C1Ftb30elz","ACL":{"C21b7TAQBB":{"read":true,"write":true},"*":{"read":true}}},{"game":{"__type":"Pointer","className":"Game","objectId":"zpWR6UtdK3"},"round_number":1,"createdAt":"2013-07-27T21:25:00.887Z","updatedAt":"2013-07-27T21:25:04.053Z","objectId":"UXproMuPVt","ACL":{"C21b7TAQBB":{"read":true,"write":true},"*":{"read":true}}}]
	# fixtureData
	# ----------------

	# Now build the query.....
	query = new Parse.Query(models.Round)
	query.containedIn "game", gamePointers

	query.find
		success: (results) ->
			console.log "> loadRounds success...."
			lr_promise.resolve(results)
		error: (error) ->
			lr_promise.reject error


loadMoves = ->

	lm_promise = new Parse.Promise()
	console.log "Fetching moves..."

	roundPointers = []

	_.each payload.rounds, (el) ->

		tmp =
			__type: "Pointer"
			className: "Round"
			objectId: el.objectId
		
		roundPointers.push tmp


	# ----------------
	# fixtureData = [{"media":{"__type":"Pointer","className":"Media","objectId":"Ly6eL4FbIA"},"round":{"__type":"Pointer","className":"Round","objectId":"C1Ftb30elz"},"user":{"__type":"Pointer","className":"_User","objectId":"C21b7TAQBB"},"comment":"","media_type":"movie","opponent_seen":false,"rejected":null,"createdAt":"2013-07-27T21:09:43.605Z","updatedAt":"2013-07-27T21:09:43.720Z","objectId":"7Wl0J8EBpZ","ACL":{"C21b7TAQBB":{"read":true,"write":true},"*":{"read":true}}},{"media":{"__type":"Pointer","className":"Media","objectId":"lnuFcgaHVG"},"round":{"__type":"Pointer","className":"Round","objectId":"UXproMuPVt"},"user":{"__type":"Pointer","className":"_User","objectId":"C21b7TAQBB"},"comment":"","media_type":"movie","opponent_seen":false,"rejected":null,"createdAt":"2013-07-27T21:25:05.401Z","updatedAt":"2013-07-27T21:25:06.042Z","objectId":"BNFquo5it0","ACL":{"C21b7TAQBB":{"read":true,"write":true},"*":{"read":true}}}]
	# fixtureData
	# ----------------


	# Now build the query.....
	query = new Parse.Query(models.Move)
	query.containedIn "round", roundPointers

	query.find
		success: (results) ->
			console.log "> loadMoves success ...."
			lm_promise.resolve results
		error: (error) ->
			lm_promise.reject error

mergeRoundsAndMoves = ->

	console.log "merging rounds and moves"

	mrm_promise = new Parse.Promise()

	tmpRounds 	= {}
	tmpMoves 	= {}


	_.each payload.moves, (move, i) ->

		if tmpMoves[move.round.objectId] is undefined
			tmpMoves[move.round.objectId] = []

		tmpMoves[move.round.objectId].push move

	_.each payload.rounds, (round, i) ->
		console.log "creating tmpRounds table"

		round_game_id = round.game.objectId

		if tmpRounds[round_game_id] is undefined
			tmpRounds[round_game_id] = []

		if tmpMoves[round.objectId]
			round.moves = tmpMoves[round.objectId]

		tmpRounds[round_game_id].push round



	counter = 1

	_.each manifest, (game, index) ->
		
		manifest[index]['rounds'] = []
		# delete manifest[index].players

		if tmpRounds[game.objectId]
			console.log "adding to manifest"
			manifest[index].rounds = tmpRounds[game.objectId]

		if counter == manifest.length
			console.log "> merging success ...."
			mrm_promise.resolve({test: true})
		else
			counter++

	
	mrm_promise


init()