moment = require 'moment'
_ = require 'underscore'

# // ++++++++++++++++++
# // GAME REQUIRES
# // ++++++++++++++++++

require 'cloud/games/triggers/triggers.js'
require 'cloud/games/oneonone/create.js'

require 'cloud/media/triggers/triggers.js'
require 'cloud/move/triggers/triggers.js'


Parse.Cloud.beforeSave "Friend", (request, response) ->
  
	if request.object.existed() is false
		friend = Parse.Object.extend("Friend")
		themQuery = new Parse.Query(friend)
		meQuery = new Parse.Query(friend)
		meQuery.equalTo "initiator", request.object.get("initiator")
		meQuery.equalTo "recipient", request.object.get("recipient")
		themQuery.equalTo "initiator", request.object.get("recipient")
		themQuery.equalTo "recipient", request.object.get("in")
		mainQuery = new Parse.Query.or(meQuery, themQuery)
		mainQuery.find
			success: (results) ->
				if results.length > 0
					response.error "Friend already exists"
				else
					response.success()

			error: (error) ->
				response.error error
	else
		response.success()



Parse.Cloud.afterSave "Friend", (request) ->

	initiator = request.object.get("initiator")
	recipient = request.object.get("recipient")
	friend = request.object
	
	# var query = new Parse.Query(friend);
	
	# SET ACLS
	groupACL = new Parse.ACL()
	groupACL.setReadAccess request.object.get("initiator"), true
	groupACL.setWriteAccess request.object.get("initiator"), true
	groupACL.setReadAccess request.object.get("recipient"), true
	groupACL.setWriteAccess request.object.get("recipient"), true
	friend.setACL groupACL
	friend.save()
  
	# CREATE NOTIFICATIONS
	notification = new Parse.Object("Notification")

	if request.object.existed()

		# Notify ME that the friend request was accepted
		notification.save
			user: initiator
			item: "friend"
			descr: "request accepted"
			ref: request.object
			msg: them.get("first_name") + " has accepted your friend request"
			recipient: recipient
		,
		success: (notification) ->
			console.log "Notification created"

		error: (error) ->
			throw "Got an error" + error.code + " : " + error.message

	else

		# Notifiy THEM the friend request was generated
		notification.save
			user: recipient
			item: "friend"
			descr: "request created"
			ref: request.object
			msg: initiator.get("first_name") + " wants to be your friend"
			them: initiator
		,
		success: (notification) ->
			console.log "Notification created"

		error: (error) ->
			throw "Got an error" + error.code + " : " + error.message





# Parse.Cloud.afterSave "Player", (request) ->
#   notification = new Parse.Object("Notification")
#   console.log "```````````````````````````````"
#   console.log request.object.existed()
#   console.log request.object.get("player")
#   console.log request.object.get("game")
#   console.log "```````````````````````````````"
#   if request.object.existed() is false
#     data =
#       user: request.object.get("player")
#       item: "game_invite"
#       descr: "game invitation created"
#       ref: request.object.get("game")
#       msg: "You have been invited to play a game"

#     notification.save data,
#       success: (notification) ->
#         console.log "Notification created"

#       error: (error) ->
#         throw "Got an error" + error.code + " : " + error.message


Parse.Cloud.define "userSearch", (request, response) ->
	if request.params.q
		user = Parse.Object.extend("_User")
		query = new Parse.Query(user)
		query.startsWith "first_name", request.params.q
		query.find
			success: (results) ->
				response.success results

			error: ->
				response.error "Couldnt find anything"
	else
		throw "No search params supplied"
