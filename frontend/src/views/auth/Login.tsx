import { useState, useEffect } from "react";
import { login } from "../../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setpassword] = useState("");
  const [isLoading, setisLoading] = useState("");
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/");
    }
  }, []);
  const resetForm = () => {
    setUsername("");
    setpassword("");
  };
  return (
    <div>
      <h2>Welcome Back</h2>
      <p>Login to Continue</p>
    </div>
  );
};

export default Login;
