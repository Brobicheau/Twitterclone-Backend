var mongoose = require('mongoose');
var options = {server: {socketOptions: {socketTimeoutMS: 10000}}};
var conn1 = mongoose.createConnection('mongodb://192.168.1.46:27017/twitter', options);


var likeSchema = mongoose.Schema({
	"tweet_id":{type: String, index: true},
	"username": {type: String, index: true}
});


module.exports = conn1.model('like_data', likeSchema);