var mongoose = require('mongoose');

var options = {
	  server: {
	    socketOptions: {
	      socketTimeoutMS: 9000000000,
	      connectionTimeout: 900000000,
	      poolSize: 100
	    }
	  }
  }
var conn = mongoose.createConnection("192.168.1.151", options);
var followSchema = mongoose.Schema({
	"username":String,
	"following": {type: String, index:true}
});


module.exports = conn.model('follow_datas', followSchema);