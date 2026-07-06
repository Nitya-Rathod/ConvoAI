import "./Chat.css";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import CodeBlock from "./CodeBlock.jsx";
const API_URL = import.meta.env.VITE_API_URL;

function Chat() {
  const navigate = useNavigate();

  const { newChat, prevChats, setPrevChats, reply, setReply, currThreadId } =
    useContext(MyContext);

  const [latestReply, setLatestReply] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [editedMsg, setEditedMsg] = useState("");

  const bottomRef = useRef(null);

  useEffect(() => {
    if (reply === null) {
      setLatestReply(null); //prevchat load
      return;
    }

    if (!prevChats?.length) return;

    const content = reply.split(" "); //individual words

    let idx = 0;
    const interval = setInterval(() => {
      setLatestReply(content.slice(0, idx + 1).join(" "));

      idx++;
      if (idx >= content.length) clearInterval(interval);
    }, 40);

    return () => clearInterval(interval);
  }, [prevChats, reply]);

  // for auto scroll button
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [prevChats, latestReply]);

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/thread/${currThreadId}/edit`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            editedMessage: editedMsg,
          }),
        },
      );

      if (response.status === 401) {
        toast.error("Session expired.");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Couldn't edit message");
        return;
      }

      setPrevChats(data.thread.messages);
      setReply(null);
      setEditIdx(null);

      toast.success("Prompt updated");
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      {newChat && <h1>Start a New Chat</h1>}

      <div className="chats">
        {Array.isArray(prevChats) &&
          prevChats.slice(0, -1).map((chat, idx) => {
            const isLastUserMessage =
              chat.role === "user" &&
              idx === prevChats.findLastIndex((msg) => msg.role === "user");

            return (
              <div
                key={idx}
                className={chat.role === "user" ? "userDiv" : "aiDiv"}
              >
                {chat.role === "user" ? (
                  <div className="userMsgDiv">
                    {editIdx === idx ? (
                      <>
                        <textarea
                          className="editTextarea"
                          value={editedMsg}
                          onChange={(e) => setEditedMsg(e.target.value)}
                        />

                        <div className="editActions">
                          <button className="saveBtn" onClick={handleSaveEdit}>
                            Save
                          </button>

                          <button
                            className="cancelBtn"
                            onClick={() => setEditIdx(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="userMsg">{chat.content}</p>

                        {isLastUserMessage && (
                          <button
                            className="editBtn"
                            onClick={() => {
                              setEditIdx(idx);
                              setEditedMsg(chat.content);
                            }}
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <ReactMarkdown
                    rehypePlugins={[rehypeHighlight]}
                    components={{ pre: CodeBlock }}
                  >
                    {chat.content}
                  </ReactMarkdown>
                )}
              </div>
            );
          })}

        {Array.isArray(prevChats) && prevChats.length > 0 && (
          <>
            {latestReply === null ? (
              <div className="aiDiv">
                <ReactMarkdown
                  rehypePlugins={[rehypeHighlight]}
                  components={{ pre: CodeBlock }}
                >
                  {prevChats[prevChats.length - 1].content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="aiDiv">
                <ReactMarkdown
                  rehypePlugins={[rehypeHighlight]}
                  components={{ pre: CodeBlock }}
                >
                  {latestReply}
                </ReactMarkdown>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef}></div>
      </div>
    </>
  );
}

export default Chat;
