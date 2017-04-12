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
	var $vitalsID = 'n/a';


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
		socket.emit('load history', $myName ,function(data) {

			$('#history').html('');

			for(var i=data.length-1; i>=0; i--) {
				$('#history').append('<div style="border-style: groove;">');
			//	for(var j=0; j<data[i].length; j++) {
					$('#history').append('Time-stamp: ' + data[i]['date'] + '</br>');
					$('#history').append('Weight: ' + data[i]['weight'] + '</br>');
					$('#history').append('Blood Pressure: ' + data[i]['bp'] + '</br>');
					$('#history').append('Blood Oxygen: ' + data[i]['bo'] + '</br>');
					$('#history').append('Temperature: ' + data[i]['temp'] + '</br>');
					$('#history').append('ECG: ' + data[i]['ecg'] + '</br>');

			//	}
				$('#history').append('</div>');
			}
			

		});
	});

	// Handle when Record Vitals is opened
	$('#record_btn').click(function(e){
		e.preventDefault();
		$('#mainmenuWrap').hide();
		$('#recordWrap').show();
		get_token();
	});

	$('#logout_btn').click(function(e){
		socket.disconnect();
		$('#mainmenuWrap').hide();
		$('#nickWrap').show();
		$vitalsID = 'n/a';
		$myName = '';
		socket.connect();
	});

	// ======================= jQuery for Recording Vitals ===================================

	$('#collect_sc').click(function(e){
		e.preventDefault();
		$('#sc_result').html("Measuring...");
		socket.emit('collect', 'sc');
	});

	$('#collect_temp').click(function(e){
		e.preventDefault();
		$('#temp_result').html("Measuring...");
		socket.emit('collect', 'temp');
	});

	// Oximeter
	$('#collect_oxi').click(function(e){
		e.preventDefault();
		$('#oxi_result').html("Measuring...");
		socket.emit('collect', 'oxi');
	});

	// For bp
	$('#collect_bp').click(function(e){
		e.preventDefault();
		$('#bp_result').html("Measuring...");
		socket.emit('collect', 'bp');
	});

	$('#collect_ecg').click(function(e){
		e.preventDefault();
		$('#ecg_result').html("Measuring...");
		socket.emit('collect', 'ecg');
	});

	$('#recordBack_btn').click(function(e){
		e.preventDefault();

		var sc = $('#sc_result').html();
		var temp = $('#temp_result').html();
		var oxi = $('#oxi_result').html();
		var bp = $('#bp_result').html();
		var ecg = $('#ecg_result').html();

		socket.emit('save vitals', {
			nick: $myName,
			sc: sc,
			temp: temp,
			oxi: oxi,
			bp: bp,
			ecg: ecg,
			id: $vitalsID
		}, function(data) {
			$vitalsID = data;
		});


	});

	socket.on('push vital', function(data){

		var html = '';

		if(data.type == 'bp') {

			// CHeck if error occured during measurements
			if(data.val[0] == "e1") {
				$('#bp_result').html("Sensor is offline!");
			} else if(data.val[0] == "e2") {
				$('#bp_result').html("Measurement did not complete correctly!");
			} else if(data.val[0] == "e3" || data.val[0] == "e4") {
				$('#bp_result').html("Invalid Command!");
			} else {

				// If no error occured, display the values
				html += "</br>" + "Systolic BP: " + data.val[0] + "</br>";
				html += "     Diastolic BP: " + data.val[1] + "</br>";
				html += "     Pulse: " + data.val[2];
				$('#' + data.type + '_result').html(html);
			}

			
		} else if (data.type == 'oxi'){

			// Check if error occured during measurements
			if(data.val[0] == "e1") {
				$('#bp_result').html("Sensor is offline!");
			} else if(data.val[0] == "e2") {
				$('#bp_result').html("Measurement did not complete correctly!");
			} else if(data.val[0] == "e3" || data.val[0] == "e4") {
				$('#bp_result').html("Invalid Command!");
			} else {

				// If no error occured, display the values
				html += "</br>" + "     Oxygen Saturation: " + data.val[0] + "</br>";
				html += "     Heart Rate: " + data.val[1] + "</br>";
				html += "     Perfusion Index: " + data.val[2];
				$('#' + data.type + '_result').html(html);
			}

				
		} else {
			$('#' + data.type + '_result').html(data.val);
		}
		
		
		
		
	
	});


	// ======================= jQuery for Chat Menu Buttons ===================================

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

// ================================= ZACHS CODE FOR VIDEO INTEGRATION ========================================

var activeRoom;
var previewTracks;
var identity;
var roomName;
var token;

var endoRoom;

function attachTracks(tracks, container) {
  tracks.forEach(function(track) {
    container.appendChild(track.attach());
  });
}

function attachParticipantTracks(participant, container) {
  var tracks = Array.from(participant.tracks.values());
  attachTracks(tracks, container);
}

