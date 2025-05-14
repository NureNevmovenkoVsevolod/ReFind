import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import MainPage from "./pages/MainPage";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import AuthNavBar from "./components/AuthNavBar/AuthNavBar";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import AuthSuccess from "./components/AuthSuccess/AuthSuccess";
import axios from "axios";

function App() {
  const [isLogin, setIsLogin] = useState(false);
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
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsLogin(false);
          navigate("/login");
        });
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
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
