var _;

_ = require('underscore');

Parse.Cloud.useMasterKey();

Parse.Cloud.afterSave("Media", function(request) {
  var media, postACL;
  if (request.object.existed() === false) {
    media = request.object;
    postACL = new Parse.ACL();
    postACL.setRoleWriteAccess("Administrators", true);
    postACL.setPublicReadAccess(true);
    media.setACL(postACL);
    return media.save();
  }
});
