import "./Chat.css";
import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
  const { newChat, prevChats, reply } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);

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

  return (
    <>
      {newChat && <h1>Start a New Chat</h1>}

      <div className="chats">
        {Array.isArray(prevChats) &&
          prevChats?.slice(0, -1).map((chat, idx) => {
            return (
              <div
                className={chat.role === "user" ? "userDiv" : "aiDiv"}
                key={idx}
              >
                {chat.role === "user" ? (
                  <p className="userMsg">{chat.content}</p>
                ) : (
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                    {chat.content}
                  </ReactMarkdown>
                )}
              </div>
            );
          })}

        {Array.isArray(prevChats) && prevChats.length > 0 && (
          <>
            {latestReply === null ? (
              <div className="aiDiv" key={"non-typing"}>
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {prevChats[prevChats.length - 1].content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="aiDiv" key={"typing"}>
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {latestReply}
                </ReactMarkdown>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Chat;

// import "./Chat.css";
// import { useContext, useState, useEffect } from "react";
// import { MyContext } from "../../context/MyContext";
// import ReactMarkdown from "react-markdown";
// import rehypeHighlight from "rehype-highlight";
// import "highlight.js/styles/github-dark.css";

// export default function Chat() {
//   const { newChat, prevChats, reply } = useContext(MyContext);
//   const [latestReply, setLatestReply] = useState(null);

//   useEffect(() => {
//     if (reply === null) {
//       setLatestReply(null);
//       return;
//     }
//     if (!prevChats?.length) return;

//     let content = reply.split(" "); // individual words

//     let idx = 0;
//     const interval = setInterval(() => {
//       setLatestReply(content.slice(0, idx + 1).join(" "));

//       idx++;
//       if (idx >= content.length) clearInterval(interval);
//     }, 40);

//     return () => clearInterval(interval);
//   }, [prevChats, reply]);

// }
