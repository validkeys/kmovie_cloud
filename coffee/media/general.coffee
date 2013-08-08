_ = require 'underscore'


# This is passed a media object
# if it can find it in the DB, it returns the local reference
# if it can't it creates it and then returns the local copy

Parse.Cloud.define "mediaFindOrCreate", (request, response) ->

	data = request.params.toJSON()

	# console.log data.toJSON()

	if data.api_id? and data.type is "movie"

		console.log "\n\nIN\n\n"

		Media = Parse.Object.extend("Media")
		mQuery = new Parse.Query(Media)

		mQuery.equalTo("api_id", data.api_id)
		mQuery.equalTo("type", "movie")

		mQuery.first
			success: (result) ->

				if result isnt undefined and result.length isnt 0
					response.success result
				else
					console.log "Need to create that!"

			error: (msg) ->
				throw "Error" + error.code + ": " + error.message