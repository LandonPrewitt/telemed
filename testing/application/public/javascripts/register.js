/*
var cursor = User.find({}).cursor();
		var dup = false;
		cursor.on('data', function(doc){
			if (data.nick == doc.nick) {
				dup = true;
			}
		});

		cursor.on('close', function(){
			if(data.nick in users_server || dup) {
				// Check to see if user is already existing online in a socket
				callback({name: false, pass: true, err:""});
				console.log("Name already exists");
			} else if(data.pw == '') {
				callback({name: true, pass: false, err:""});
				console.log("No pass entered");
			} else {
				callback({name: true, pass: true, err:""});
				var newUsr = new User({
					nick: data.nick, 
					pw: data.pw, 
					name:data.name, 
					email:data.email, 
					phone:data.phone,
					isDoctor:data.doctor
				});
				newUsr.save(function(err){
					if(err) throw err;
					socket.nickname = data.nick;
					users_server[socket.nickname] = socket;
					updateNicknames();
				});
			}
		})	*/