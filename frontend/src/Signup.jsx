import "./Signup.css";
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://convoai-backend-r3mz.onrender.com/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, email, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Login failed");
        setLoading(false);
        return;
      }

      setUser(data.user);
      toast.success("Signed in successfully!");
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
        <p className="authTitle">Create your account</p>
        <p className="authSubtitle">Start chatting with ConvoAI in seconds</p>

        <label className="authLabel">Name</label>
        <input
          className="authInput"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          {loading ? "Signing up..." : "Sign up"}
        </button>

        <p className="authFooter">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
