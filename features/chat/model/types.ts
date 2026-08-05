export type MessageStatus = "queued" | "sending" | "delivered";

export type MessageAuthor = "user" | "consultant";

export type ChatMessage = {
  id: string;
  text: string;
  createdAt: string;
  author: MessageAuthor;
  status: MessageStatus;
};

export type OutgoingPayload = {
  id: string;
  text: string;
  createdAt: string;
};

export type ConnectionState =
  | "connecting"
  | "open"
  | "closed"
  | "reconnecting";

export type ChatState = {
  messages: ChatMessage[];
};

export type ChatAction =
  | { type: "MESSAGE_QUEUED"; payload: { id: string; text: string; createdAt: string } }
  | { type: "MESSAGE_SENDING"; payload: { id: string } }
  | { type: "MESSAGE_QUEUED_AGAIN"; payload: { id: string } }
  | { type: "ECHO_RECEIVED"; payload: { id: string; text: string; createdAt: string } }
  | { type: "PENDING_RETURNED_TO_QUEUE" };
