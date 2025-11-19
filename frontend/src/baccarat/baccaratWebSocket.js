class BaccaratWebSocket {
  constructor(gameId, onMessage, onConnectionChange) {
    this.gameId = gameId;
    this.onMessage = onMessage;
    this.onConnectionChange = onConnectionChange;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/ws/Baccarat/${this.gameId}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("Baccarat WebSocket connected");
        this.reconnectAttempts = 0;
        this.onConnectionChange(true, null);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.onMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("Baccarat WebSocket error:", error);
        this.onConnectionChange(false, "Connection error");
      };

      this.ws.onclose = () => {
        console.log("Baccarat WebSocket closed");
        this.onConnectionChange(false, null);
        this.attemptReconnect();
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      this.onConnectionChange(false, error.message);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
    } else {
      this.onConnectionChange(
        false,
        "Max reconnection attempts reached. Please refresh the page."
      );
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default BaccaratWebSocket;
