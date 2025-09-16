import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const predefinedSuggestions = [
  "Check skills gap",
  "Resume tips",
  "Career growth path",
  "Job interview advice",
  "Recommended skills to learn",
];

export default function CareerChat() {
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

    const token = localStorage.getItem("token");  //---------------------------------------------------%%%%%%%%%%%%%%%%%%%%%%%%&&&&&&&&&&&&&&

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
          <table className="table-auto border-collapse border border-muted w-full text-sm">
            <tbody>
              {tableBuffer.map((row, rowIdx) => (
                <tr key={rowIdx} className={rowIdx === 0 ? "bg-primary/10 font-bold" : ""}>
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="border border-muted px-2 py-1 align-top text-left"
                    >
                      {cell.split("\n").map((line, i) =>
                        line.startsWith("- ") ? (
                          <li key={i} className="ml-4 list-disc">
                            {line.replace("- ", "")}
                          </li>
                        ) : (
                          <div key={i}>{renderBold(line)}</div>
                        )
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
      if (line.includes("|")) {
        const row = line.split("|").map((c) => c.trim()).filter(Boolean);
        if (row.length > 0) tableBuffer.push(row);
      } else {
        flushTable();
        if (line.trim() === "") return;
        elements.push(
          <div key={elements.length} className="mb-1 break-words whitespace-pre-wrap">
            {renderBold(line)}
          </div>
        );
      }
    });

    flushTable();
    return elements;
  };

  return (
    <motion.div
      className="glass-panel p-6 rounded-xl max-w-3xl mx-auto shadow-xl flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Predefined Suggestions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {predefinedSuggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(suggestion)}
            className="px-3 py-1 bg-primary text-white rounded-full hover:bg-primary-light transition"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 h-96 flex flex-col">
        <AnimatePresence>
          {chatLog.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`px-4 py-2 rounded-xl max-w-[70%] break-words whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-white self-end text-right"
                  : "bg-muted text-foreground self-start text-left"
              }`}
            >
              {msg.role === "bot" ? renderFormattedContent(msg.content) : msg.content}
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-2 rounded-xl max-w-[50%] bg-muted text-foreground self-start text-left"
            >
              <span className="animate-pulse">AI is typing...</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={scrollRef}></div>
      </div>

      {/* Input Area */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(message)}
          placeholder="Ask about jobs, skills, resume..."
          className="flex-1 px-4 py-2 rounded-xl border border-muted focus:ring-2 focus:ring-primary focus:outline-none bg-background text-foreground"
        />
        <button
          onClick={() => sendMessage(message)}
          disabled={loading}
          className={`px-4 py-2 rounded-xl text-white ${
            loading ? "bg-primary/50 cursor-not-allowed" : "bg-primary hover:bg-primary-light"
          }`}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </motion.div>
  );
}
