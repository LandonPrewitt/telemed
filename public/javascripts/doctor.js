var peer = null
var conn = null
var peerId = 'doctor'
var remoteId = 'client'
var mediaStream = null
var call

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function getVideo(callback){
    navigator.getUserMedia({audio: true, video: true}, callback, function(error){
        console.log(error);
        alert('An error occured. Please try again');
    });
}

getVideo(function(stream){
    window.localStream = stream;
    onReceiveStream(stream, 'user-video');
});

  function onReceiveStream(stream, element_id){
    var video = $('#' + element_id + ' video')[0];
    video.src = window.URL.createObjectURL(stream);
    window.plocalStream = stream;
  }
// Establish Peer on Doctor Side
/*peer = new Peer('doctor', {
    key: '1b3cntv9vcx1dcxr', 
    debug: 3,
    config: {'iceServers': [
    { url: 'stun:stun1.l.google.com:19302' },
    { url: 'turn:numb.viagenie.ca',
      credential: 'muazkh', username: 'webrtc@live.com' }
    ]}});*/

  var peer = new Peer('doctor',{
    host: 'localhost',
    port: 9000,
    path: '/peerjs',
    debug: 3,
    config: {'iceServers': [
    { url: 'stun:stun1.l.google.com:19302' },
    { url: 'turn:numb.viagenie.ca',
      credential: 'muazkh', username: 'webrtc@live.com' }
    ]}
  });

// Show this peer's ID.
peer.on('open', function(id){
	peerId = id;
    console.log('My Peer ID is ' + id);
});
peer.on('error',function(err) {
	alert(''+err);
});

// Connect to the remote client
peer.on('open', function() {
	alert('peer ID: '+peerId)

})

peer.on('open', function(){
	conn = peer.connect('client', {reliable: true})
})
peer.on('connection', function(c) {
	alert('you have connected to a Client!')
})

peer.on('call', function(call){
	call.answer(window.localStream);

	peer.on('stream', function(stream){
		window.peer_stream = stream;
		onReceiveStream(stream, 'peer-video');
	})

});

function receive_call(){
	
	
/*
	peer.on('call', function(call) {

		console.log("inside the event handler");

  		navigator.getUserMedia({video: true, audio: true}, function(stream) {
	    call.answer(); // Answer the call with an A/V stream. 

	    console.log(call);

	    call.on('stream', function(remoteStream) {
	      $('#peer-video').prop('src', URL.createObjectURL(stream)); 
	    });
	  }, function(err) {
	    console.log('Failed to get local stream' ,err);
	  });
	});*/

}


$('a[href="#connect"]').on('click', function(event) {
		console.log('button pressed!');
		event.preventDefault();

		//receive_call();

		
	});