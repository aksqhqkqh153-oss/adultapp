from __future__ import annotations

from collections import defaultdict
from typing import DefaultDict

from fastapi import WebSocket


class ThreadConnectionManager:
    def __init__(self) -> None:
        self._connections: DefaultDict[int, list[WebSocket]] = defaultdict(list)

    async def connect(self, thread_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections[thread_id].append(websocket)

    def disconnect(self, thread_id: int, websocket: WebSocket) -> None:
        items = self._connections.get(thread_id, [])
        if websocket in items:
            items.remove(websocket)
        if not items and thread_id in self._connections:
            self._connections.pop(thread_id, None)

    async def broadcast(self, thread_id: int, payload: dict) -> None:
        stale: list[WebSocket] = []
        for connection in list(self._connections.get(thread_id, [])):
            try:
                await connection.send_json(payload)
            except Exception:
                stale.append(connection)
        for connection in stale:
            self.disconnect(thread_id, connection)


thread_connection_manager = ThreadConnectionManager()
