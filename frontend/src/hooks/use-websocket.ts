import { useEffect, useRef, useCallback, useState } from "react";
import { useAuthStore } from "../stores/auth-store";
import type { ChatMessage } from "../types/api";

interface WebSocketMessage {
  type: string;
  payload: unknown;
}

interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  reconnectAttempts = 5,
  reconnectInterval = 3000,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generation counter — prevents stale closures from old connections
  // from corrupting state or triggering phantom reconnects.
  const connectionIdRef = useRef(0);

  // Stable refs for callbacks — updates without triggering reconnect
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onOpenRef.current = onOpen; }, [onOpen]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const token = useAuthStore((state) => state.token);

  const connect = useCallback(() => {
    if (!url) return;

    // Mint a new generation ID — all handlers from previous connections
    // will see a stale ID and silently bail out.
    const thisConnectionId = ++connectionIdRef.current;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "switching");
      wsRef.current = null;
    }

    const wsUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (connectionIdRef.current !== thisConnectionId) return;
        setIsConnected(true);
        reconnectCountRef.current = 0;
        onOpenRef.current?.();
      };

      ws.onerror = (error) => {
        if (connectionIdRef.current !== thisConnectionId) return;
        onErrorRef.current?.(error);
      };

      ws.onclose = (event) => {
        // If this closure belongs to a superseded connection, ignore it entirely.
        // This is the core fix: without this guard, the old socket's async onclose
        // would set isConnected=false and schedule reconnects that tear down the
        // new, perfectly healthy connection.
        if (connectionIdRef.current !== thisConnectionId) return;

        setIsConnected(false);
        onCloseRef.current?.();

        if (event.code !== 1000 && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          const backoffDelay = Math.min(
            1000 * Math.pow(1.5, reconnectCountRef.current),
            30000,
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            // Double-check: if a newer connection was created while we waited,
            // this reconnect is stale — don't fire it.
            if (connectionIdRef.current !== thisConnectionId) return;
            connect();
          }, backoffDelay);
        }
      };

      ws.onmessage = (event) => {
        if (connectionIdRef.current !== thisConnectionId) return;
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          setLastMessage(message);
          onMessageRef.current?.(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
  }, [url, token, reconnectAttempts]);

  const disconnect = useCallback(() => {
    // Bump the generation — instantly invalidates all handlers from the current connection
    connectionIdRef.current++;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "unmounting");
      wsRef.current = null;
    }

    setIsConnected(false);
    reconnectCountRef.current = 0;
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected. Message not sent:", message);
    }
  }, []);

  useEffect(() => {
    if (!url) return;

    connect();

    return () => {
      disconnect();
    };
  }, [url, connect, disconnect]);

  return {
    isConnected,
    sendMessage,
    lastMessage,
  };
}

interface UseChatWebSocketOptions {
  chatroomId: number;
  onMessage?: (message: ChatMessage) => void;
  onUserJoined?: (userId: number, username: string) => void;
  onUserLeft?: (userId: number) => void;
  onTyping?: (userId: number, username: string) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
}

interface UseChatWebSocketReturn {
  isConnected: boolean;
  sendMessage: (content: string) => void;
  sendTyping: () => void;
}

export function useChatWebSocket({
  chatroomId,
  onMessage,
  onUserJoined,
  onUserLeft,
  onTyping,
  onError,
  onClose,
}: UseChatWebSocketOptions): UseChatWebSocketReturn {
  const WS_BASE_URL =
    import.meta.env.VITE_WS_URL ||
    (window.location.protocol === "https:" ? "wss://" : "ws://") + window.location.host;
  const wsUrl =
    chatroomId > 0 ? `${WS_BASE_URL}/api/chatrooms/${chatroomId}/ws` : "";

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      switch (message.type) {
        case "new_message":
          onMessage?.(message.payload as ChatMessage);
          break;
        case "user_joined":
          const joined = message.payload as {
            user_id: number;
            username: string;
          };
          onUserJoined?.(joined.user_id, joined.username);
          break;
        case "user_left":
          const left = message.payload as { user_id: number };
          onUserLeft?.(left.user_id);
          break;
        case "typing":
          const typing = message.payload as {
            user_id: number;
            username: string;
          };
          onTyping?.(typing.user_id, typing.username);
          break;
      }
    },
    [onMessage, onUserJoined, onUserLeft, onTyping],
  );

  const { isConnected, sendMessage: rawSendMessage } = useWebSocket({
    url: wsUrl,
    onMessage: handleMessage,
    onError,
    onClose,
  });

  const sendMessage = useCallback(
    (content: string) => {
      rawSendMessage({
        type: "send_message",
        payload: { content },
      });
    },
    [rawSendMessage],
  );

  const sendTyping = useCallback(() => {
    rawSendMessage({
      type: "typing",
      payload: {},
    });
  }, [rawSendMessage]);

  return {
    isConnected,
    sendMessage,
    sendTyping,
  };
}
