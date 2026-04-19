import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/viewer/VideoPlayer.jsx';
import StreamInfo from '../components/viewer/StreamInfo.jsx';
import ChatBox from '../components/chat/ChatBox.jsx';
import { useWebRTCViewer } from '../hooks/useWebRTCViewer.js';
import { useChat } from '../hooks/useChat.js';
import { useStreamContext } from '../context/StreamContext.jsx';
import { useChatContext } from '../context/ChatContext.jsx';
import LiveBadge from '../components/shared/LiveBadge.jsx';
import NetworkStatus from '../components/shared/NetworkStatus.jsx';
import '../styles/viewer.css';

export default function WatchPage() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const { getStream } = useStreamContext();
  const { addMessage, setMessages } = useChatContext();

  const [streamData, setStreamData] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamEnded, setStreamEnded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const handleIncomingMessageRef = useRef(null);

  const handleRemoteStream = useCallback((stream) => {
    setRemoteStream(stream);
  }, []);

  const handleStreamEnded = useCallback(() => {
    setStreamEnded(true);
  }, []);

  const handleViewerCount = useCallback((count) => {
    setViewerCount(count);
  }, []); 

  const { connect, disconnect, isConnected, getWs } = useWebRTCViewer({
    streamId,
    onRemoteStream: handleRemoteStream,
    onStreamEnded: handleStreamEnded,
    onViewerCount: handleViewerCount,
    onMessage: (msg) => handleIncomingMessageRef.current?.(msg),
  });

  const { messages, username, saveUsername, sendMessage, handleIncomingMessage } =
    useChat({ getWs, streamId });

  useEffect(() => {
    handleIncomingMessageRef.current = handleIncomingMessage;
  }, [handleIncomingMessage]);

  // Connect WebRTC viewer
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // Load stream info
  useEffect(() => {
    async function load() {
      const data = await getStream(streamId);
      if (data) {
        setStreamData(data);
        setViewerCount(data.viewer_count);
      }
    }
    load();
  }, [streamId, getStream]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((v) => !v);
  }, []);

  if (streamEnded) {
    return (
      <div className="watch-ended">
        <div className="watch-ended-content">
          <div className="watch-ended-icon">📴</div>
          <h2>Stream Ended</h2>
          <p>The broadcaster has ended this stream.</p>
          <button className="btn btn-primary" onClick={() => navigate('/streams')}>
            Browse Other Streams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`watch-page ${isFullscreen ? 'watch-page--fullscreen' : ''}`}>
      <div className="watch-layout">
        <div className="watch-main">
          <div className="watch-video-container">
            <VideoPlayer
              stream={remoteStream}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            />
            <div className="watch-video-overlay">
              <LiveBadge />
              <NetworkStatus isConnected={isConnected} />
            </div>
          </div>

          {streamData && (
            <StreamInfo
              stream={streamData}
              viewerCount={viewerCount}
              isConnected={isConnected}
            />
          )}
        </div>

        {!isFullscreen && (
          <div className="watch-sidebar">
            <ChatBox
              streamId={streamId}
              messages={messages}
              username={username}
              onSaveUsername={saveUsername}
              onSendMessage={sendMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
}