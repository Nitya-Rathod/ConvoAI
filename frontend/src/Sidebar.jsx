import "./Sidebar.css";
import { useContext, useEffect, useState, useRef } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const dropdownRef = useRef(null);
  const userIconRef = useRef(null);

  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
  } = useContext(MyContext);

  const getAllThreads = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/thread", {
        credentials: "include",
      });

      if (response.status === 401) {
        setUser(null);
        toast.error("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      const res = await response.json();

      if (!response.ok) {
        console.log(res.error);
        setAllThreads([]);
        return;
      }

      const filteredData = res.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));
      setAllThreads(filteredData);
    } catch (err) {
      console.log(err);
      toast.error("Couldn't load chats");
    }
  };

  useEffect(() => {
    getAllThreads();
  }, [currThreadId]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
  };

  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);

    try {
      const response = await fetch(
        `http://localhost:8080/api/thread/${newThreadId}`,
        { credentials: "include" },
      );

      if (response.status === 401) {
        setUser(null);
        toast.error("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      const res = await response.json();

      if (!response.ok) {
        toast.error(res.error || "Couldn't open chat");
        return;
      }

      setPrevChats(res.messages);
      setNewChat(false);
      setReply(null);
    } catch (err) {
      console.log(err);
      toast.error("Couldn't load chat");
    }
  };

  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/thread/${threadId}`,
        { method: "DELETE", credentials: "include" },
      );

      if (response.status === 401) {
        setUser(null);
        toast.error("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      const res = await response.json();

      if (!response.ok) {
        toast.error(res.error || "Couldn't delete chat");
        return;
      }
      toast.success("Chat deleted");

      //update threads re-render
      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId),
      );

      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (err) {
      console.log(err);
      toast.error("Couldn't delete chat");
    }
  };

  const handleProfileClick = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      setAllThreads([]);
      setPrevChats([]);
      setReply(null);
      toast.success("Logged out successfully!");
      setPrompt("");

      navigate("/");
    } catch (err) {
      console.log(err);
      toast.error("Couldn't log out");
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        userIconRef.current &&
        !userIconRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section className="sidebar">
      {/* logo and options panel */}
      <div className="sidebar-nav">
        <i className="fa-brands fa-gg-circle logo"></i>
        <span>
          <i className="fa-solid fa-bars menubar"></i>
        </span>
      </div>

      {/* options */}
      <div className="options">
        <li onClick={createNewChat} className="newChat">
          <i className="fa-solid fa-plus"></i>New chat
        </li>
        <li>
          <i className="fa-regular fa-comment-dots"></i> Chats
        </li>
        <li>
          <i className="fa-regular fa-file-lines"></i> Projects
        </li>
      </div>

      {/* history of threads */}
      <ul className="history">
        Recents
        {allThreads?.map((thread, idx) => (
          <li
            key={idx}
            onClick={() => changeThread(thread.threadId)}
            className={thread.threadId === currThreadId ? "highlighted" : ""}
          >
            {thread.title}
            <i
              className="fa-solid fa-trash"
              onClick={(e) => {
                e.stopPropagation();
                deleteThread(thread.threadId);
              }}
            ></i>
          </li>
        ))}
      </ul>

      {/* Profile details */}
      <div
        className="userIconDiv"
        ref={userIconRef}
        onClick={handleProfileClick}
      >
        {user ? (
          <div className="fa-user">{user.name[0].charAt(0).toUpperCase()}</div>
        ) : (
          <div>
            <i className="fa-solid fa-user"></i>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="dropdown" ref={dropdownRef}>
          <div className="dropdownItem">
            <i className="fa-regular fa-circle-up"></i>&nbsp; &nbsp;Upgrade plan
          </div>
          <div className="dropdownItem">
            <i className="fa-solid fa-gear"></i>&nbsp; &nbsp;Settings
          </div>
          <div className="dropdownItem" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i>&nbsp;
            &nbsp;Log out
          </div>
        </div>
      )}
    </section>
  );
}
