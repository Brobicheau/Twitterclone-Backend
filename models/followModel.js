var mongoose = require('mongoose');


var followSchema = mongoose.Schema({
	"username":{type: String, index: true},
	"following": {type: String}
});


module.exports = mongoose.model('follow_data', followSchema);