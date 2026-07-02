import "./Login.css";
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://convoai-backend-r3mz.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Login failed");
        setLoading(false);
        return;
      }

      setUser(data.user);
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <form className="authCard" onSubmit={handleSubmit}>
        <p className="authTitle">Welcome back</p>
        <p className="authSubtitle">Log in to continue your conversations</p>

        <label className="authLabel">Email</label>
        <input
          className="authInput"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="authLabel">Password</label>
        <input
          className="authInput"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="authBtn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="authFooter">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
