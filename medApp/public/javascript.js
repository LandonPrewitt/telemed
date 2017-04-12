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

	// For bp
	$('#collect_bp').click(function(e){
		e.preventDefault();
		socket.emit('collect', 'bp');
	});

	$('#collect_ecg').click(function(e){
		e.preventDefault();
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
			html += "</br>" + "Systolic BP: " + data.val[0] + "</br>";
			html += "     Diastolic BP: " + data.val[1] + "</br>";
			html += "     Pulse: " + data.val[2];
			$('#' + data.type + '_result').html(html);
		} else if (data.type == 'oxi'){
			html += "</br>" + "     Oxygen Saturation: " + data.val[0] + "</br>";
			html += "     Heart Rate: " + data.val[1] + "</br>";
			html += "     Perfusion Index: " + data.val[2];
			$('#' + data.type + '_result').html(html);	
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