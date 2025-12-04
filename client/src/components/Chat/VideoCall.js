import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { FiX, FiPhone, FiVideo, FiVideoOff, FiMic, FiMicOff } from 'react-icons/fi';
import './VideoCall.css';

const VideoCall = ({ call, onEndCall, selectedUser, currentUser }) => {
  const { socket } = useSocket();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState(call.type === 'incoming' ? 'ringing' : 'calling');
  const peerConnectionRef = useRef(null);
  const callIdRef = useRef(call.callId);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    if (!socket) return;

    // Handle call acceptance
    const handleCallAccepted = ({ callId, receiverId, receiverName }) => {
      if (callId === callIdRef.current) {
        setCallStatus('accepted');
        initializeCall();
      }
    };

    const handleCallReady = ({ callId }) => {
      if (callId === callIdRef.current && call.type === 'incoming') {
        setCallStatus('accepted');
        initializeCall();
      }
    };

    const handleCallRejected = ({ callId }) => {
      if (callId === callIdRef.current) {
        cleanup();
        alert('Call rejected');
        onEndCall();
      }
    };

    const handleCallEnded = ({ callId }) => {
      if (callId === callIdRef.current) {
        cleanup();
        onEndCall();
      }
    };

    // WebRTC signaling handlers
    const handleOffer = async ({ callId, offer, senderId }) => {
      if (callId !== callIdRef.current) return;
      
      try {
        if (!peerConnectionRef.current) {
          createPeerConnection();
        }
        
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        socket.emit('webrtc:answer', { callId, answer });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    };

    const handleAnswer = async ({ callId, answer }) => {
      if (callId !== callIdRef.current || !peerConnectionRef.current) return;
      
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    };

    const handleIceCandidate = async ({ callId, candidate, senderId }) => {
      if (callId !== callIdRef.current || !peerConnectionRef.current) return;
      
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    };

    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:ready', handleCallReady);
    socket.on('call:rejected', handleCallRejected);
    socket.on('call:ended', handleCallEnded);
    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswer);
    socket.on('webrtc:ice-candidate', handleIceCandidate);

    // If outgoing call, wait for acceptance
    // If incoming call, auto-answer or wait for user action
    if (call.type === 'outgoing') {
      // Wait for call:accepted event
    } else if (call.type === 'incoming') {
      // User needs to accept manually
    }

    return () => {
      socket.off('call:accepted', handleCallAccepted);
      socket.off('call:ready', handleCallReady);
      socket.off('call:rejected', handleCallRejected);
      socket.off('call:ended', handleCallEnded);
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:answer', handleAnswer);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
    };
    // Functions (cleanup, createPeerConnection, initializeCall) are defined below and
    // used within event handlers. Adding them to deps would cause infinite loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, call.type]);

  const cleanup = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [localStream, remoteStream]);

  useEffect(() => {
    return () => {
      cleanup();
    };
    // Cleanup should only run on unmount, not when cleanup function changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserMedia = async () => {
    try {
      const constraints = {
        video: call.callType === 'video' ? { width: 1280, height: 720 } : false,
        audio: true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone. Please check permissions.');
      return null;
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(iceServers);
    
    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc:ice-candidate', {
          callId: callIdRef.current,
          candidate: event.candidate
        });
      }
    };

    peerConnectionRef.current = pc;
  };

  const initializeCall = async () => {
    const stream = await getUserMedia();
    if (!stream) return;

    createPeerConnection();

    // If caller, create offer
    if (call.type === 'outgoing') {
      try {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        
        socket.emit('webrtc:offer', {
          callId: callIdRef.current,
          offer: peerConnectionRef.current.localDescription
        });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }
  };

  const handleAcceptCall = () => {
    if (!socket) return;
    
    socket.emit('call:accept', { callId: callIdRef.current });
    setCallStatus('accepted');
    initializeCall();
  };

  const handleRejectCall = () => {
    if (socket) {
      socket.emit('call:reject', { callId: callIdRef.current });
    }
    cleanup();
    onEndCall();
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
        setVideoEnabled(!videoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
        setAudioEnabled(!audioEnabled);
      }
    }
  };


  const handleEndCall = () => {
    if (socket) {
      socket.emit('call:end', { callId: callIdRef.current });
    }
    cleanup();
    onEndCall();
  };

  const callerName = call.type === 'incoming' ? call.callerName : selectedUser?.username;
  const isVideoCall = call.callType === 'video';

  return (
    <div className="video-call-container">
      <div className="video-call-header">
        <div className="call-info">
          <h3>{callerName}</h3>
          <p>{callStatus === 'ringing' || callStatus === 'calling' ? 'Calling...' : 'In call'}</p>
        </div>
        {call.type === 'incoming' && callStatus === 'ringing' && (
          <div className="call-actions-incoming">
            <button onClick={handleRejectCall} className="reject-button">
              <FiX />
            </button>
            <button onClick={handleAcceptCall} className="accept-button">
              <FiPhone />
            </button>
          </div>
        )}
      </div>

      <div className="video-call-content">
        {callStatus === 'accepted' && (
          <>
            {isVideoCall && remoteStream && (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="remote-video"
              />
            )}
            
            {isVideoCall && localStream && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="local-video"
              />
            )}
            
            {!isVideoCall && (
              <div className="audio-call-view">
                <div className="avatar-large">
                  {callerName?.charAt(0).toUpperCase()}
                </div>
                <h2>{callerName}</h2>
                <p>Audio Call</p>
              </div>
            )}
          </>
        )}

        {(callStatus === 'ringing' || callStatus === 'calling') && (
          <div className="calling-view">
            <div className="avatar-large">
              {callerName?.charAt(0).toUpperCase()}
            </div>
            <h2>{callerName}</h2>
            <p>{call.type === 'outgoing' ? 'Calling...' : 'Incoming call'}</p>
          </div>
        )}
      </div>

      {callStatus === 'accepted' && (
        <div className="video-call-controls">
          <button
            onClick={toggleAudio}
            className={`control-button ${!audioEnabled ? 'disabled' : ''}`}
            title={audioEnabled ? 'Mute' : 'Unmute'}
          >
            {audioEnabled ? <FiMic /> : <FiMicOff />}
          </button>
          {isVideoCall && (
            <button
              onClick={toggleVideo}
              className={`control-button ${!videoEnabled ? 'disabled' : ''}`}
              title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {videoEnabled ? <FiVideo /> : <FiVideoOff />}
            </button>
          )}
          <button
            onClick={handleEndCall}
            className="end-call-button"
            title="End call"
          >
            <FiX />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;

