import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { XIcon, SendHorizonalIcon } from 'lucide-react';

const HelpChat = ({ onClose }) => {
  const { getToken, user } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('connecting'); // connecting | online | offline
  const wsRef = useRef(null);
  const listRef = useRef(null);

  const baseWsUrl = useMemo(() => {
    try {
      const base = import.meta.env.VITE_BASE_URL || window.location.origin;
      return base.replace(/^http/, 'ws');
    } catch {
      return '';
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const connect = async () => {
      const token = await getToken();
      if (!token || !baseWsUrl) {
        if (!isMounted) return;
        setStatus('offline');
        return;
      }
      try {
        const ws = new WebSocket(`${baseWsUrl}/ws/help?token=${encodeURIComponent(token)}`);
        wsRef.current = ws;
        ws.onopen = () => {
          if (!isMounted) return;
          setStatus('online');
        };
        ws.onclose = () => {
          if (!isMounted) return;
          setStatus('offline');
        };
        ws.onerror = () => {
          if (!isMounted) return;
          setStatus('offline');
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'chat:message' && data.message) {
              setMessages((prev) => [...prev, data.message]);
            }
          } catch {
            // ignore
          }
        };
      } catch {
        if (!isMounted) return;
        setStatus('offline');
      }
    };
    connect();
    return () => {
      isMounted = false;
      try {
        wsRef.current && wsRef.current.close();
      } catch {
        // ignore
      }
    };
  }, [baseWsUrl, getToken]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'user:message', text }));
    setInput('');
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[90vw] bg-black/90 border border-white/10 rounded-xl shadow-xl flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div>
          <p className="text-sm font-semibold">Help &amp; Support</p>
          <p className="text-[11px] text-gray-400">
            {status === 'online' ? 'Admin is online' : status === 'connecting' ? 'Connecting...' : 'Offline'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-300"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-xs max-h-80">
        {messages.length === 0 && (
          <p className="text-[11px] text-gray-400 text-center mt-4">
            Ask anything about your bookings or shows. An admin will reply here.
          </p>
        )}
        {messages.map((m, idx) => {
          const isSelf = m.from === 'user';
          return (
            <div key={idx} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-2.5 py-1.5 rounded-lg text-[11px] leading-snug ${
                  isSelf
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-white/10 text-gray-100 rounded-bl-none'
                }`}
              >
                {!isSelf && (
                  <p className="text-[10px] font-semibold mb-0.5">Admin</p>
                )}
                <p>{m.text}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-1 px-2 py-2 border-t border-white/10">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type your message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-primary/60"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || status !== 'online'}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/80 hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <SendHorizonalIcon className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default HelpChat;
