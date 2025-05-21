import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthSuccess = ({ setIsLogin }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      setIsLogin(true);
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [navigate, setIsLogin]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      Processing authentication...
    </div>
  );
};

export default AuthSuccess;
