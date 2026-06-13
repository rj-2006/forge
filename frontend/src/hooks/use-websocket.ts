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
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const token = useAuthStore((state) => state.token);

  const connect = useCallback(() => {
    if (!url) {
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectCountRef.current = 0;
        onOpen?.();
      };

      ws.onerror = (error) => {
        onError?.(error);
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        onClose?.();

        if (event.code !== 1000) {
          reconnectCountRef.current++;

          const backoffDelay = Math.min(
            1000 * Math.pow(1.5, reconnectCountRef.current),
            30000,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, backoffDelay);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
  }, [
    url,
    token,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectAttempts,
    reconnectInterval,
  ]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
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
  const baseUrl =
    import.meta.env.VITE_API_URL?.replace(/^http/, "ws") ||
    "ws://localhost:5070";
  const wsUrl =
    chatroomId > 0 ? `${baseUrl}/api/chatrooms/${chatroomId}/ws` : "";

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
