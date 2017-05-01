Q = []

var addToQ = function(item) {
	Q.push(item);
}

var startQ = function(){
	setInterval(saveItem, 3)
}

var saveItem = function(){
	if(Q.length !== 0){
		newItem = Q.pop();
		newItem.save(function (err, results){
			if(err){
				console.log(err);
			}
			else{
				if(Q.length > 20){
					console.log('shrinking queue')
					saveItem()
				}
			}
		});
	}	
}

module.exports = {addToQ, startQ}