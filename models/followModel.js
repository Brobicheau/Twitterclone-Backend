var mongoose = require('mongoose');


var followSchema = mongoose.Schema({
	"username":{type: String, index: true},
	"following": {type: String, index: true}
});


module.exports = mongoose.model('follow_data', followSchema);