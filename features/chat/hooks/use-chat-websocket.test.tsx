// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useChatWebSocket } from "@/features/chat/hooks/use-chat-websocket";

const MESSAGE_ID = "00000000-0000-4000-8000-000000000001";

class FakeWebSocket extends EventTarget {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  static instances: FakeWebSocket[] = [];

  readonly url: string;
  readyState = FakeWebSocket.CONNECTING;
  sentMessages: string[] = [];
  hasSendError = false;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent<string>) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    super();
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  open(): void {
    this.readyState = FakeWebSocket.OPEN;
    const event = new Event("open");
    this.dispatchEvent(event);
    this.onopen?.(event);
  }

  emitMessage(payload: unknown): void {
    const event = new MessageEvent<string>("message", {
      data: JSON.stringify(payload),
    });
    this.dispatchEvent(event);
    this.onmessage?.(event);
  }

  emitClose(): void {
    this.readyState = FakeWebSocket.CLOSED;
    const event = new CloseEvent("close");
    this.dispatchEvent(event);
    this.onclose?.(event);
  }

  send(message: string): void {
    if (this.hasSendError) {
      throw new DOMException("Socket is not open", "InvalidStateError");
    }

    this.sentMessages.push(message);
  }

  close(): void {
    if (
      this.readyState === FakeWebSocket.CLOSING ||
      this.readyState === FakeWebSocket.CLOSED
    ) {
      return;
    }

    this.readyState = FakeWebSocket.CLOSING;
    queueMicrotask(() => this.emitClose());
  }
}

function currentSocket(): FakeWebSocket {
  const socket = FakeWebSocket.instances.at(-1);
  if (!socket) {
    throw new Error("WebSocket was not created");
  }

  return socket;
}

describe("useChatWebSocket", () => {
  beforeEach(() => {
    FakeWebSocket.instances = [];
    vi.useFakeTimers();
    vi.stubGlobal("WebSocket", FakeWebSocket);
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(MESSAGE_ID);
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("ignores a close event from a socket disposed by Strict Mode", () => {
    const { result } = renderHook(() => useChatWebSocket(), {
      reactStrictMode: true,
    });
    const staleSocket = FakeWebSocket.instances[0];
    const activeSocket = currentSocket();

    expect(FakeWebSocket.instances).toHaveLength(2);
    expect(staleSocket).not.toBe(activeSocket);
    expect(staleSocket.onclose).toBeNull();

    act(() => activeSocket.open());
    expect(result.current.connectionState).toBe("open");

    act(() => staleSocket.emitClose());

    expect(result.current.connectionState).toBe("open");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("schedules only one reconnect for repeated close events", () => {
    renderHook(() => useChatWebSocket());
    const socket = currentSocket();

    act(() => socket.emitClose());
    act(() => socket.emitClose());

    expect(vi.getTimerCount()).toBe(1);
  });

  it("flushes a message queued immediately before the socket opens", () => {
    const { result } = renderHook(() => useChatWebSocket());
    const socket = currentSocket();

    act(() => {
      result.current.sendMessage("Привет");
      socket.open();
    });

    expect(socket.sentMessages).toHaveLength(1);
    expect(result.current.messages[0].status).toBe("sending");
  });

  it("returns a message to the queue when socket.send throws", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const { result } = renderHook(() => useChatWebSocket());
    const socket = currentSocket();
    act(() => socket.open());
    socket.hasSendError = true;

    expect(() => {
      act(() => result.current.sendMessage("Привет"));
    }).not.toThrow();

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].status).toBe("queued");
    expect(consoleError).toHaveBeenCalledOnce();
  });

  it("reconnects after a send failure closes the socket", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { result } = renderHook(() => useChatWebSocket());
    const failedSocket = currentSocket();
    act(() => failedSocket.open());
    failedSocket.hasSendError = true;

    await act(async () => {
      result.current.sendMessage("Привет");
      await Promise.resolve();
    });

    expect(result.current.connectionState).toBe("closed");
    expect(vi.getTimerCount()).toBe(1);

    act(() => vi.advanceTimersByTime(1000));
    expect(currentSocket()).not.toBe(failedSocket);
  });

  it("ignores an echo with an invalid timestamp", () => {
    const consoleWarn = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const { result } = renderHook(() => useChatWebSocket());
    const socket = currentSocket();
    act(() => socket.open());
    act(() => result.current.sendMessage("Привет"));

    act(() => {
      socket.emitMessage({
        id: MESSAGE_ID,
        text: "Привет",
        createdAt: "invalid-date",
      });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].status).toBe("sending");
    expect(consoleWarn).toHaveBeenCalledOnce();
  });

  it("confirms a valid echo once", () => {
    const { result } = renderHook(() => useChatWebSocket());
    const socket = currentSocket();
    act(() => socket.open());
    act(() => result.current.sendMessage("Привет"));
    const echo = JSON.parse(socket.sentMessages[0]) as unknown;

    act(() => socket.emitMessage(echo));
    act(() => socket.emitMessage(echo));

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].status).toBe("delivered");
    expect(result.current.messages[1]).toMatchObject({
      author: "consultant",
      status: "delivered",
    });
  });

  it("returns an unconfirmed message to the queue and resends it after reconnect", () => {
    const { result } = renderHook(() => useChatWebSocket());
    const firstSocket = currentSocket();
    act(() => firstSocket.open());
    act(() => result.current.sendMessage("Привет"));

    expect(firstSocket.sentMessages).toHaveLength(1);
    const firstPayload = JSON.parse(firstSocket.sentMessages[0]);
    expect(result.current.messages[0].status).toBe("sending");

    act(() => firstSocket.emitClose());
    expect(result.current.messages[0].status).toBe("queued");

    act(() => vi.advanceTimersByTime(1000));
    const reconnectedSocket = currentSocket();
    act(() => reconnectedSocket.open());

    expect(reconnectedSocket.sentMessages).toHaveLength(1);
    expect(JSON.parse(reconnectedSocket.sentMessages[0])).toEqual(firstPayload);
    expect(globalThis.crypto.randomUUID).toHaveBeenCalledOnce();
    expect(result.current.messages[0].status).toBe("sending");
  });

  it("cancels a pending reconnect on unmount", () => {
    const { unmount } = renderHook(() => useChatWebSocket());
    act(() => currentSocket().emitClose());
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
