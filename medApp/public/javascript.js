jQuery(function($){
	
	// Declare variables
	var socket = io.connect();
	var $messageForm = $('#send-message');
	var $clear = $('#clear');
	var $messageBox =$('#message');
	var $chat = $('#chat');
	var $nickForm = $('#setNick');
	var $errorMsg = $('#errorMsg');
	var $nickBox = $('#nickname');
	var $password = $('#password');
	var $nickBox2 = $('#nickname2');
	var $password2 = $('#password2');
	var $users = $('#users');
	var $login = $('#login_btn');
	var $register = $('#register_btn');
	var $getStarted = $('#getStarted_btn');
	var $chat_btn = $('chat_btn');
	var $myName = '';

	var apiKey = '45817922';
	var sessionId = '';
	var token = '';
	



	// ======================= jQuery for Logging in / Registering ===================================

	// Hande the action for when a user defines their nickname and submits
	$login.click(function(e){
		e.preventDefault();
		socket.emit('login', {nick: $nickBox.val(), pw: $password.val()}, function(data){
			if(data.err != ''){
				$errorMsg.html('<span class="error">' + data.err + '</span>');
			} else {
				$('#nickWrap').hide();
				//window.open("/conference","_self")
				//$('#contentWrap').show();
				$('#mainmenuWrap').show();
			}
		});
		$myName = $nickBox.val();
		$nickBox.val('');
		$password.val('');
	});

	// Handle the action for registering a user *register_btn clicked*
	$register.click(function(e){
		e.preventDefault();
		$('#nickWrap').hide();
		$('#registerWrap').show();

	});

	// Handle when the user submits their registration
	$getStarted.click(function(e){
		socket.emit('register user', {
			nick: $nickBox2.val(), 
			pw: $password2.val(), 
			name: $('#name').val(), 
			email: $('#email').val(), 
			phone: $('#phone').val(),
			doctor: $('#doctorBox').is(':checked')}, 
			function(data){
				if(!data.name){
					$errorMsg.html('<span class="error">That username is already taken!</span>');
				} else if(!data.pass) {
					$errorMsg.html('<span class="error">Enter a valid password!</span>');
				} else {
					$('#registerWrap').hide();
					//window.open("/conference","_self")
					//$('#contentWrap').show();
					$('#mainmenuWrap').show();
					//socket.emit('update socket', $nickBox.val());
				}
			});
		$myName = $nickBox2.val();
		$nickBox.val('');
		$password.val('');
	});

	// ======================= jQuery for main menu buttons ===================================

	// Handle when chat is opened
	$('#chat_btn').click(function(e){
		e.preventDefault();
		$('#mainmenuWrap').hide();
		$('#contentWrap').show();
	});

	// Handle when FAQ is opened
	$('#faq_btn').click(function(e){
		e.preventDefault();
		$('#mainmenuWrap').hide();
		$('#faqWrap').show();
	});

	// Handle when History is opened
	$('#history_btn').click(function(e){
		e.preventDefault();
		$('#mainmenuWrap').hide();
		$('#historyWrap').show();
	});

	// Handle when Record Vitals is opened
	$('#record_btn').click(function(e){
		e.preventDefault();
		$('#mainmenuWrap').hide();
		$('#recordWrap').show();
	});

	$('#logout_btn').click(function(e){
		socket.disconnect();
		$('#mainmenuWrap').hide();
		$('#nickWrap').show();
		socket.connect();
	});

	// ======================= jQuery for Recording Vitals ===================================

	$('#collect_sc').click(function(e){
		e.preventDefault();
		socket.emit('collect', 'sc');
	});

	$('#collect_temp').click(function(e){
		e.preventDefault();
		socket.emit('collect', 'temp');
	});

	// Oximeter
	$('#collect_oxi').click(function(e){
		e.preventDefault();
		socket.emit('collect', 'oxi');
	});

	// Oximeter
	$('#collect_hr').click(function(e){
		e.preventDefault();
		socket.emit('collect', 'hr');
	});

	// Oximeter
	$('#collect_pi').click(function(e){
		e.preventDefault();
		socket.emit('collect', 'pi');
	});

	// For bp
	$('#collect_sys').click(function(e){
		e.preventDefault();
		socket.emit('collect', 'sys');
	});

	// For bp
	$('#collect_diabp').click(function(e){
		e.preventDefault();
		socket.emit('collect', 'diabp');
	});

	// For bp
	$('#collect_pulse').click(function(e){
		e.preventDefault();
		socket.emit('collect', 'pulse');
	});

	$('#collect_ecg').click(function(e){
		e.preventDefault();
		socket.emit('collect', 'ecg');
	});

	socket.on('push vital', function(data){
		$('#' + data.type + '_result').html(data.val);
	});

	// ======================= jQuery for Chat Menu Buttons ===================================

	// Button for creating video chat room
	$('#createRoom').click(function(e){
		e.preventDefault();
			
		   	socket.emit('start video', function(data) {
				sessionId = data.session;
				token = data.token;
				
				// Initialize an OpenTok Session object
				var session = TB.initSession(sessionId);

				// Initialize a Publisher, and place it into the element with id="publisher"
				var publisher = TB.initPublisher(apiKey, 'publisher');

				// Attach event handlers
				session.on({

				  // This function runs when session.connect() asynchronously completes
				  sessionConnected: function(event) {
				    // Publish the publisher we initialzed earlier (this will trigger 'streamCreated' on other
				    // clients)
				    session.publish(publisher);
				  },

				  // This function runs when another client publishes a stream (eg. session.publish())
				  streamCreated: function(event) {
				    // Create a container for a new Subscriber, assign it an id using the streamId, put it inside
				    // the element with id="subscribers"
				    var subContainer = document.createElement('div');
				    subContainer.id = 'stream-' + event.stream.streamId;
				    document.getElementById('subscribers').appendChild(subContainer);

				    // Subscribe to the stream that caused this event, put it inside the container we just made
				    session.subscribe(event.stream, subContainer);
				  }

				});

				// Connect to the Session using the 'apiKey' of the application and a 'token' for permission
				session.connect(apiKey, token);
					

			}); 
		
	});

	// Button for joining chat room
	$('#joinRoom').click(function(e){
		e.preventDefault();

		socket.emit('getRoomInfo', function(data){
			sessionId = data.sessionId;
			token = data.token;

			// ..
			var session = TB.initSession(sessionId);

			// Initialize a Publisher, and place it into the element with id="publisher"
			var publisher = TB.initPublisher(apiKey, 'publisher');

			// Attach event handlers
			session.on({


			  // This function runs when session.connect() asynchronously completes
			  sessionConnected: function(event) {
			    // Publish the publisher we initialzed earlier (this will trigger 'streamCreated' on other
			    // clients)
			    session.publish(publisher);
			  },

			  // This function runs when another client publishes a stream (eg. session.publish())
			  streamCreated: function(event) {
			    // Create a container for a new Subscriber, assign it an id using the streamId, put it inside
			    // the element with id="subscribers"
			    var subContainer = document.createElement('div');
			    subContainer.id = 'stream-' + event.stream.streamId;
			    document.getElementById('subscribers').appendChild(subContainer);

			    // Subscribe to the stream that caused this event, put it inside the container we just made
			    session.subscribe(event.stream, subContainer);
			  }

			});

			// Connect to the Session using the 'apiKey' of the application and a 'token' for permission
			session.connect(apiKey, token);

		});
	});

	// Hanle when chatBack_btn is clicked
	$('.back_btn').click(function(e){
		e.preventDefault();
		$('#mainmenuWrap').show();
		$('#contentWrap').hide();
		$('#faqWrap').hide();
		$('#historyWrap').hide();
		$('#recordWrap').hide();
	});

	// Handle the function for when message is being sent
	$('#message').keyup(function(e){
		if(e.keyCode == 13){
			$('#sendMsg').click();
		}})
	$('#sendMsg').click(function(e){
		e.preventDefault();
		socket.emit('send message', $messageBox.val(), function(data){
			$chat.append('<span class=\"error"><b>' + data + "</span></br>");
		});
		$messageBox.val('');});

	// Handling sending the message data to the client
	socket.on('new message', function(data){
		displayMsg(data);
	});

	// Handle the generation of the usernames
	socket.on('usernames', function(data){
		var html = '';
		for(var i=0; i<data.users.length; i++){
			if(data.users[i] == $myName) {
				html += "<span style='color:green'>" + data.users[i] + "</span><br/>"
			} else {
				html += data.users[i] + '<br/>';
			}
		}

		$users.html(html);
	})

	// Handle a whisper message send from server
	socket.on('whisper', function(data){
		$chat.append('<span class=\"whisper"><b>' + data.nick + ': </b>' + data.msg + "</span></br>");
	});

	// Handle when chat loads - getting old messages
	socket.on('load old messages', function(docs){
		for(var i=0; i<docs.length; i++){
			displayMsg(docs[i]);
		}
	});

	// Handle the clear chat history button
	$clear.click(function(e){
		e.preventDefault();
		socket.emit('clear history');
		$chat.html('');
	});

	// Quick function for displaying Messages
	function displayMsg(data){
		$chat.append('<span class=\"msg"><b>' + data.nick + ': </b>' + data.msg + "</span></br>");
		$chat.scrollTop($chat.prop('scrollHeight'));
	}

});