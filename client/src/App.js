import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import "./App.css";
import MainPage from "./pages/MainPage";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import AuthNavBar from "./components/AuthNavBar/AuthNavBar";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import AuthSuccess from "./components/AuthSuccess/AuthSuccess";
import axios from "axios";
import CreateLost from "./pages/CreateLost";
import CreateFound from "./pages/CreateFound";
import ItemCard from "./pages/ItemCard";

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Verify token with backend
      axios
        .get("http://localhost:5000/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          setIsLogin(true);
          setIsLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsLogin(false);
          setIsLoading(false);
          navigate("/login");
        });
    } else {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLogin(false);

    // Redirect to home page (for guest view)
    navigate("/");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {isLogin ? <AuthNavBar onLogout={handleLogout} /> : <NavBar />}
      <div className="PageContent">
        <Routes>
          <Route path="/" element={<MainPage isLogin={isLogin} />} />
          <Route
            path="/registration"
            element={<Registration isLogin={isLogin} />}
          />
          <Route path="/login" element={<Login isLogin={isLogin} />} />
          <Route
            path="/auth/success"
            element={<AuthSuccess setIsLogin={setIsLogin} />}
          />
          <Route
            path="/lost/create"
            element={isLogin ? <CreateLost /> : <Navigate to="/login" />}
          />
          <Route
            path="/found/create"
            element={isLogin ? <CreateFound /> : <Navigate to="/login" />}
          />
          <Route
              path="/advertisement/:id"
              element={<ItemCard isLogin={isLogin} />}
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
