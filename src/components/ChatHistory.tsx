import React, { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
interface ChatItem {
  id: string;
  question: string;
  answer: string;
  subject: string;
  difficulty: string;
}

interface Props {
  onOpenChat: (chat: ChatItem) => void;
}
export default function ChatHistory({
  onOpenChat,
}: Props) {

  //console.log("ChatHistory onOpenChat =", onOpenChat);
  const [history, setHistory] = useState<ChatItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
  //console.log("Current user:", auth.currentUser);

  if (!auth.currentUser) {
    console.log("No user logged in");
    return;
  }

  const q = query(
    collection(
      db,
      "users",
      auth.currentUser.uid,
      "chatHistory"
    ),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  //console.log("Documents found:", snapshot.size);

  const chats = snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<ChatItem, "id">)
  }));

 // console.log(chats);

  setHistory(chats);
}
async function deleteChat(chatId: string) {
  if (!auth.currentUser) return;

  const ok = window.confirm(
    "Are you sure you want to delete this chat?"
  );

  if (!ok) return;

  try {
    await deleteDoc(
      doc(
        db,
        "users",
        auth.currentUser.uid,
        "chatHistory",
        chatId
      )
    );

    // Remove from screen immediately
    setHistory(prev =>
      prev.filter(chat => chat.id !== chatId)
    );
  } catch (err) {
    console.error(err);
    alert("Failed to delete chat.");
  }
}
  return (
    <div className="p-4">
        <button
  onClick={() => window.history.back()}
  className="mb-4 bg-purple-600 text-white px-3 py-2 rounded"
>
  ← Back
</button>
      <h1 className="text-xl font-bold mb-4">
        Chat History
      </h1>
      <input
  type="text"
  placeholder="Search chats..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full border rounded-lg px-3 py-2 mb-4"
/>

     {history.length === 0 ? (
  <p className="text-gray-500 text-center py-6">
    No chat history found.
  </p>
) : (
  history
  .filter(chat =>
    chat.question.toLowerCase().includes(search.toLowerCase()) ||
    chat.answer.toLowerCase().includes(search.toLowerCase()) ||
    chat.subject.toLowerCase().includes(search.toLowerCase())
  )
  .map(chat => (
        <div
          key={chat.id}
          className="border rounded-lg p-4 mb-4 shadow"
        >
          <h2 className="font-bold">
            {chat.question}
          </h2>

          <p className="mt-2 text-gray-700">
  {chat.answer.substring(0, 150)}...
</p><div className="flex justify-between items-center mt-3">
  <div className="text-sm text-gray-500">
    {chat.subject} • {chat.difficulty}
  </div>

  <div className="flex gap-2">
    <button
      onClick={() => deleteChat(chat.id)}
      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg"
    >
      Delete
    </button>

    <button
      onClick={() => onOpenChat(chat)}
      className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded-lg"
    >
      Continue →
    </button>
  </div>
</div>
        </div>
         ))
)}
    </div>
  );
}
