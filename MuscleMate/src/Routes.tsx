import { createBrowserRouter, Navigate } from "react-router-dom";
import MainMenu from "./App";
import Workout from "./workout";
import Auth from "./Login";
import config from "../auth/firebase.config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from 'react';
import { ReactNode } from 'react';

const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    const auth = getAuth(config.app);
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  return isLoggedIn;
};

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isLoggedIn = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const Routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: "/workout",
    element: (
      <ProtectedRoute>
        <Workout />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Auth />,  
  },
]);

export default Routes;
