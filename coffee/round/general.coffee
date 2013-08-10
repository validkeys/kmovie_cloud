_ = require 'underscore'

Parse.Cloud.useMasterKey()
# This finds the latest round for a game

Parse.Cloud.define "latestRound", (request, response) ->


	game_object_id = request.params.game

	Round = Parse.Object.extend "Round"
	query = new Parse.Query(Round)

	gamePointer =
		__type: "Pointer"
		className: "Game"
		objectId: game_object_id

	query.equalTo "game", gamePointer
	query.descending "round_number"

	query.first
		success: (results) ->
			response.success(results)
		error: (error) ->
			throw "error finding latest round"
			response.error("Error")