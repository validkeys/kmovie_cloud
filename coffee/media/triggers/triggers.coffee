_ = require 'underscore'

Parse.Cloud.afterSave "Media", (request) ->

	if request.object.existed() is false

		media = request.object
		
		# SET ACLS
		postACL = new Parse.ACL()
		postACL.setRoleWriteAccess("Administrators", true)
		postACL.setPublicReadAccess(true)
		media.setACL(postACL)
		media.save()