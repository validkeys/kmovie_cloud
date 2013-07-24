var _;

_ = require('underscore');

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
  query.find({
    success: function(results) {
      if (results === void 0 || results.length > 0) {
        throw "user exists!!";
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
