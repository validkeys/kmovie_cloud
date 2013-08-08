var _;

_ = require('underscore');

Parse.Cloud.define("mediaFindOrCreate", function(request, response) {
  var Media, data, mQuery;
  data = request.params.toJSON();
  if ((data.api_id != null) && data.type === "movie") {
    console.log("\n\nIN\n\n");
    Media = Parse.Object.extend("Media");
    mQuery = new Parse.Query(Media);
    mQuery.equalTo("api_id", data.api_id);
    mQuery.equalTo("type", "movie");
    return mQuery.first({
      success: function(result) {
        if (result !== void 0 && result.length !== 0) {
          return response.success(result);
        } else {
          return console.log("Need to create that!");
        }
      },
      error: function(msg) {
        throw "Error" + error.code + ": " + error.message;
      }
    });
  }
});
