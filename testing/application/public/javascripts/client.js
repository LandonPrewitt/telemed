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

// When we are about to transition away from this page, disconnect
// from the room, if joined.
window.addEventListener('beforeunload', leaveRoomIfJoined);

$.getJSON('/token', function(data) {

  token = data.token;

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
      console.log('audio and video tracks: ', localTracks[1]);
      Twilio.Video.connect(token, { name: roomName, tracks: localTracks }).then(roomJoined);
    });
  
});

// Successfully connected!
function roomJoined(room) {
  activeRoom = room;

  // Draw local video, if not already previewing
  var previewContainer = document.getElementById('local-media');
  if (!previewContainer.querySelector('video')) {
    attachParticipantTracks(room.localParticipant, previewContainer);
  }

  room.participants.forEach(function(participant) {
    var previewContainer = document.getElementById('remote-media');
    attachParticipantTracks(participant, previewContainer);
  });

  // When a participant joins, draw their video on screen
  room.on('participantConnected', function(participant) {
  });

  room.on('trackAdded', function(track, participant) {
    var previewContainer = document.getElementById('remote-media');
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
  var previewContainer = document.getElementById('endoscope');
  if (!previewContainer.querySelector('video')) {
    attachParticipantTracks(room.localParticipant, previewContainer);
  }

  // When a participant joins, draw their video on screen
  room.on('participantConnected', function(participant) {
  });

  room.on('trackAdded', function(track, participant) {
    var previewContainer = document.getElementById('remote-media');
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

function leaveRoomIfJoined() {
  if (activeRoom) {
    activeRoom.disconnect();
  }
}

document.getElementById('endoscope-enable').onclick = function(){

  if(!endoRoom){
    var endoscopeView = document.getElementById('endoscope');
    
    navigator.mediaDevices.enumerateDevices().then(devices => {
      var videoInput = devices.find(device => device.label == "USB 2.0 PC Cam (090c:037c)");
      return Twilio.Video.createLocalTracks({ audio: false, video: { deviceId: videoInput.deviceId } });
    }).then(localTracks => {
    return Twilio.Video.connect(token, { name: 'Endoscope', tracks: localTracks }).then(drawEndoscope);
  });
    document.getElementById('endoscope-enable').innerHTML = 'Disable Endoscope';
  } else {
    endoRoom.disconnect();
    document.getElementById('endoscope-enable').innerHTML = 'Enable Endoscope';
  }
}