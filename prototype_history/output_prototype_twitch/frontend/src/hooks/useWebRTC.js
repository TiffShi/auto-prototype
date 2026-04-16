import { useRef, useCallback, useState } from 'react';
import { ENDPOINTS } from '../config.js';

const ICE_SERVERS = [];

export function useWebRTC({ streamId, localStream, onViewerCount }) {
  const wsRef = useRef(null);
  const peerConnections = useRef({}); // viewerId -> RTCPeerConnection
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const localStreamRef = useRef(localStream);
  localStreamRef.current = localStream;

  const createPeerConnection = useCallback(
    (viewerId) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      pc.onicecandidate = (evt) => {
        if (evt.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'ice-candidate-to-viewer',
              target_id: viewerId,
              payload: evt.candidate.toJSON(),
            })
          );
        }
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === 'disconnected' ||
          pc.connectionState === 'failed' ||
          pc.connectionState === 'closed'
        ) {
          delete peerConnections.current[viewerId];
        }
      };

      peerConnections.current[viewerId] = pc;
      return pc;
    },
    []
  );

  const handleViewerJoined = useCallback(
    async (viewerId) => {
      const pc = createPeerConnection(viewerId);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        wsRef.current?.send(
          JSON.stringify({
            type: 'offer-to-viewer',
            target_id: viewerId,
            payload: { type: offer.type, sdp: offer.sdp },
          })
        );
      } catch (err) {
        console.error('Failed to create offer for viewer:', err);
      }
    },
    [createPeerConnection]
  );

  const handleAnswer = useCallback(async (viewerId, sdp) => {
    const pc = peerConnections.current[viewerId];
    if (!pc) return;
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    } catch (err) {
      console.error('Failed to set remote description:', err);
    }
  }, []);

  const handleIceCandidate = useCallback(async (viewerId, candidate) => {
    const pc = peerConnections.current[viewerId];
    if (!pc) return;
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('Failed to add ICE candidate:', err);
    }
  }, []);

  const connect = useCallback((explicitStreamId) => {
    // Prioritize the explicitly passed ID to bypass React's asynchronous state updates
    const activeId = explicitStreamId || streamId;
    if (!activeId) return;
    
    const wsUrl = ENDPOINTS.wsBroadcast(activeId);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = async (evt) => {
      let msg;
      try {
        msg = JSON.parse(evt.data);
      } catch {
        return;
      }

      const { type, payload, sender_id } = msg;

      switch (type) {
        case 'connected':
          setViewerCount(payload.viewer_count || 0);
          onViewerCount?.(payload.viewer_count || 0);
          break;

        case 'viewer-joined':
          await handleViewerJoined(payload.viewer_id);
          break;

        case 'viewer-left':
          if (peerConnections.current[payload.viewer_id]) {
            peerConnections.current[payload.viewer_id].close();
            delete peerConnections.current[payload.viewer_id];
          }
          break;

        case 'answer':
          await handleAnswer(sender_id, payload);
          break;

        case 'ice-candidate':
          await handleIceCandidate(sender_id, payload);
          break;

        case 'viewer_count':
          setViewerCount(payload.count || 0);
          onViewerCount?.(payload.count || 0);
          break;

        default:
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.error('Broadcaster WS error:', err);
    };
  }, [streamId, handleViewerJoined, handleAnswer, handleIceCandidate, onViewerCount]);

  const disconnect = useCallback(() => {
    // Close all peer connections
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setViewerCount(0);
  }, []);

  return { connect, disconnect, isConnected, viewerCount };
}