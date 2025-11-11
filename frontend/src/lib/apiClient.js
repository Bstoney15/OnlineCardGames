export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const PROD = import.meta.env.PROD;
const API_BASE = PROD ? window.location.origin : "http://localhost:8080";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const createUser = (data) =>
  request("/api/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const loginUser = (data) =>
  request("/api/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const getCurrency = () => request("/api/currency");

// Add currency amount to user's balance
export const addCurrency = (amount) =>
  request("/api/currency/add", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });

export const getActivePlayers = () => request("/api/active-players");

export const checkAuth = () => request("/api/auth");

export const getPlayerStats = () => request("/api/player-stats");

export const getLeaderBoard = () => request("/api/leaderboard-stats");

export const getUserInformation = () => request("/api/user-info"); // need to make api connor

// Join or create a game lobby
// game: "blackjack", "uno", "poker", etc.
// visibility: "public" or "private"
export const joinLobby = (game, visibility) =>
  request("/api/lobby", {
    method: "POST",
    body: JSON.stringify({ game, visibility }),
  });