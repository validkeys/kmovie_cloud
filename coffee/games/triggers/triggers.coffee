_ = require 'underscore'

# Rules

# beforeSave
# - new
# --- make sure current round is 1
# --- make sure initiator exists ??
# --- set total points to 0
# --- type shouldt be blank and should be of type [one-on-one, group-play, reco-request]
# - edit
# -- ensure initiator doesnt change
# -- ensure current round is >= 1
# --- type shouldt be blank and should be of type [one-on-one, group-play, reco-request]
# 
# 
# afterSave
# - setAcls

Parse.Cloud.beforeSave "Game", (request, response) ->


	gameTypes = ["one-on-one", "group-play", "reco-request"]

	# -------------
	# New Game
	# -------------

	if request.object.existed() is false

		errors = false



		# Current round
		# -------------

		if request.object.get("current_round") isnt 1
			request.object.set("current_round", 1)


		# Initiator Exists
		# ----------------

		User 	= Parse.Object.extend "User"
		query 	= new Parse.Query(User)

		query.equalTo "objectId", request.object.get("initiator").objectId

		query.first
			success: (results) ->
				if results.length is 0
					response.error "User not found"
					errors = true
			error: (error) ->
				response.error "Finding initiator query failed"
				errors = true




		# Total points should be 0
		# ------------------------

		request.object.set("total_points", 0) if request.object.get("total_points") isnt 0



		# Ensure game type is pre-specified
		# ---------------------------------

		if _.include(gameTypes, request.object.get("type")) is false
			response.error "Game type not recognized"
			errors = true




		# Otherwise, good to go
		# ---------------------

		if errors is false
			response.success()

	# -------------
	# Existing Game
	# -------------

	else

		# Initiator Hasnt Changed
		# -----------------------

		response.success()



# -------------
# AfterSave
# -------------



Parse.Cloud.afterSave "Game", (request) ->

	if request.object.existed() is false	

		game = request.object

		# SET ACLS
		groupACL = new Parse.ACL()
		groupACL.setReadAccess request.object.get("initiator"), true
		groupACL.setWriteAccess request.object.get("initiator"), true
		game.setACL groupACL
		game.save()	

