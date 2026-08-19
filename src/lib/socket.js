'use client';

/**
 * socket.js
 * ---------------------------------------------------------------------------
 * Backend ke `src/sockets/index.js` se match karta hai — wahan room naming
 * `auction:<id>` hai, events `bid:new`, `auction:started`, `auction:closed`.
 *
 * Ek hi socket connection poore app me reuse hoti hai (singleton) —
 * har page pe naya connection banana wasteful hota.
 * ---------------------------------------------------------------------------
 */

import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false });
  }
  return socket;
}

export function joinAuctionRoom(auctionId) {
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit('auction:join', auctionId);
}

export function leaveAuctionRoom(auctionId) {
  const s = getSocket();
  s.emit('auction:leave', auctionId);
}
