/**
 * BlackjackWebSocket - Manages WebSocket connection for Blackjack game.
 * Handles connection establishment, message sending/receiving, automatic
 * reconnection with exponential backoff, and connection state management.
 *
 * @author Benjamin Stonestreet
 * @date 2025-11-18
 */
class BlackjackWebSocket {
  /**
   * Creates a new BlackjackWebSocket instance.
   * @param {string} gameID - The unique identifier for the game lobby
   * @param {Function} onMessage - Callback function invoked when a message is received
   * @param {Function} onConnectionChange - Callback function invoked when connection status changes
   */
  constructor(gameID, onMessage, onConnectionChange) {
    this.gameID = gameID;
    this.onMessage = onMessage;
    this.onConnectionChange = onConnectionChange;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Establishes a WebSocket connection to the game server.
   * Automatically determines the correct protocol (ws/wss) based on the page protocol.
   */
  connect() {
    // Determine WebSocket URL based on environment
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // In development, use the current host (Vite dev server will proxy WebSocket)
    // In production, use the actual host
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/ws/BlackJack/${this.gameID}`;

    console.log("Connecting to WebSocket:", wsUrl);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("WebSocket connected to game:", this.gameID);
      this.reconnectAttempts = 0;
      this.onConnectionChange?.(true, null);
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.onMessage?.(message);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.onConnectionChange?.(false, "Failed to connect to game server");
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      this.onConnectionChange?.(false, null);
      this.attemptReconnect();
    };
  }

  /**
   * Attempts to reconnect to the WebSocket server with exponential backoff.
   * Will retry up to maxReconnectAttempts times before giving up.
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        if (this.ws?.readyState === WebSocket.CLOSED) {
          this.connect();
        }
      }, delay);
    }
  }

  /**
   * Sends a message to the game server via WebSocket.
   * @param {Object} message - The message object to send (will be JSON stringified)
   */
  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log("Sent message:", message);
    } else {
      console.error("WebSocket is not connected");
    }
  }

  /**
   * Disconnects the WebSocket connection and prevents automatic reconnection.
   */
  disconnect() {
    if (this.ws) {
      // Prevent reconnection attempts
      this.reconnectAttempts = this.maxReconnectAttempts;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }
  }

  /**
   * Checks if the WebSocket is currently connected.
   * @returns {boolean} True if the connection is open, false otherwise
   */
  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export default BlackjackWebSocket;
