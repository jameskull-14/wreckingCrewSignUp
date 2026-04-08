// WebSocket message types matching backend broadcasts

export enum WebSocketMessageType {
  PERFORMER_CREATED = 'performer_created',
  PERFORMER_UPDATED = 'performer_updated',
  SONG_SELECTION_CREATED = 'song_selection_created',
  SONG_SELECTION_UPDATED = 'song_selection_updated',
  SETTINGS_UPDATED = 'settings_updated',
  SESSION_ENDED = 'session_ended'
}

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data?: any;
}
