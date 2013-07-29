_ = require 'underscore'

Parse.Cloud.define "listGames", (request, response) ->

	models 		= {}

	currentUser = {}
	gamesList 	= []
	gameIds 	= []
	payload 	= {}

	# The final return var
	manifest = []

	init = ->
		currentUser = request.params.user

		Parse.Promise.when(getGamesList()).then (results) ->

			console.log "getGamesList complete"

			Parse.Promise.when(loadGames()).then (results) ->

				_.each results, (game) ->
					manifest.push game
				
				console.log manifest

				console.log "loadGames complete"

				Parse.Promise.when(loadPlayers()).then (results) ->
					console.log "loadPlayers complete"
					# response.success(manifest)
					console.log manifest

	getGamesList = ->

		console.log "Fetching games..."

		# Get the list of games where the current user is a player
		models.Player 	= Parse.Object.extend("Player")
		pQuery 			= new Parse.Query(models.Player)

		pQuery.equalTo "player", currentUser

		pQuery.find
			success: (results) ->
				gamesList = results
				results
			error: (error) ->
				response.error(error.code + ":" + error.message)
				error

	loadGames = ->
		console.log "loadGames"

		# fixtureData = [{"initiator":{"__type":"Pointer","className":"_User","objectId":"C21b7TAQBB"},"active":true,"current_round":1,"total_points":0,"type":"one-on-one","ACL":{"C21b7TAQBB":{"read":true,"write":true}},"objectId":"dGR7HZeJqh","createdAt":"2013-07-27T21:09:39.887Z","updatedAt":"2013-07-27T21:09:40.530Z","__type":"Object","className":"Game"},{"initiator":{"__type":"Pointer","className":"_User","objectId":"C21b7TAQBB"},"active":true,"current_round":1,"total_points":0,"type":"one-on-one","ACL":{"C21b7TAQBB":{"read":true,"write":true}},"objectId":"zpWR6UtdK3","createdAt":"2013-07-27T21:25:00.075Z","updatedAt":"2013-07-27T21:25:00.715Z","__type":"Object","className":"Game"}]
		# fixtureData
		# get a list of all game IDs

		gameIds = []

		_.map gamesList, (el) ->
			gameIds.push el.get("game").toJSON().objectId

		# Now build the query.....
		models.Game = Parse.Object.extend("Game")
		query = new Parse.Query(models.Game)

		query.containedIn "objectId", gameIds

		query.find()
		

	loadPlayers = ->
		console.log "loadPlayers"
		# Now build the query.....
		query = new Parse.Query(models.Player)

		# Change gameIds to pointers
		gamePointers = []

		_.map gamesList, (el) ->
			tmp =
				__type: "Pointer"
				className: "Game"
				objectId: el.get("game").toJSON().objectId
			
			gamePointers.push tmp

		query.containedIn "game", gamePointers

		query.find
			success: (results) ->
				# merge in the results
				Parse.Promise.when(mergePlayerData(results)).then (results) ->
					results

	# merge the player data
	# into the manifest data
	mergePlayerData = (data) ->

		console.log "merging player data"

		tmp = {}

		_.each data, (player, i) ->
			console.log "creating tmp table"
			if tmp[player.get("game").toJSON().objectId] is undefined
				tmp[player.get("game").toJSON().objectId] = []

			tmp[player.get("game").toJSON().objectId].push player


		_.each manifest, (game, index) ->
			console.log "game loop"

			game = game.toJSON()
			
			manifest[index]['players'] = []
			# delete manifest[index].players

			if tmp[game.objectId]
				console.log "adding to manifest"
				manifest[0].kyle = "fun"
				# manifest[index].players = tmp[game.objectId]
				# manifest = ""
				# console.log manifest
		
		console.log "calling true"
		true

	getRounds = ->

		console.log "Fetching rounds..."
		console.log payload

		Round = Parse.Object.extend("Round")

		_.each payload, (game, index) ->

			console.log index

			query = new Parse.Query(Round)
			query.equalTo "game", game

			query.find
				success: (game, rounds) ->
					# appendRounds(rounds)
				error: (error) ->
					console.log "> Error"
					console.log error


	init()