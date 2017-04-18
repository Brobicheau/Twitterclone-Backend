var shortid = require('shortid');




var addmedia = function(params){

	var id = shortif.generate();
	var filename = req.body.filename;
	var query  = 'INSERT INTO imgs (filename, contents, id) VALUES (:filename, :contents, :id)';
	var params = {filename: req.body.filename, contents : data, :id shortid.generate()};
	client.execute(query, params, {prepare:true}, function(err, result){
			console.log("IN EXCECUTE");
			if(err){
				console.log(err);
				var response = {
					"status": "OK"
				};
				callback(err, response);
			}
			else{
				var response = {
					"id":id,
					"status":"OK"
				};
				callback(null, response);
			}
	});





}	



