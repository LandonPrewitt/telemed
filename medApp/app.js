var express = require("express"),
	fs = require('fs'),
	app = express(),
	server = require('https').createServer({ key: fs.readFileSync('key.pem'), cert: fs.readFileSync('cert.pem')}, app),
	io = require("socket.io").listen(server),
	mongoose = require('mongoose'),
	amqp = require('amqplib/callback_api'),
	users_server = {};

//var holla = require('holla');

server.listen(3000);

//var rtc = holla.createServer(server);

// Mongo DB Code ================================================

mongoose.connect('mongodb://localhost/', function(err){
	if(err){
		console.log(err);
	} else {
		console.log('Connected to mongodb!');
	}
});

var userSchema = mongoose.Schema({
	nick:String,
	pw:String,
	name:String,
	email:String,
	phone:String,
	isDoctor:Boolean,
	created: {type: Date, default: Date.now}
});

var chatSchema = mongoose.Schema({
	nick:String,
	msg: String,
	created: {type: Date, default: Date.now}
});

var Chat = mongoose.model('Message', chatSchema); 
var User = mongoose.model('User', userSchema);

// App Page Request Handlers ====================================

app.use(express.static('public'))

app.get('/', function(req,res){
	res.sendfile(__dirname + "/index.html");
})

app.get('/conference', function(req,res){
	res.sendfile(__dirname + "/public/conference.html");
})

app.get('/Logo.png', function(req,res){
	res.sendfile(__dirname + "/public/images/Logo.png");
})

app.get('/test', function(req,res){
	res.sendfile(__dirname + "/public/test.html");
})

app.get('/test2', function(req,res){
	res.sendfile(__dirname + "/public/test2.html");
})

// Socket.io Handles ============================================

io.sockets.on('connection', function(socket){


	// io Function for updating usernames
	function updateNicknames() {
		io.sockets.emit('usernames', {users:Object.keys(users_server), user: socket.nickname});
	}

	// Function to initiate data recording from EL 10 and recieve
	function recordData(vital) {

		amqp.connect('amqp://localhost', function(err, conn) {
		  conn.createChannel(function(err, ch) {
		   

		  	// Code to signal the data to be send
		    var data = "{\"action\": \"sm\",\"device\": \"sc\"}"
		    ch.assertQueue('cmd', {durable: false});
		    // Note: on Node 6 Buffer.from(msg) should be used
		    ch.sendToQueue('cmd', new Buffer(data));
		    console.log(" [x] Sent %s",data);



		  	// COde for recieving Data
		    ch.assertQueue(vital, {durable: false});
		    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", vital);
			ch.consume(vital, function(msg) {
				socket.emit('push vital', {val: msg.content.toString(), type: vital});
				//callback(msg.content.toString());
				console.log(" [x] Received %s", msg.content.toString());
				conn.close();
			}, {noAck: true});

			//abort();
		  });
		});
	}

	// When user connects, load messages from db
	Chat.find({}, function(err, docs){
		if(err) throw err;
		console.log("Sending old messages");
		socket.emit('load old messages', docs);
	});

	// Event handler for recieving messages from client
	socket.on('send message', function(data, callback){

		var msg = data.trim();
		if(msg.substr(0,3) == '/w '){
			msg = msg.substr(3);
			var ind = msg.indexOf(' ');
			if(ind != -1){
				var name = msg.substr(0, ind);
				var msg = msg.substr(ind + 1);
				if(name in users_server) {
					// Whisper to name socket
					console.log("Whisper!");
					users_server[name].emit('whisper', {msg: msg, nick: socket.nickname})
				} else {
					callback("Error! User doesn't exist.");
				}
			} else {
				callback("Error! Please enter a message for your whisper.");
			}
		} else {
			var newMsg = new Chat({msg: msg, nick: socket.nickname});
			newMsg.save(function(err){
				if(err) throw err;
				console.log("message sender: " + socket.nickname);
				io.sockets.emit('new message', {msg: msg, nick: socket.nickname});
			});
		}
	});

	// Event handler for when a client attempts to log in
	socket.on('login', function(data, callback){
			
		// Create a query for attaining all usernames in mongo db
		var cursor = User.find({}).cursor();
		var dup = false;
		var pwCheck = false;
		cursor.on('data', function(doc){
			
			// Check for duplication of username
			if (data.nick == doc.nick) {
				dup = true;
				if(data.pw == doc.pw) {
					pwCheck = true;
				}
			}
		});

		cursor.on('close', function(){
			if(data.nick in users_server) {
				// Check to see if user is already existing online in a socket
				callback({name: false, pass: true, err:"Already logged in"});
				console.log("Name already exists");
			} else if(!dup) {
				callback({name: true, pass: false, err:"Username doesn't exist"});
				console.log("No pass entered");
			} else if(!pwCheck) {
				callback({name: true, pass: false, err:"Password is incorrect!"});
			} else {
				callback({name: true, pass: true, err:""});
				//if(err) throw err;
				socket.nickname = data.nick;
				users_server[socket.nickname] = socket;
				updateNicknames();
				console.log("Logged in!");
			}
		})	

	});

	// Handle when http requests to register user
	socket.on('register user', function(data, callback){
		
		// Create a query for attaining all usernames in mongo db
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
		})	
	});

	socket.on('clear history', function(){
		Chat.remove({}, function(err){
			if(err) throw err;
			console.log("Messages erased by: " + socket.nickname);
			
		});
	});

	socket.on("disconnect", function(data){
		if(!socket.nickname) return;
		delete users_server[socket.nickname];
		updateNicknames();
	});

	socket.on('update socket', function(data){
		socket.nickname = data;
	});

	socket.on('collect', function(data, callback) {

		recordData(data);
	});


});