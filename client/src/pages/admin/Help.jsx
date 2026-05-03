import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Title from '../../components/admin/Title';

const AdminHelp = () => {
  const { getToken } = useAppContext();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [activeUserId, setActiveUserId] = useState(null);
  const [messagesByUser, setMessagesByUser] = useState({});
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('connecting');
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
            if (data.type === 'chat:users' && Array.isArray(data.users)) {
              setUsers(data.users);
              if (!activeUserId && data.users[0]) {
                setActiveUserId(data.users[0].userId);
              }
            }
            if (data.type === 'chat:message' && data.message) {
              const m = data.message;
              setMessagesByUser((prev) => {
                const list = prev[m.userId] || [];
                return { ...prev, [m.userId]: [...list, m] };
              });
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
  }, [activeUserId, baseWsUrl, getToken]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [activeUserId, messagesByUser]);

  const activeMessages = activeUserId ? messagesByUser[activeUserId] || [] : [];

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  const handleSend = () => {
    const text = input.trim();
    if (!text || !activeUserId) return;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'admin:message', userId: activeUserId, text }));
    setInput('');
  };

  return (
    <div className="flex flex-col gap-4">
      <Title text1="Help" text2="Support" />
      <div className="flex gap-4 h-[500px] max-h-[calc(100vh-180px)]">
        <div className="w-64 border border-primary/20 rounded-lg bg-primary/5 overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-primary/20 flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">Users</span>
              <span className="text-xs text-gray-400">{status === 'online' ? 'Online' : 'Offline'}</span>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="w-full bg-white/5 border border-primary/20 rounded-full px-2.5 py-1 text-[11px] outline-none focus:ring-1 focus:ring-primary/60"
            />
          </div>
          <div className="flex-1 overflow-y-auto text-sm">
            {filteredUsers.length === 0 && (
              <p className="text-xs text-gray-400 p-3">No users match this search.</p>
            )}
            {filteredUsers.map((u) => (
              <button
                key={u.userId}
                onClick={() => setActiveUserId(u.userId)}
                className={`w-full text-left px-3 py-2 border-b border-primary/10 hover:bg-primary/10 text-xs ${
                  activeUserId === u.userId ? 'bg-primary/20 text-primary' : 'text-gray-200'
                }`}
              >
                <p className="font-medium truncate">{u.name || u.email || 'User'}</p>
                {u.lastMessage && (
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">
                    {u.lastMessage.from === 'user' ? 'User: ' : 'You: '}
                    {u.lastMessage.text}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 border border-primary/20 rounded-lg bg-primary/5 flex flex-col">
          <div className="px-4 py-3 border-b border-primary/20 flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">
                {activeUserId
                  ? (() => {
                      const u = users.find((x) => x.userId === activeUserId);
                      return u?.name || u?.email || 'User';
                    })()
                  : 'No user selected'}
              </p>
              <p className="text-xs text-gray-400">Reply to user help messages in real time.</p>
            </div>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-xs">
            {activeMessages.length === 0 && (
              <p className="text-xs text-gray-400 mt-4">No messages yet.</p>
            )}
            {activeMessages.map((m, idx) => {
              const isAdmin = m.from === 'admin';
              return (
                <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] px-3 py-1.5 rounded-lg text-[11px] leading-snug ${
                      isAdmin
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white/5 text-gray-100 rounded-bl-none'
                    }`}
                  >
                    <p className="text-[10px] font-semibold mb-0.5">
                      {isAdmin ? 'You (Admin)' : m.name || 'User'}
                    </p>
                    <p>{m.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 px-4 py-3 border-t border-primary/20">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={activeUserId ? 'Type a reply...' : 'Select a user to reply'}
              className="flex-1 bg-white/5 border border-primary/20 rounded-full px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/60"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !activeUserId || status !== 'online'}
              className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHelp;
