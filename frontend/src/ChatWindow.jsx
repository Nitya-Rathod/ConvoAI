import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setPrevChats,
    allThreads, // added
    setAllThreads, //added
    setNewChat,
  } = useContext(MyContext);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user;

  const getReply = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    setLoading(true);
    setNewChat(false);

    const options = {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msg: prompt,
        threadId: currThreadId,
      }),
    };

    try {
      const response = await fetch("http://localhost:8080/api/chat", options);

      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      const res = await response.json();

      if (!response.ok) {
        toast.error(res.error || "Failed to generate response");
        return;
      }

      if (res.isNewThread) {
        setAllThreads((prev) => [
          {
            threadId: res.thread.threadId,
            title: res.thread.title,
          },
          ...prev,
        ]);
      }

      setReply(res.reply);
    } catch (err) {
      console.log(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  //Append new chat to prevChats
  useEffect(() => {
    if (prompt && reply) {
      setPrevChats((prevChats) => [
        ...prevChats,
        {
          role: "user",
          content: prompt,
        },
        {
          role: "assistant",
          content: reply,
        },
      ]);
    }

    setPrompt("");
  }, [reply]);

  const handleProfileClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatWindow">
      {/* navbar */}

      {isLoggedIn ? (
        <div className="navbar">
          <span>
            ConvoAI &nbsp;<i className="fa-solid fa-chevron-down"></i>
          </span>
          <div className="userIconDiv">
            <span className="userIcon">
              <button className="share">Share</button>
              <i className="fa-solid fa-ellipsis"></i>
            </span>
          </div>
        </div>
      ) : (
        <div className="navbar">
          <span>
            ConvoAI &nbsp;<i className="fa-solid fa-chevron-down"></i>
          </span>
          <div className="userIconDiv">
            <span className="userIcon">
              <button className="loginBtn" onClick={() => navigate("/login")}>
                Log in
              </button>
              <button className="signupBtn" onClick={() => navigate("/signup")}>
                Sign up for free
              </button>
            </span>
          </div>
        </div>
      )}

      {/* chat */}
      <div className="chatBody">
        <Chat></Chat>
        {loading && <ScaleLoader color="#fff" />}
      </div>

      {/* chat input */}

      <div className="chat">
        <div className="inputBox">
          <input
            type="text"
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            // to get reply by pressing enter key
            onKeyDown={(e) => (e.key === "Enter" ? getReply() : "")}
          />
          <div className="mic">
            <i className="fa-solid fa-microphone"></i>
          </div>
          <div id="send" onClick={getReply}>
            <i className="fa-regular fa-paper-plane"></i>
            {/* <i className="fa-solid fa-arrow-up"></i> */}
          </div>
        </div>

        <p className="info">
          ConvoAI can make mistakes. Please double-check responses.
        </p>
      </div>
    </div>
  );
}

export default ChatWindow;
