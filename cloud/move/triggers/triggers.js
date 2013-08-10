var _;

_ = require('underscore');

Parse.Cloud.useMasterKey();

Parse.Cloud.beforeSave("Move", function(request, response) {
  var Move, checkForComplete, complete, errors, media_type, media_types, query;
  complete = {
    uniquemove: true
  };
  errors = false;
  media_types = ["movie", "series", "documentary"];
  media_type = request.object.get("media_type");
  if (_.include(media_types, media_type) === false) {
    response.error("Media type not recognized");
    errors = true;
  }
  Move = Parse.Object.extend("Move");
  query = new Parse.Query(Move);
  query.equalTo("round", request.object.get("round"));
  query.equalTo("user", request.object.get("user"));
  if (request.object.existed() === true) {
    query.notEqualTo("objectId", request.object.objectId);
  }
  query.find({
    success: function(results) {
      if (results === void 0 || results.length > 0) {
        throw "user has already made a move this round";
        response.error("User has already made a move this round");
        complete.uniquemove = false;
        errors = true;
      }
      return checkForComplete();
    },
    error: function(error) {
      response.error("Move beforeSave query error");
      errors = true;
      return checkForComplete();
    }
  });
  return checkForComplete = function() {
    if (complete.uniquemove === true) {
      if (errors === false) {
        return response.success();
      }
    }
  };
});

Parse.Cloud.afterSave("Move", function(request) {
  var groupACL, move;
  if (request.object.existed() === false) {
    move = request.object;
    groupACL = new Parse.ACL();
    groupACL.setReadAccess(move.get("user"), true);
    groupACL.setWriteAccess(move.get("user"), true);
    groupACL.setPublicReadAccess(true);
    move.setACL(groupACL);
    move.save();
    return Parse.Cloud.run("checkForNewRound", request.object.toJSON());
  }
});
