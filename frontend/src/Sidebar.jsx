import "./Sidebar.css";
import { useContext, useEffect, useState, useRef } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Sidebar() {
  const navigate = useNavigate();

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

  const { user } = useContext(AuthContext);
  const { setUser } = useContext(AuthContext);

  const [isOpen, setIsOpen] = useState(false);
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const userIconRef = useRef(null);

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

  const handleRename = async (threadId) => {
    const originalThread = allThreads.find(
      (thread) => thread.threadId === threadId,
    );

    if (originalThread?.title === editedTitle.trim()) {
      setEditingThreadId(null);
      return;
    }

    if (!editedTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/thread/${threadId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editedTitle.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Couldn't rename chat");
        return;
      }

      // Update sidebar instantly
      setAllThreads((prev) =>
        prev.map((thread) =>
          thread.threadId === threadId
            ? { ...thread, title: editedTitle }
            : thread,
        ),
      );

      toast.success("Chat renamed");

      setEditingThreadId(null);
      setEditedTitle("");
    } catch (err) {
      console.log(err);
      toast.error("Couldn't rename chat");
    }
  };

  return (
    <section className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* logo and options panel */}

      <div className="sidebar-nav">
        <i
          className="fa-brands fa-gg-circle logo"
          onClick={() => {
            if (collapsed) setCollapsed(false);
          }}
        ></i>

        {!collapsed && (
          <span>
            <i
              className="fa-solid fa-bars menubar"
              onClick={() => setCollapsed(true)}
            ></i>
          </span>
        )}
      </div>

      {/* options */}

      <div className="options">
        <li onClick={createNewChat} className="newChat">
          <i className="fa-solid fa-plus"></i> {!collapsed && "New chat"}
        </li>
        <li>
          <i className="fa-regular fa-comment-dots"></i> {!collapsed && "Chat"}
        </li>
        <li>
          <i className="fa-regular fa-file-lines"></i>{" "}
          {!collapsed && "Projects"}
        </li>
      </div>

      {/* history of threads */}

      <ul className="history">
        {!collapsed && "Recents"}

        {allThreads?.map((thread, idx) => (
          <li
            key={idx}
            onClick={() => changeThread(thread.threadId)}
            onDoubleClick={() => {
              if (!collapsed) {
                setEditingThreadId(thread.threadId);
                setEditedTitle(thread.title);
              }
            }}
            className={thread.threadId === currThreadId ? "highlighted" : ""}
          >
            {!collapsed &&
              (editingThreadId === thread.threadId ? (
                <input
                  ref={inputRef}
                  className="renameInput"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  maxLength={50}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRename(thread.threadId);
                    }

                    if (e.key === "Escape") {
                      setEditingThreadId(null);
                      setEditedTitle("");
                    }
                  }}
                />
              ) : (
                thread.title
              ))}

            {!collapsed && editingThreadId !== thread.threadId && (
              <i
                className="fa-solid fa-trash"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(thread.threadId);
                }}
              ></i>
            )}
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
