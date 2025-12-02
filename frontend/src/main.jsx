import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import Login from './login/index.jsx'
import Register from './register/register.jsx';
import Home from './home/home.jsx'
import Blackjack from './blackjack/blackjack.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import PlayerStats from './stats/playerStats.jsx';
import UserAccount from './user-account/userAccount.jsx';
import LeaderBoard from './stats/leaderboard.jsx';
import Store from './store/store.jsx';
import LayoutWithNav from './components/LayoutWithNav.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <LayoutWithNav />, 
        children: [
          { path: "/home", element: <Home /> },
          { path: "/user-account", element: <UserAccount /> },
          { path: "/store", element: <Store /> },
          { path: "/leaderboard", element: <LeaderBoard /> },
          { path: "/stats", element: <PlayerStats /> },
        ]
      },

      // pages with NO NavBar
      {
        path: "/blackjack/:id",
        element: <Blackjack />
      }
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
