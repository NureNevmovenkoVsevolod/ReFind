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
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isAdmin = isLogin && 
    localStorage.getItem("user") &&
    JSON.parse(localStorage.getItem("user")).role === "admin";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      if (token === "admin-token") {
        setIsLogin(true);
        setIsLoading(false);
        return;
      }

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
        .catch((error) => {
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLogin(false);
    navigate("/");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {isAdmin ? null : (isLogin ? <AuthNavBar onLogout={handleLogout} /> : <NavBar />)}
      <div className="PageContent">
        <Routes>
          <Route path="/" element={<MainPage isLogin={isLogin} />} />
          <Route
            path="/registration"
            element={<Registration isLogin={isLogin} />}
          />
          <Route path="/login" element={<Login isLogin={isLogin} setIsLogin={setIsLogin} />} />
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
          <Route
            path="/admin"
            element={
              isAdmin ? (
                <AdminPanel />
              ) : isLogin ? (
                <Navigate to="/" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {isAdmin ? null : <Footer />}
    </div>
  );
}

export default App;
