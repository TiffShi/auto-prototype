import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, List
from collections import deque

from models.chat import ChatMessage

logger = logging.getLogger(__name__)

# Predefined colors for chat usernames
USERNAME_COLORS = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
    "#F0B27A", "#82E0AA", "#F1948A", "#AED6F1", "#A9DFBF",
]


class ChatService:
    """
    Manages chat messages per stream room.
    Stores recent history and assigns colors to usernames.
    """

    def __init__(self, max_history: int = 100):
        self.max_history = max_history
        # stream_id -> deque of ChatMessage
        self._history: Dict[str, deque] = {}
        # username -> color (per stream)
        self._user_colors: Dict[str, Dict[str, str]] = {}

    def _get_or_create_history(self, stream_id: str) -> deque:
        if stream_id not in self._history:
            self._history[stream_id] = deque(maxlen=self.max_history)
        return self._history[stream_id]

    def _assign_color(self, stream_id: str, username: str) -> str:
        if stream_id not in self._user_colors:
            self._user_colors[stream_id] = {}
        if username not in self._user_colors[stream_id]:
            color_index = len(self._user_colors[stream_id]) % len(USERNAME_COLORS)
            self._user_colors[stream_id][username] = USERNAME_COLORS[color_index]
        return self._user_colors[stream_id][username]

    def create_message(
        self, stream_id: str, username: str, content: str
    ) -> ChatMessage:
        color = self._assign_color(stream_id, username)
        message = ChatMessage(
            message_id=str(uuid.uuid4()),
            stream_id=stream_id,
            username=username,
            content=content,
            timestamp=datetime.now(timezone.utc),
            color=color,
        )
        history = self._get_or_create_history(stream_id)
        history.append(message)
        return message

    def get_history(self, stream_id: str) -> List[ChatMessage]:
        return list(self._get_or_create_history(stream_id))

    def clear_stream(self, stream_id: str):
        self._history.pop(stream_id, None)
        self._user_colors.pop(stream_id, None)

    def create_system_message(self, stream_id: str, content: str) -> ChatMessage:
        return self.create_message(stream_id, "System", content)


# Singleton instance
chat_service = ChatService()