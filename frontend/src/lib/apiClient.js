/**
 * API client module for making HTTP requests to the backend server.
 * Provides functions for authentication, user management, game lobbies,
 * currency operations, player statistics, and store interactions.
 *
 * @author Multiple Contributors
 * @date 2025-10-13
 */

/**
 * Custom error class for API-related errors.
 * Includes HTTP status code for error handling.
 */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// In development, Vite proxy will forward /api requests to localhost:8080
// In production, use the same origin (your deployed backend)

async function request(path, options = {}) {
  const res = await fetch(`${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
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

export const logoutUser = () =>
  request("/api/logout", {
    method: "POST",
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

export const getLeaderBoardBalance = () =>
  request("/api/leaderboard-stats", {
    method: "POST",
    body: JSON.stringify({ field: "Balance" }),
  });

export const getLeaderBoardWagersWon = () =>
  request("/api/leaderboard-stats", {
    method: "POST",
    body: JSON.stringify({ field: "Wagers_Won" }),
  });

export const getLeaderBoardWagersLost = () =>
  request("/api/leaderboard-stats", {
    method: "POST",
    body: JSON.stringify({ field: "Wagers_Lost" }),
  });

export const getLeaderBoardAmountWon = () =>
  request("/api/leaderboard-stats", {
    method: "POST",
    body: JSON.stringify({ field: "Amount_Won" }),
  });

export const getLeaderBoardWagersPlaced = () =>
  request("/api/leaderboard-stats", {
    method: "POST",
    body: JSON.stringify({ field: "Wagers_Placed" }),
  });

export const getUserInformation = () => request("/api/user-info");

export const getUserFriends = () => request("/api/user-friends");

// Henry's backend uses exact these routes:
export const getOwned = () => request("/api/get-owned");
export const getEquipped = () => request("/api/get-equipped");

// Buy item or color
export const buyStoreItem = (kind, index) =>
  request("/api/store/buy", {
    method: "POST",
    body: JSON.stringify({ kind, index }),
  });

export const getItems = () => request("/api/items");

// Lootbox
export const openLootbox = () =>
  request("/api/store/lootbox", {
    method: "POST",
  });

// Join or create a game lobby
// game: "blackjack", "uno", "poker", etc.
// visibility: "public" or "private"
export const joinLobby = (game, visibility) =>
  request("/api/lobby", {
    method: "POST",
    body: JSON.stringify({ game, visibility }),
  });
