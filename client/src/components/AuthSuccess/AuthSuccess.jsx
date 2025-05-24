import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthSuccess = ({ setIsLogin }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const processAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const data = urlParams.get("data");

        if (!data) {
          console.error("No auth data found in URL");
          setTimeout(() => {
            navigate("/login?error=no_auth_data");
          }, 2000);
          return;
        }

        const decodedData = decodeURIComponent(data);
        
        const authData = JSON.parse(decodedData);

        if (!authData.token || !authData.user) {
          navigate("/login?error=invalid_auth_data");
          return;
        }

        if (!authData.user.id || !authData.user.email) {
          console.error("Invalid user data:", authData.user);
          navigate("/login?error=invalid_user_data");
          return;
        }

        localStorage.setItem("token", authData.token);
        localStorage.setItem("user", JSON.stringify(authData.user));

        if (setIsLogin) {
          setIsLogin(true);
        }

        window.history.replaceState({}, document.title, "/auth/success");

        navigate("/");
      } catch (error) {
        console.error("Error processing auth data:", error);
        console.error("Error stack:", error.stack);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login?error=auth_processing_failed");
      }
    };

    processAuth();

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
