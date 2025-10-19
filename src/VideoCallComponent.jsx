import React, { useState, useEffect } from 'react';
import {
  StreamVideoClient,
  StreamVideo,
  StreamCall,
  CallControls,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

const VideoCallUI = ({ call, onLeave }) => {
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();

  if (callingState === 'left') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white">
          <p className="text-2xl mb-4">📞 Call Ended</p>
          <button
            onClick={onLeave}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold hover:scale-105 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Video Layout */}
      <div className="flex-1 relative">
        <SpeakerLayout />
        
        {/* Participants Count */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl text-white font-bold">
          👥 {participants.length} {participants.length === 1 ? 'Participant' : 'Participants'}
        </div>

        {/* Call Status */}
        <div className="absolute top-4 right-4 bg-green-500/80 backdrop-blur-sm px-4 py-2 rounded-xl text-white font-bold flex items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          {callingState === 'ringing' ? 'Calling...' : 
           callingState === 'joining' ? 'Joining...' : 'Connected'}
        </div>
      </div>

      {/* Controls */}
      <div className="py-4 bg-gradient-to-r from-purple-900/80 to-pink-900/80 backdrop-blur-sm">
        <CallControls onLeave={onLeave} />
      </div>
    </div>
  );
};

const VideoCallComponent = ({ 
  videoClient, 
  callId, 
  callType = 'default',
  onClose 
}) => {
  const [call, setCall] = useState(null);
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initCall = async () => {
      try {
        if (!videoClient) {
          throw new Error('Video client not initialized');
        }

        // Create or join the call
        const newCall = videoClient.call(callType, callId);
        
        // Join the call
        await newCall.join({ create: true });
        
        setCall(newCall);
        setIsJoining(false);
      } catch (err) {
        console.error('Error joining call:', err);
        setError(`Failed to join call: ${err.message}`);
        setIsJoining(false);
      }
    };

    initCall();

    // Cleanup on unmount
    return () => {
      if (call) {
        call.leave().catch(console.error);
      }
    };
  }, [videoClient, callId, callType]);

  const handleLeave = async () => {
    try {
      if (call) {
        await call.leave();
      }
    } catch (err) {
      console.error('Error leaving call:', err);
    } finally {
      onClose();
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-red-900 to-pink-900">
        <div className="text-center text-white p-8">
          <p className="text-6xl mb-4">❌</p>
          <p className="text-2xl font-bold mb-4">Call Failed</p>
          <p className="text-lg mb-6">{error}</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900 to-pink-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-2xl font-bold">📞 Joining Call...</p>
          <p className="text-lg mt-2 opacity-80">Please wait</p>
        </div>
      </div>
    );
  }

  if (!call) {
    return null;
  }

  return (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <VideoCallUI call={call} onLeave={handleLeave} />
      </StreamCall>
    </StreamVideo>
  );
};

export default VideoCallComponent;
