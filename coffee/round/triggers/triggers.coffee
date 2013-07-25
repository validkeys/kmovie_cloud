# // Unique round number and game
# // Aftersave ACL
# 	// Public read access
# 	// Game initiator write access

Parse.Cloud.beforeSave "Round", (request, response) ->

	# // Unique round number and game

	Round = Parse.Object.extend "Round"
	query = new Parse.Query(Round)

	query.equalTo "game", request.object.get("game")
	query.equalTo "round_number", request.object.get("round_number")

	if request.object.existed() is true
		query.notEqualTo "objectId", request.object.get("objectId")

	query.first
		success: (object) ->
			if object is undefined or object.length is 0
				response.success()
			else
				response.error "This round number already exists for this game"
		error: (error) ->
			console.log "\n\n\n"
			console.log "!! > Error creating round : " + error.code + " : " + error.message
			console.log "\n\n\n"




# ---------------------------
# AFTER SAVE
# ---------------------------

Parse.Cloud.afterSave "Round", (request) ->

	if request.object.existed() is false

		round = request.object

		# Find the game initiator
		
		Game = Parse.Object.extend("Game")
		query = new Parse.Query(Game)

		query.equalTo "objectId", round.get("game").objectId
		query.select "initiator"



		query.first
			success: (initiator) =>

				# SET ACLS
				groupACL = new Parse.ACL()
				groupACL.setReadAccess initiator.get("initiator"), true
				groupACL.setWriteAccess initiator.get("initiator"), true

				groupACL.setPublicReadAccess(true)

				round.setACL groupACL
				round.save()		



			error: (error) ->
				console.log "\n\n ERROR finding game initiator in round afterSave: " + error.code + " : " + error.message
				console.log "Round objectId: " + round.get("objectId")