function detachTracks(tracks) {
  tracks.forEach(function(track) {
    track.detach().forEach(function(detachedElement) {
      detachedElement.remove();
    });
  });
}

function detachParticipantTracks(participant) {
  var tracks = Array.from(participant.tracks.values());
  detachTracks(tracks);
}

// Check for WebRTC
if (!navigator.webkitGetUserMedia && !navigator.mozGetUserMedia) {
  alert('WebRTC is not available in your browser.');
}

function establish_call(){

    //$.getJSON('/token', function(data) {

       // token = data.token;

        // TODO pull from database/server
        identity = 'John Doe';

        // TODO to be pulled from database of logged in client
        // or simply 'webcam'
        roomName = 'Patient ' + identity;

        var connectOptions = { name: roomName, logLevel: 'debug' };
        if (previewTracks) {
            connectOptions.tracks = previewTracks;
        }

        const { connect, createLocalTracks } = Twilio.Video;

        Twilio.Video.createLocalTracks().then(localTracks => {
            Twilio.Video.connect(token, { name: roomName, tracks: localTracks }).then(roomJoined);
        }); 
    //});


}

function get_token(){
	$.getJSON('/token', function(data) {
        token = data.token;
   	 });
}

// Successfully connected to video conference
function roomJoined(room) {
  activeRoom = room;

  // Draw local video, if not already previewing
  var previewContainer = document.getElementById('local_media');
  if (!previewContainer.querySelector('video')) {
    attachParticipantTracks(room.localParticipant, previewContainer);
  }

  room.participants.forEach(function(participant) {
    var previewContainer = document.getElementById('remote_media');
    attachParticipantTracks(participant, previewContainer);
  });

  // When a participant joins, draw their video on screen
  room.on('participantConnected', function(participant) {
  });

  room.on('trackAdded', function(track, participant) {
    var previewContainer = document.getElementById('remote_media');
    attachTracks([track], previewContainer);
  });

  room.on('trackRemoved', function(track, participant) { detachTracks([track]); });
 
  // When a participant disconnects, note in //log
  room.on('participantDisconnected', function(participant) {
    detachParticipantTracks(participant);
  });

  // When we are disconnected, stop capturing local video
  // Also remove media for all remote participants
  room.on('disconnected', function() {
    detachParticipantTracks(room.localParticipant);
    room.participants.forEach(detachParticipantTracks);
    activeRoom = null;
  });
}

function drawEndoscope(room) {
  endoRoom = room;

  // Draw local video, if not already previewing
  var previewContainer = document.getElementById('endoscope_view');
  if (!previewContainer.querySelector('video')) {
    attachParticipantTracks(room.localParticipant, previewContainer);
  }

  // When a participant joins, draw their video on screen
  room.on('participantConnected', function(participant) {
  });

  room.on('trackRemoved', function(track, participant) { detachTracks([track]); });

  // When a participant disconnects, note in //log
  room.on('participantDisconnected', function(participant) {
    detachParticipantTracks(participant);
  });

  // When we are disconnected, stop capturing local video
  // Also remove media for all remote participants
  room.on('disconnected', function() {
    detachParticipantTracks(room.localParticipant);
    room.participants.forEach(detachParticipantTracks);
    endoRoom = null;
  });
}

function leaveRoomIfJoined() {
  while (activeRoom) {
  	console.log('disconnecting from the twilio room')
    activeRoom.disconnect();
    document.getElementById('enable-chat').innerHTML = 'Connect to a Doctor';
  }
  activeRoom = null;
  
  if(endoRoom){
  	endoRoom.disconnect();
  	document.getElementById('endoscope-enable').innerHTML = 'Enable Endoscope';
  }
  endoRoom = null;
}

document.getElementById('endoscope-enable').onclick = function(){

  if(!endoRoom){
    var endoscopeView = document.getElementById('endoscope_view');
    
    navigator.mediaDevices.enumerateDevices().then(devices => {
      var videoInput = devices.find(device => device.label == "USB 2.0 PC Cam (090c:037c)");
      return Twilio.Video.createLocalTracks({ audio: false, video: { deviceId: videoInput.deviceId } });
    }).then(localTracks => {
    return Twilio.Video.connect(token, { name: 'Endoscope', tracks: localTracks }).then(drawEndoscope);
  });
    document.getElementById('endoscope-enable').innerHTML = 'Disable Endoscope';
  } else {
    endoRoom.disconnect();
    endoRoom = null;
    document.getElementById('endoscope-enable').innerHTML = 'Enable Endoscope';
  }
}

document.getElementById('enable-chat').onclick = function(){
	if(!activeRoom){
		establish_call();
		// TODO communicate to Doctor portal that 'username' is waiting to chat
		document.getElementById('enable-chat').innerHTML = 'Disconnect';
  } else {
		//Leaving chat with doctor
		activeRoom.disconnect();
		activeRoom = null;
		document.getElementById('enable-chat').innerHTML = 'Connect to a Doctor';
	}
}