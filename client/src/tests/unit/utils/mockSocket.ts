import Emitter from "@/services/Emitter";
import { vi } from "vitest";

class MockSocket extends Emitter {
  public connected = false;

  public emit = vi.fn();
  public connect = vi.fn();
  public disconnect = vi.fn();

  public override off = vi.fn();
  public override on = vi.fn();

  constructor() {
    super();

    this.off.mockImplementation((...args: Parameters<Emitter["off"]>) => {
      Emitter.prototype.off.apply(this, args);
      return this;
    });

    this.on.mockImplementation((...args: Parameters<Emitter["on"]>) => {
      Emitter.prototype.on.apply(this, args);
      return this;
    });
  }

  async triggerServerEvent(event: string, data: unknown): Promise<void> {
    if (this.events[event]) {
      await Promise.all(this.events[event].map(cb => cb(data)));
    }
  }

  resetMock() {
    this.events = {};
    this.connected = false;

    this.emit.mockClear();
    this.disconnect.mockClear();
  }
}

const mockSocket = new MockSocket();
export default mockSocket;
