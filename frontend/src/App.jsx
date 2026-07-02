import "./App.css";
import { MyContext } from "./MyContext";
import { useState } from "react";
import { v1 as uuidv1 } from "uuid";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import Login from "./Login";
import Signup from "./Signup";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]); // for displaying chats
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]); // for displaying all threads

  const providerValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    newChat,
    setNewChat,
    prevChats,
    setPrevChats,
    allThreads,
    setAllThreads,
  };

  const { loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  return (
    <MyContext.Provider value={providerValues}>
      <Routes>
        <Route
          path="/"
          element={
            <div className="app">
              <Sidebar />
              <ChatWindow />
            </div>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </MyContext.Provider>
  );
}

export default App;
