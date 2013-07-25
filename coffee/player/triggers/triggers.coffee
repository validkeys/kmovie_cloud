# Rules:
# A player should only belong to the same game once
# Set ACLs on the player
	# The initiator should have read/write access
	# public should have read access
	# player should have read/write

_ = require 'underscore'

Parse.Cloud.beforeSave "Player", (request, response) ->

	errors = false

	complete =
		player_unique: false

	checkForComplete = ->

		allDone = true

		for key of complete
			allDone = false if complete[key] is false

		if allDone is true and errors is false
			response.success()


	# ---------------------------
	# Unique Player / Game Combo
	# ---------------------------


	if request.object.existed() is false

		Player 	= Parse.Object.extend "Player"
		query 	= new Parse.Query(Player)

		query.equalTo "player", request.object.get "player"
		query.equalTo "game", request.object.get "game"

		query.first
			success: (object) ->
				if object is undefined or object.length is 0
					complete.player_unique = true
				else
					errors = true
					response.error "Player already exists in this game"

				checkForComplete()

			error: (error) ->
				response.error "Error checking for player existence: " + error.code " : " + error.message
				errors = true
				checkForComplete()

	else
		for key of complete
			complete[key] = true

		checkForComplete()



# ---------------------------
# AFTER SAVE
# ---------------------------

Parse.Cloud.afterSave "Player", (request) ->

	if request.object.existed() is false

		player = request.object


		# ------------------
		# SET ACLs
		# ------------------

		# Find the game initiator
		
		Game = Parse.Object.extend("Game")
		query = new Parse.Query(Game)

		query.equalTo "objectId", player.get("game").objectId
		query.select "initiator"



		query.first
			success: (game) =>

				# SET ACLS
				groupACL = new Parse.ACL()
				groupACL.setReadAccess request.object.get("player"), true
				groupACL.setWriteAccess request.object.get("player"), true
				groupACL.setReadAccess game.get("initiator"), true
				groupACL.setWriteAccess game.get("initiator"), true

				groupACL.setPublicReadAccess(true)

				player.setACL groupACL
				player.save()		


				# ---------------------------
				# ADD PLAYER RELATION TO GAME
				# ---------------------------

				relation = game.relation("friends")
				relation.add(player)
				game.save()


			error: (error) ->
				console.log "\n\n ERROR finding game initiator: " + error.code + " : " + error.message
				console.log "Player objectId: " + player.get("objectId")

