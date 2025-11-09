import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import Login from './login/index.jsx'
import Register from './register/register.jsx';
import Home from './home/home.jsx'
import Store from './store/store.jsx'            
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import PlayerStats from './stats/playerStats.jsx';
import LeaderBoard from './stats/leaderboard.jsx';

const router = createBrowserRouter([
  {
    path: "/", // The "home" page
    element: <App />, // The component to show
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },

  // These routes are open during development (bypass login)
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/store",
    element: <Store />,
  },
  {
    path: "/player-stats",
    element: <PlayerStats />,
  },
  {
    path: "/leaderboard",
    element: <LeaderBoard />,
  },

  /*
  // Original protected routes (enable later)
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/home", element: <Home /> },
      { path: "/store", element: <Store /> },
      { path: "/player-stats", element: <PlayerStats /> },
      { path: "/leaderboard", element: <LeaderBoard /> },
    ],
  },
  */
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
