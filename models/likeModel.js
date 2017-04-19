var mongoose = require('mongoose');

var likeSchema = mongoose.Schema({
	"tweet_id":{type: String, index: true},
	"username": {type: String, index: true}
});


module.exports = mongoose.model('like_data', likeSchema);