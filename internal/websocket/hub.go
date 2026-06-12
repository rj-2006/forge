package websocket

import "sync"

type BroadcastMessage struct {
	RoomID  string
	Message []byte
	Sender  *Client
}

type Hub struct {
	Rooms map[string]map[*Client]bool

	Broadcast chan *BroadcastMessage

	Register chan *Client

	Unregister chan *Client

	mu sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		Rooms:      make(map[string]map[*Client]bool),
		Broadcast:  make(chan *BroadcastMessage),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			if h.Rooms[client.RoomID] == nil {
				h.Rooms[client.RoomID] = make(map[*Client]bool)
			}
			h.Rooms[client.RoomID][client] = true
			h.mu.Unlock()

			h.notifyJoin(client)

		case client := <-h.Unregister:
			h.mu.Lock()
			if clients, ok := h.Rooms[client.RoomID]; ok {
				if _, exists := clients[client]; exists {
					delete(clients, client)
					close(client.Send)

					if len(clients) == 0 {
						delete(h.Rooms, client.RoomID)
					}
				}
			}
			h.mu.Unlock()

			h.notifyLeave(client)

		case broadcastMsg := <-h.Broadcast:
			h.mu.RLock()
			clients := h.Rooms[broadcastMsg.RoomID]
			h.mu.RUnlock()

			for client := range clients {
				select {
				case client.Send <- broadcastMsg.Message:
				default:
					h.mu.Lock()
					delete(h.Rooms[broadcastMsg.RoomID], client)
					close(client.Send)
					h.mu.Unlock()
				}
			}
		}
	}
}

func (h *Hub) notifyJoin(client *Client) {
	data, err := NewEvent(EventTypeUserJoined, TypingMessage{
		UserID:   client.UserID,
		Username: client.Username,
	})
	if err != nil {
		return
	}
	h.broadcastToRoom(client.RoomID, data)
}

func (h *Hub) notifyLeave(client *Client) {
	data, err := NewEvent(EventTypeUserLeft, TypingMessage{
		UserID:   client.UserID,
		Username: client.Username,
	})
	if err != nil {
		return
	}
	h.broadcastToRoom(client.RoomID, data)
}

func (h *Hub) broadcastToRoom(roomID string, data []byte) {
	h.mu.RLock()
	clients := h.Rooms[roomID]
	h.mu.RUnlock()

	for client := range clients {
		select {
		case client.Send <- data:
		default:
		}
	}
}

func (h *Hub) GetRoomClients(roomID string) int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.Rooms[roomID])
}
