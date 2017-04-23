var mongoose = require('mongoose');
var conn = mongoose.createConnection("192.168.1.44");

var mediaSchema = mongoose.Schema({
	'id':{type: String, index: true},
	'filename': String,
	'content': Buffer
});


module.exports = conn.model('media', mediaSchema);