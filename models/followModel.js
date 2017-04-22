var mongoose = require('mongoose');
var conn1 = mongoose.createConnection('mongodb://127.0.0.1:27017/twitter');

var followSchema = mongoose.Schema({
	"username":{type: String, index: true},
	"following": {type: String, index: true}
});


module.exports = conn1.model('follow_data', followSchema);