_ = require 'underscore'

Parse.Cloud.beforeSave "Move", (request, response) ->

	complete =
		uniquemove: true

	errors = false

	media_types = ["movie","series","documentary"]

	# ensure media exists

	# ensure media type is either movie, series or documentary

	media_type = request.object.get("media_type")


	if _.include(media_types, media_type) is false
		response.error "Media type not recognized"
		errors = true


	# ensure that there are no other moves with that user and that round

	Move 	= Parse.Object.extend "Move"
	query 	= new Parse.Query(Move)



	query.equalTo "round", 	request.object.get("round")
	query.equalTo "user", 	request.object.get("user")

	query.find
		success: (results) ->
			if results is undefined or results.length > 0
				throw "user exists!!"
				response.error "User has already made a move this round"
				complete.uniquemove = false
				errors = true
			
			checkForComplete()

		error: (error) ->
			response.error "Move beforeSave query error"
			errors = true
			checkForComplete()



	checkForComplete = ->
		if complete.uniquemove is true
			if errors is false
				response.success()