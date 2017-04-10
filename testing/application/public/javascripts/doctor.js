var activeRoom;
var previewTracks;
var identity;
var roomName;

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

  // TODO pull from database of doctor logged on
  identity = 'The Doctor';

  //document.getElementById('room-controls').style.display = 'block';

      // TODO to be pulled from list of clients logged on
     roomName = 'Patient John Doe';

      var connectOptions = { name: roomName, logLevel: 'debug' };
      
      if (previewTracks) {
        connectOptions.tracks = previewTracks;
      }

      Twilio.Video.connect(data.token, connectOptions).then(roomJoined, function(error) {
        console.log('Could not connect to Twilio: ' + error.message);
      });

      Twilio.Video.connect(data.token, {name: "Endoscope", video: false}).then(drawEndoscope, function(error) {
        console.log('Could not connect to Twilio: ' + error.message);
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
  room.on('participantDisconnected', function(participant) { detachParticipantTracks(participant); });

  // When we are disconnected, stop capturing local video
  // Also remove media for all remote participants
  room.on('disconnected', function() {
    detachParticipantTracks(room.localParticipant);
    room.participants.forEach(detachParticipantTracks);
    activeRoom = null;
  });
}

function drawEndoscope(room) {
  //activeRoom = room;

  room.participants.forEach(function(participant) {
    var previewContainer = document.getElementById('endoscope');
    attachParticipantTracks(participant, previewContainer);
  });

  // When a participant joins, draw their video on screen
  room.on('participantConnected', function(participant) {
  });

  room.on('trackAdded', function(track, participant) {
    var previewContainer = document.getElementById('endoscope');
    attachTracks([track], previewContainer);
  });

  room.on('trackRemoved', function(track, participant) { detachTracks([track]); });

  // When a participant disconnects, note in //log
  room.on('participantDisconnected', function(participant) { detachParticipantTracks(participant); });

  // When we are disconnected, stop capturing local video
  // Also remove media for all remote participants
  room.on('disconnected', function() {
    detachParticipantTracks(room.localParticipant);
    room.participants.forEach(detachParticipantTracks);
    activeRoom = null;
  });
}

//  Local video preview
document.getElementById('button-preview').onclick = function() {
  var localTracksPromise = previewTracks
    ? Promise.resolve(previewTracks)
    : Twilio.Video.createLocalTracks();

  localTracksPromise.then(function(tracks) {
    previewTracks = tracks;
    var previewContainer = document.getElementById('local-media');
    if (!previewContainer.querySelector('video')) {
      attachTracks(tracks, previewContainer);
    }
  }, function(error) {
    console.error('Unable to access local media', error);
    console.log('Unable to access Camera and Microphone');
  });
};

function leaveRoomIfJoined() {
  if (activeRoom) {
    activeRoom.disconnect();
  }
}