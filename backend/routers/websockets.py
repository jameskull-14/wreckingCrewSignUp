from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json

router = APIRouter()

class ConnectionManager:
    """
    Manages WebSocket connections for real-time updates.

    Organizes connections by admin_id so updates can be broadcast
    to all clients connected to a specific admin's session.
    """
    def __init__(self):
        # Dict mapping admin_id -> list of WebSocket connections
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, admin_id: int):
        """Accept a new WebSocket connection and add to admin's room."""
        await websocket.accept()
        if admin_id not in self.active_connections:
            self.active_connections[admin_id] = []
        self.active_connections[admin_id].append(websocket)
        print(f"Client connected to admin {admin_id}. Total connections: {len(self.active_connections[admin_id])}")

    def disconnect(self, websocket: WebSocket, admin_id: int):
        """Remove a WebSocket connection from admin's room."""
        if admin_id in self.active_connections:
            self.active_connections[admin_id].remove(websocket)
            if len(self.active_connections[admin_id]) == 0:
                del self.active_connections[admin_id]
            print(f"Client disconnected from admin {admin_id}")

    async def broadcast(self, admin_id: int, message: dict):
        """
        Broadcast a message to all clients connected to this admin's session.

        Args:
            admin_id: The admin whose session should receive the update
            message: Dictionary to send as JSON
        """
        if admin_id not in self.active_connections:
            return

        # Remove dead connections while broadcasting
        dead_connections = []
        for connection in self.active_connections[admin_id]:
            try:
                await connection.send_json(message)
            except:
                dead_connections.append(connection)

        # Clean up dead connections
        for connection in dead_connections:
            self.active_connections[admin_id].remove(connection)


# Global connection manager instance
manager = ConnectionManager()


@router.websocket("/ws/{admin_id}")
async def websocket_endpoint(websocket: WebSocket, admin_id: int):
    """
    WebSocket endpoint for real-time updates.

    Clients connect to /ws/{admin_id} to receive real-time updates
    for a specific admin's karaoke session.

    Message types:
    - settings_updated: Admin settings changed
    - performer_joined: New performer signed up
    - queue_updated: Queue/timeslot changes
    - session_ended: Session was ended
    """
    await manager.connect(websocket, admin_id)
    try:
        while True:
            # Keep connection alive and receive any messages from client
            data = await websocket.receive_text()
            # Echo back for heartbeat/testing
            await websocket.send_json({"type": "pong", "data": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket, admin_id)
