var mongoose = require('mongoose');

var mediaSchema = mongoose.Schema({
	'id':{type: String, index: true},
	'filename': String,
	'content': Buffer
});


module.exports = mongoose.model('media', mediaSchema);