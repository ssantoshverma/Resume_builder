// src/components/ChatAssistant.tsx (refactored from CareerChat.tsx)
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

const predefinedSuggestions = [
  "Check skills gap",
  "Resume tips",
  "Career growth path",
  "Job interview advice",
  "Recommended skills to learn",
];

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<{ role: "user" | "bot"; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, loading]);

  const sendMessage = async (msg: string) => {
    if (!msg.trim()) return;

    setChatLog((prev) => [...prev, { role: "user", content: msg }]);
    setMessage("");
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post("http://localhost:5000/api/ai/ask", { query: msg }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const formatted = res.data.reply;
      setChatLog((prev) => [...prev, { role: "bot", content: formatted }]);
    } catch (err) {
      setChatLog((prev) => [...prev, { role: "bot", content: "Error connecting to AI service." }]);
    } finally {
      setLoading(false);
    }
  };

  // Helper: render bold text in JSX
  const renderBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/);
    return parts.map((part, idx) => (idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part));
  };

  // Render formatted AI content including tables, lists, bold
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    let tableBuffer: string[][] = [];
    const elements: JSX.Element[] = [];

    const flushTable = () => {
      if (tableBuffer.length === 0) return;
      elements.push(
        <div key={elements.length} className="mb-4 overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
            <tbody>
              {tableBuffer.map((row, rowIdx) => (
                <tr key={rowIdx} className={rowIdx === 0 ? "bg-gray-100 font-bold" : ""}>
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="border border-gray-300 px-2 py-1 align-top text-left"
                    >
                      {cell.split("\n").map((line, i) =>
                        line.startsWith("- ") ? (
                          <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>
                        ) : renderBold(line)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableBuffer = [];
    };

    lines.forEach((line) => {
      if (line.trim() === "") {
        flushTable();
        return;
      }

      if (line.startsWith("|")) {
        tableBuffer.push(line.split("|").map((cell) => cell.trim()).filter((cell) => cell));
      } else {
        flushTable();
        if (line.startsWith("- ") || line.startsWith("* ")) {
          elements.push(<li key={elements.length} className="ml-4">{renderBold(line.slice(2))}</li>);
        } else if (line.match(/^\d+\./)) {
          elements.push(<li key={elements.length} className="ml-4 list-decimal">{renderBold(line.slice(line.indexOf('.') + 1))}</li>);
        } else if (line.startsWith("# ")) {
          elements.push(<h3 key={elements.length} className="font-bold mt-2">{renderBold(line.slice(2))}</h3>);
        } else {
          elements.push(<p key={elements.length} className="mb-2">{renderBold(line)}</p>);
        }
      }
    });

    flushTable();
    return elements;
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 right-6 z-50 bg-white rounded-xl shadow-xl w-80 h-96 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Career Assistant</h3>
              <button onClick={() => setIsOpen(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Predefined Suggestions */}
            <div className="flex flex-wrap gap-2 p-4 border-b overflow-x-auto">
              {predefinedSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(suggestion)}
                  className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs hover:bg-indigo-200 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {chatLog.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-2 rounded-lg max-w-[80%] ${msg.role === "user" ? "bg-indigo-100 self-end" : "bg-gray-100 self-start"}`}
                  >
                    {msg.role === "bot" ? renderFormattedContent(msg.content) : msg.content}
                  </motion.div>
                ))}

                {loading && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-2 rounded-lg max-w-[50%] bg-gray-100 self-start"
                  >
                    <span className="animate-pulse">AI is typing...</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(message)}
                  placeholder="Ask about jobs, skills..."
                  className="flex-1 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  onClick={() => sendMessage(message)}
                  disabled={loading}
                  className={`p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition`}
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}