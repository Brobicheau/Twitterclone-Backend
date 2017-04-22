var mongoose = require('mongoose');
var conn2 = mongoose.createConnection('mongodb://192.168.1.49:27017/media');

var mediaSchema = mongoose.Schema({
	'id':{type: String, index: true},
	'filename': String,
	'content': Buffer
});


module.exports = conn2.model('media', mediaSchema);