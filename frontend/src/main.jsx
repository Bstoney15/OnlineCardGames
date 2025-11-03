import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import Login from './login/index.jsx'
import Register from './register/register.jsx';
import Home from './home/home.jsx'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import PlayerStats from './stats/playerStats.jsx';

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
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/stats",
        element: <PlayerStats />,
      }
    ],
  },
]);


createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
)
