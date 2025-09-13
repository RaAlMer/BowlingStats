import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API, { setToken } from "../api";
import type { User } from "../types";

interface Props {
  onAuth: (user: User) => void;
}

export default function AuthCallback({ onAuth }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("api_token", token);
      setToken(token);

      // Fetch user profile immediately
      API.get<{ user: User }>("/users/me")
        .then((res) => {
          onAuth(res.data.user);
          navigate("/", { replace: true });
        })
        .catch(() => {
          localStorage.removeItem("api_token");
          navigate("/login", { replace: true });
        });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate, onAuth]);

  return <p>Logging in...</p>;
}
