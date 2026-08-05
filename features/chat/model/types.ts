export type MessageStatus = "queued" | "sending" | "delivered";

type Message = {
  readonly id: string;
  readonly text: string;
  readonly createdAt: string;
};

export type UserMessage = Message & {
  readonly author: "user";
  readonly status: MessageStatus;
};

export type ConsultantMessage = Message & {
  readonly author: "consultant";
  readonly status: "delivered";
};

export type ChatMessage = UserMessage | ConsultantMessage;

export type MessagePayload = Readonly<Pick<Message, "id" | "text" | "createdAt">>;

export type ConnectionState = "connecting" | "open" | "closed" | "reconnecting";

export type ChatState = {
  readonly messages: readonly ChatMessage[];
};

export type ChatAction =
  | {
      type: "MESSAGE_QUEUED";
      readonly payload: MessagePayload;
    }
  | { type: "MESSAGE_SENDING"; readonly payload: { readonly id: string } }
  | { type: "MESSAGE_QUEUED_AGAIN"; readonly payload: { readonly id: string } }
  | {
      type: "ECHO_RECEIVED";
      readonly payload: MessagePayload;
    }
  | { type: "PENDING_RETURNED_TO_QUEUE" };
