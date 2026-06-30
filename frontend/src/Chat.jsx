import "./Chat.css";
import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
  const { newChat, prevChats, setPrevChats, reply, setReply, currThreadId } =
    useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);

  // Edit states
  const [editIdx, setEditIdx] = useState(null);
  const [editedMsg, setEditedMsg] = useState("");

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

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/thread/${currThreadId}/edit`,
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

      const data = await response.json();

      if (response.ok) {
        setPrevChats(data.thread.messages);
        setReply(null);
        setEditIdx(null);
      }
    } catch (err) {
      console.log(err);
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
              <div className="aiDiv">
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {prevChats[prevChats.length - 1].content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="aiDiv">
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

  // return (
  //   <>
  //     {newChat && <h1>Start a New Chat</h1>}

  //     <div className="chats">
  //       {Array.isArray(prevChats) &&
  //         prevChats?.slice(0, -1).map((chat, idx) => {
  //           return (
  //             <div
  //               className={chat.role === "user" ? "userDiv" : "aiDiv"}
  //               key={idx}
  //             >
  //               {chat.role === "user" ? (
  //                 <div className="userMsgDiv">
  //                   {/* <p className="userMsg">{chat.content}</p> */}
  //                   {editIdx === idx ? (
  //                     <textarea
  //                       className="editTextarea"
  //                       value={editedMsg}
  //                       onChange={(e) => setEditedMsg(e.target.value)}
  //                     />
  //                   ) : (
  //                     <p className="userMsg">{chat.content}</p>
  //                   )}

  //                   <button
  //                     className="editBtn"
  //                     onClick={() => {
  //                       setEditIdx(idx);
  //                       setEditedMsg(chat.content);
  //                     }}
  //                   >
  //                     <i className="fa-solid fa-pen"></i>
  //                   </button>
  //                 </div>
  //               ) : (
  //                 <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
  //                   {chat.content}
  //                 </ReactMarkdown>
  //               )}
  //             </div>
  //           );
  //         })}

  //       {Array.isArray(prevChats) && prevChats.length > 0 && (
  //         <>
  //           {latestReply === null ? (
  //             <div className="aiDiv" key={"non-typing"}>
  //               <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
  //                 {prevChats[prevChats.length - 1].content}
  //               </ReactMarkdown>
  //             </div>
  //           ) : (
  //             <div className="aiDiv" key={"typing"}>
  //               <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
  //                 {latestReply}
  //               </ReactMarkdown>
  //             </div>
  //           )}
  //         </>
  //       )}
  //     </div>
  //   </>
  // );
}

export default Chat;
