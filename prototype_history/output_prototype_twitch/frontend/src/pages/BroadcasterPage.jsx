import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StreamSetup from '../components/broadcaster/StreamSetup.jsx';
import MediaPreview from '../components/broadcaster/MediaPreview.jsx';
import StreamControls from '../components/broadcaster/StreamControls.jsx';
import ViewerCounter from '../components/broadcaster/ViewerCounter.jsx';
import { useMediaDevices } from '../hooks/useMediaDevices.js';
import { useWebRTC } from '../hooks/useWebRTC.js';
import { useStreamContext } from '../context/StreamContext.jsx';
import LiveBadge from '../components/shared/LiveBadge.jsx';
import '../styles/broadcaster.css';

export default function BroadcasterPage() {
  const navigate = useNavigate();
  const { createStream, deleteStream, currentStream } = useStreamContext();
  const [streamInfo, setStreamInfo] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [setupError, setSetupError] = useState('');

  const {
    stream: localStream,
    error: mediaError,
    isLoading: mediaLoading,
    startCamera,
    startScreen,
    startBoth,
    stopStream,
  } = useMediaDevices();

  const { connect, disconnect, isConnected } = useWebRTC({
    streamId: streamInfo?.stream_id,
    localStream,
    onViewerCount: setViewerCount,
  });

  const handleStartStream = useCallback(
    async (formData) => {
      setSetupError('');
      try {
        const created = await createStream({
          title: formData.title,
          broadcaster_name: formData.broadcasterName,
          description: formData.description,
        });
        setStreamInfo(created);

        // Start media
        let mediaStarted = false;
        if (formData.source === 'camera') {
          mediaStarted = !!(await startCamera());
        } else if (formData.source === 'screen') {
          mediaStarted = !!(await startScreen());
        } else {
          mediaStarted = !!(await startBoth());
        }

        if (!mediaStarted) {
          await deleteStream(created.stream_id);
          setStreamInfo(null);
          setSetupError('Failed to access media. Please check permissions.');
          return;
        }

        connect(created.stream_id);
        setIsLive(true);
      } catch (err) {
        setSetupError(err.message || 'Failed to start stream');
      }
    },
    [createStream, deleteStream, startCamera, startScreen, startBoth, connect]
  );

  const handleStopStream = useCallback(async () => {
    disconnect();
    stopStream();
    if (streamInfo) {
      await deleteStream(streamInfo.stream_id);
    }
    setIsLive(false);
    setStreamInfo(null);
    setViewerCount(0);
  }, [disconnect, stopStream, deleteStream, streamInfo]);

  return (
    <div className="broadcaster-page">
      <div className="broadcaster-header">
        <h1 className="broadcaster-title">
          {isLive ? (
            <>
              <LiveBadge /> Broadcasting Live
            </>
          ) : (
            'Stream Setup'
          )}
        </h1>
        {isLive && streamInfo && (
          <div className="broadcaster-stream-info">
            <span className="broadcaster-stream-title">{streamInfo.title}</span>
            <ViewerCounter count={viewerCount} />
          </div>
        )}
      </div>

      <div className="broadcaster-layout">
        <div className="broadcaster-main">
          <MediaPreview stream={localStream} isLive={isLive} />

          {!isLive ? (
            <StreamSetup
              onStart={handleStartStream}
              error={setupError || mediaError}
              isLoading={mediaLoading}
            />
          ) : (
            <StreamControls
              isLive={isLive}
              isConnected={isConnected}
              streamInfo={streamInfo}
              onStop={handleStopStream}
            />
          )}
        </div>
      </div>
    </div>
  );
}