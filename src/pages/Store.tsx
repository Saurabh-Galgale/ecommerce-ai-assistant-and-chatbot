import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  PlusCircle,
  Trash2,
  History,
  Moon,
  Sun,
  ImageOff,
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  X,
} from "lucide-react";
import { productsData } from "../data/products";

// Import types separately with the "type" keyword
import type { Message, ChatSession } from "../utils/db";
import {
  saveChatToIndexedDB,
  getAllOldChats,
  clearAllIndexedDBChats,
} from "../utils/db";

export default function Store() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(`thread_${Date.now()}`);

  const [oldChats, setOldChats] = useState<ChatSession[]>([]);
  const [viewingOldChat, setViewingOldChat] = useState<string | null>(null);

  // MOBILE RESPONSIVE STATE
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // FIX: Touch-friendly state for History Dropdown
  const [isHistoryMenuOpen, setIsHistoryMenuOpen] = useState(false);

  // THEME FIX: Initialize from localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // SINGLE PRODUCT VIEW STATE
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof productsData)[0] | null
  >(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedActive = localStorage.getItem("currentChat");
    const savedThread = localStorage.getItem("currentThreadId");
    if (savedActive && savedThread) {
      setMessages(JSON.parse(savedActive));
      setThreadId(savedThread);
    }
    loadOldChats();
  }, []);

  useEffect(() => {
    if (messages.length > 0 && !viewingOldChat) {
      localStorage.setItem("currentChat", JSON.stringify(messages));
      localStorage.setItem("currentThreadId", threadId);
    }
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, threadId, viewingOldChat]);

  // THEME FIX: Save to local storage and update document class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // FIX: Close history menu if user clicks outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsHistoryMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadOldChats = async () => {
    const chats = await getAllOldChats();
    setOldChats(chats);
  };

  const handleNewChat = async () => {
    if (messages.length > 0 && !viewingOldChat) {
      await saveChatToIndexedDB({
        id: threadId,
        date: new Date().toLocaleString(),
        messages,
      });
    }
    localStorage.removeItem("currentChat");
    localStorage.removeItem("currentThreadId");
    setMessages([]);
    setThreadId(`thread_${Date.now()}`);
    setViewingOldChat(null);
    loadOldChats();
  };

  const clearHistory = async () => {
    await clearAllIndexedDBChats();
    setOldChats([]);
    setIsHistoryMenuOpen(false);
    if (viewingOldChat) handleNewChat();
  };

  const sendMessage = async () => {
    if (!input.trim() || viewingOldChat) return;

    const newMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(
        "https://ecommerce-ai-assistant-chatbot-back.vercel.app/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userMessage: newMsg.content, threadId }),
        },
      );
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", content: data.message }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, the server is unreachable right now." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const displayedMessages = viewingOldChat
    ? oldChats.find((c) => c.id === viewingOldChat)?.messages || []
    : messages;

  // CLICKABLE AI TEXT: Scans message for product names and creates links
  const renderAiMessage = (content: string) => {
    let elements: React.ReactNode[] = [content];

    productsData.forEach((p) => {
      elements = elements.flatMap((el) => {
        if (typeof el === "string") {
          const parts = el.split(p.name);
          const newEls: React.ReactNode[] = [];
          parts.forEach((part, i) => {
            newEls.push(part);
            if (i < parts.length - 1) {
              newEls.push(
                <button
                  key={`${p.id}-${i}`}
                  onClick={() => {
                    setSelectedProduct(p);
                    setIsMobileChatOpen(false); // Auto-close chat on mobile when viewing product
                  }}
                  className="text-blue-200 underline font-bold hover:text-white transition-colors text-left"
                >
                  {p.name}
                </button>,
              );
            }
          });
          return newEls;
        }
        return [el];
      });
    });

    return elements;
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* --- Left Area: Products View --- */}
      {/* Added pb-24 on mobile so the floating button doesn't block bottom content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 relative pb-28 md:pb-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              SG AI Storefront
            </h2>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md hover:scale-105 transition-transform"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {selectedProduct ? (
          // --- SINGLE PRODUCT VIEW ---
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden max-w-4xl mx-auto animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setSelectedProduct(null)}
              className="m-4 flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Products
            </button>

            <div className="flex flex-col md:flex-row border-t dark:border-gray-800">
              <div className="md:w-1/2 h-80 md:h-auto bg-gray-100 dark:bg-gray-800 relative">
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden",
                    );
                  }}
                />
                <div className="hidden absolute inset-0 text-gray-400 flex flex-col items-center justify-center">
                  <ImageOff className="w-12 h-12 mb-2" />
                  <span>Image Not Found</span>
                </div>
              </div>

              <div className="p-6 md:p-8 md:w-1/2 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {selectedProduct.category}
                  </span>
                  <h1 className="text-3xl font-extrabold mt-1">
                    {selectedProduct.name}
                  </h1>
                  <div className="text-2xl font-bold mt-2 text-gray-700 dark:text-gray-300">
                    {selectedProduct.currency} {selectedProduct.price}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selectedProduct.description}
                </p>

                <div>
                  <h3 className="font-bold text-lg mb-2 border-b dark:border-gray-800 pb-2">
                    Technical Specs
                  </h3>
                  <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                    {Object.entries(selectedProduct.specs).map(
                      ([key, value]) => (
                        <li key={key} className="flex justify-between">
                          <span className="capitalize font-semibold">
                            {key.replace("_", " ")}:
                          </span>
                          <span className="text-right ml-4">
                            {Array.isArray(value) ? value.join(", ") : value}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2 border-b dark:border-gray-800 pb-2 flex items-center gap-2">
                    Review Synthesis{" "}
                    <span className="text-sm font-normal text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded">
                      ★ {selectedProduct.rating}
                    </span>
                  </h3>
                  <ul className="space-y-3">
                    {selectedProduct.review_summary.map((review, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        {review}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // --- REGULAR PRODUCT GRID ---
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {productsData.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-800 transition-all overflow-hidden flex flex-col group cursor-pointer"
              >
                <div className="h-48 md:h-56 bg-gray-200 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden",
                      );
                    }}
                  />
                  <div className="hidden absolute text-gray-400 flex-col items-center">
                    <ImageOff className="w-8 h-8 mb-2" />
                    <span className="text-xs">Image Not Found</span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {p.category}
                      </span>
                      <span className="flex items-center text-sm font-bold text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md">
                        ★ {p.rating}
                      </span>
                    </div>
                    <h3 className="font-bold text-xl leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {p.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between font-bold">
                    <span className="text-xl md:text-2xl">
                      {p.currency} {p.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Mobile Floating Action Button (FAB) --- */}
      <button
        onClick={() => setIsMobileChatOpen(true)}
        className={`md:hidden fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-[0_10px_25px_rgba(37,99,235,0.5)] transition-transform hover:scale-105 flex items-center gap-2 ${isMobileChatOpen ? "hidden" : "flex"}`}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="font-bold pr-1">Ask SG AI</span>
      </button>

      {/* Mobile Dark Overlay */}
      {isMobileChatOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileChatOpen(false)}
        />
      )}

      {/* --- Right Area: Chatbot Sidebar / Mobile Bottom Sheet --- */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50 h-[85vh] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] 
          transform transition-transform duration-300 ease-in-out
          ${isMobileChatOpen ? "translate-y-0" : "translate-y-full"}
          md:relative md:translate-y-0 md:h-full md:w-[400px] lg:w-[450px] md:rounded-none md:shadow-2xl 
          bg-white dark:bg-gray-900 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 
          flex flex-col
        `}
      >
        {/* Chat Header */}
        <div className="p-4 md:p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-t-3xl md:rounded-none">
          <h3 className="font-bold flex items-center gap-3 text-lg">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Send className="w-4 h-4 text-white" />
            </div>
            SG AI
          </h3>

          <div className="flex gap-1 md:gap-2">
            <button
              onClick={handleNewChat}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="New Chat"
            >
              <PlusCircle className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* FIX: Touch-Friendly Clickable History Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsHistoryMenuOpen(!isHistoryMenuOpen)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="History"
              >
                <History className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>

              {isHistoryMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 md:w-72 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden ring-1 ring-black ring-opacity-5">
                    <div className="p-3 flex justify-between items-center bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                      <span className="font-bold text-sm">Chat History</span>
                      <button
                        onClick={clearHistory}
                        className="text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Delete All History"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-[50vh] md:max-h-72 overflow-y-auto">
                      {oldChats.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setViewingOldChat(c.id);
                            setIsHistoryMenuOpen(false);
                          }}
                          className="w-full text-left p-4 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 border-b dark:border-gray-700 transition-colors"
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            {c.date}
                          </div>
                          <div className="truncate font-medium">
                            {c.messages[0]?.content || "Empty Chat"}
                          </div>
                        </button>
                      ))}
                      {oldChats.length === 0 && (
                        <div className="p-6 text-center text-sm text-gray-500">
                          No previous chats
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileChatOpen(false)}
              className="md:hidden p-2 ml-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6">
          {viewingOldChat && (
            <div className="text-center text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg mx-auto w-fit">
              Read-Only History View
            </div>
          )}

          {displayedMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60 px-4">
              <Send className="w-12 h-12 text-blue-500" />
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                Hi! I'm SG-AI.
                <br />
                How can I help you shop today?
              </p>
            </div>
          )}

          {displayedMessages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none shadow-md"
                    : "bg-gray-800 text-gray-100 rounded-bl-none shadow border border-gray-700"
                }`}
              >
                {m.role === "ai" ? renderAiMessage(m.content) : m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl rounded-bl-none border border-gray-700 p-4 flex gap-2 items-center shadow-md">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 md:p-5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-8 md:pb-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-3 relative"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={viewingOldChat !== null || isLoading}
              placeholder={
                viewingOldChat
                  ? "Click + to start a new chat..."
                  : "E.g., Which shoes are good for flat feet?"
              }
              className={`flex-1 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-xl px-4 py-3 md:px-5 md:py-4 focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none text-sm transition-all shadow-inner
                ${viewingOldChat ? "cursor-not-allowed opacity-60 font-bold italic" : ""}`}
            />
            <button
              type="submit"
              disabled={viewingOldChat !== null || isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white aspect-square rounded-lg flex items-center justify-center disabled:opacity-50 transition-colors shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
