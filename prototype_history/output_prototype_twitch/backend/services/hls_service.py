import asyncio
import os
import logging
import shutil
import subprocess
from typing import Optional, Dict

logger = logging.getLogger(__name__)


class HLSService:
    """
    Manages FFmpeg processes for HLS segment generation.
    This is a fallback for browsers/devices that don't support WebRTC.
    """

    def __init__(self, output_dir: str = "hls_output"):
        self.output_dir = output_dir
        self._processes: Dict[str, asyncio.subprocess.Process] = {}
        os.makedirs(output_dir, exist_ok=True)

    def _stream_dir(self, stream_id: str) -> str:
        path = os.path.join(self.output_dir, stream_id)
        os.makedirs(path, exist_ok=True)
        return path

    def get_playlist_path(self, stream_id: str) -> Optional[str]:
        path = os.path.join(self._stream_dir(stream_id), "playlist.m3u8")
        return path if os.path.exists(path) else None

    def get_segment_path(self, stream_id: str, segment_name: str) -> Optional[str]:
        path = os.path.join(self._stream_dir(stream_id), segment_name)
        return path if os.path.exists(path) else None

    async def start_hls_stream(
        self,
        stream_id: str,
        input_url: str,
        segment_duration: int = 2,
        playlist_size: int = 5,
    ) -> bool:
        """
        Start an FFmpeg process to convert an RTMP/HTTP stream to HLS segments.
        """
        if stream_id in self._processes:
            logger.warning(f"HLS stream already running for {stream_id}")
            return True

        stream_dir = self._stream_dir(stream_id)
        playlist_path = os.path.join(stream_dir, "playlist.m3u8")
        segment_pattern = os.path.join(stream_dir, "segment%03d.ts")

        ffmpeg_cmd = [
            "ffmpeg",
            "-i", input_url,
            "-c:v", "libx264",
            "-c:a", "aac",
            "-f", "hls",
            "-hls_time", str(segment_duration),
            "-hls_list_size", str(playlist_size),
            "-hls_flags", "delete_segments",
            "-hls_segment_filename", segment_pattern,
            playlist_path,
        ]

        try:
            process = await asyncio.create_subprocess_exec(
                *ffmpeg_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            self._processes[stream_id] = process
            logger.info(f"Started HLS stream for {stream_id}, PID: {process.pid}")
            return True
        except FileNotFoundError:
            logger.error("FFmpeg not found. HLS fallback unavailable.")
            return False
        except Exception as e:
            logger.error(f"Failed to start HLS for {stream_id}: {e}")
            return False

    async def stop_hls_stream(self, stream_id: str):
        """Stop the FFmpeg process for a stream and clean up segments."""
        process = self._processes.pop(stream_id, None)
        if process:
            try:
                process.terminate()
                await asyncio.wait_for(process.wait(), timeout=5.0)
                logger.info(f"Stopped HLS stream for {stream_id}")
            except asyncio.TimeoutError:
                process.kill()
                logger.warning(f"Force-killed HLS process for {stream_id}")
            except Exception as e:
                logger.error(f"Error stopping HLS for {stream_id}: {e}")

        # Clean up segment files
        stream_dir = os.path.join(self.output_dir, stream_id)
        if os.path.exists(stream_dir):
            shutil.rmtree(stream_dir, ignore_errors=True)
            logger.info(f"Cleaned up HLS segments for {stream_id}")

    def is_running(self, stream_id: str) -> bool:
        process = self._processes.get(stream_id)
        return process is not None and process.returncode is None

    async def cleanup_all(self):
        """Stop all running HLS streams."""
        for stream_id in list(self._processes.keys()):
            await self.stop_hls_stream(stream_id)


# Singleton instance
hls_service = HLSService()