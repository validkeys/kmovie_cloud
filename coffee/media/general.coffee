_ = require 'underscore'


# This is passed a media object
# if it can find it in the DB, it returns the local reference
# if it can't it creates it and then returns the local copy

Parse.Cloud.define "mediaFindOrCreate", (request, response) ->

	console.log "Media find or create"

	data = request.params

	# console.log data.toJSON()

	if data.api_id? and data.type is "movie"

		Media 	= Parse.Object.extend("Media")
		mQuery 	= new Parse.Query(Media)

		mQuery.equalTo("api_id", data.api_id)
		mQuery.equalTo("type", "movie")

		mQuery.first
			success: (result) ->

				console.log "Result:\n"
				console.log result


				if result isnt undefined and result.length isnt 0
					response.success result
				else
					# Create the media object
					data.imported = false
					delete data.id
					newMedia = new Media()
					console.log "saving:\n"
					console.log data
					# return the media object
					newMedia.save data,
						success: (result) ->
							console.log "SUCCESS!"
							response.success result
						error: (args...) ->
							console.log args
							throw "Error!: "
							response.error("Error!")

			error: (msg) ->
				throw "Error" + error.code + ": " + error.message


Parse.Cloud.define "checkForNewRound", (request, response) ->

		console.log "\n\n\n"
		console.log "checking for new round .... "
		console.log request
		console.log "\n\n\n"

		# if all game.players.length = round.moves.length
		# create a new round
		data = request.params


		moves_num = 0
		player_num = 0

		round = data.round

		# ----------------------------
		# Find the number of moves
		# ----------------------------

		Move = Parse.Object.extend "Move"
		mQuery = new Parse.Query(Move)

		mQuery.equalTo "round", round

		mQuery.count
			success: (num_moves) ->
				moves_num = num_moves
				console.log "Theres are " + num_moves + " moves in this round"


				# ----------------------------
				# Find the number of players
				# -----------------------------
				
				Round = Parse.Object.extend("Round")
				checkRound = new Round({objectId: round.toJSON().objectId}) 
				console.log "\nChecking for round: " + round.toJSON().objectId

				checkRound.fetch
					success: (data) ->
						game = data.get("game")

						Player = Parse.Object.extend("Player")
						pQuery = new Parse.Query(Player)


						pQuery.equalTo "game", game

						pQuery.count
							success: (player_count) ->
								player_num = player_count
								console.log "There are " + player_count + " players in this round"

								if moves_num is player_num


									Parse.Cloud.run "latestRound", {game: game.toJSON().objectId},
										success: (results) ->
											round_number = results.get("round_number")

											# latest_round = 

											newRound = new Round()

											data =
												game: game
												round_number: round_number + 1

											newRound.save data,
												success: (result) ->
													response.success(result)
												error: (error) ->
													throw "Error creating new round"
													console.log error
													response.error(error)
								else

									response.success("No need to create a new round")


							error: (args...) ->
								console.log "!ERROR!"
								console.log args
								response.error args



