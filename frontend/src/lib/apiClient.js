export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const API_BASE = "//localhost:8080";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new ApiError(msg, res.status);
  }

  return res.json();
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

export const getActivePlayers = () => request("/api/active-players");

export const checkAuth = () => request("/api/auth");

export const getPlayerStats = () => request("/api/player-stats");

export const getLeaderBoard = () => request("/api/leaderboard-stats");