import { useRef, useCallback, useState } from 'react';
import { ENDPOINTS } from '../config.js';

const ICE_SERVERS = [];

export function useWebRTCViewer({ streamId, onRemoteStream, onStreamEnded, onViewerCount, onMessage }) {
  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [viewerIdRef] = useState({ current: null });
  const isDisconnecting = useRef(false);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.ontrack = (evt) => {
      if (evt.streams && evt.streams[0]) {
        onRemoteStream?.(evt.streams[0]);
      }
    };

    pc.onicecandidate = (evt) => {
      if (evt.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'ice-candidate',
            payload: evt.candidate.toJSON(),
          })
        );
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setIsConnected(true);
      } else if (
        pc.connectionState === 'disconnected' ||
        pc.connectionState === 'failed'
      ) {
        setIsConnected(false);
      }
    };

    pcRef.current = pc;
    return pc;
  }, [onRemoteStream]);

  const handleOffer = useCallback(
    async (sdp) => {
      const pc = pcRef.current || createPeerConnection();
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        wsRef.current?.send(
          JSON.stringify({
            type: 'answer',
            payload: { type: answer.type, sdp: answer.sdp },
          })
        );
      } catch (err) {
        console.error('Failed to handle offer:', err);
      }
    },
    [createPeerConnection]
  );

  const handleIceCandidate = useCallback(async (candidate) => {
    const pc = pcRef.current;
    if (!pc) return;
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('Failed to add ICE candidate:', err);
    }
  }, []);

  const connect = useCallback(() => {
    if (!streamId) return;
    isDisconnecting.current = false;
    createPeerConnection();

    const wsUrl = ENDPOINTS.wsWatch(streamId);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
    if (isDisconnecting.current) {
        ws.close();
        return;
    }
    ws.send(JSON.stringify({ type: 'request-offer', payload: {} }));
    };
    
    ws.onmessage = async (evt) => {
      let msg;
      try {
        msg = JSON.parse(evt.data);
      } catch {
        return;
      }
      onMessage?.(msg);
      const { type, payload } = msg;

      switch (type) {
        case 'connected':
          viewerIdRef.current = payload.viewer_id;
          if (payload.chat_history) {
            // Handled by useChat
          }
          break;

        case 'offer-to-viewer':
          await handleOffer(payload);
          break;

        case 'ice-candidate-to-viewer':
          await handleIceCandidate(payload);
          break;

        case 'stream-ended':
          onStreamEnded?.();
          break;

        case 'viewer_count':
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
      console.error('Viewer WS error:', err);
    };
  }, [
    streamId,
    createPeerConnection,
    handleOffer,
    handleIceCandidate,
    onStreamEnded,
    onViewerCount,
    viewerIdRef,
  ]);

  const disconnect = useCallback(() => {
    isDisconnecting.current = true;
    if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
    }
    if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const getWs = useCallback(() => wsRef.current, []);

  return { connect, disconnect, isConnected, getWs };
}