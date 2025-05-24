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
import BoardFound from "./pages/BoardFound";
import BoardLost from "./pages/BoardLost";

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isAdmin =
    isLogin &&
    localStorage.getItem("user") &&
    JSON.parse(localStorage.getItem("user")).role === "admin";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(process.env.REACT_APP_SERVER_URL+"/auth/verify", {
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

  if (isAdmin) {
    return (
      <div className="App">
        <Routes>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/" element={<Navigate to="/admin" />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </div>
    );
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
          <Route
            path="/login"
            element={<Login isLogin={isLogin} setIsLogin={setIsLogin} />}
          />
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
          <Route path="/boardlost" element={<BoardLost isLogin={isLogin} />} />
          <Route
            path="/boardfound"
            element={<BoardFound isLogin={isLogin} />}
          />
          <Route
            path="/admin"
            element={
              isLogin ? <Navigate to="/" /> : <Navigate to="/login" />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;