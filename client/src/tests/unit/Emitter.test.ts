import Emitter from "@/services/Emitter";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Emitter", () => {
  let emitter: Emitter;

  const firstEvent = "firstEvent";
  const secEvent = "secEvent";

  const firstIncomingEventData = { field: "field" } as const;
  const secIncomingEventData = { property: "property" } as const;

  const firstEventHandler = vi.fn();
  const secEventHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    emitter = new Emitter();
  });

  it("should properly listen to an event", () => {
    const firstData = [firstIncomingEventData, firstIncomingEventData];

    emitter.on(firstEvent, firstEventHandler);
    emitter.on(secEvent, secEventHandler);

    emitter.emit(firstEvent, ...firstData);

    expect(secEventHandler).not.toHaveBeenCalled();
    expect(firstEventHandler).toHaveBeenCalledExactlyOnceWith(...firstData);
  });

  it("should properly attach multiple handlers to an event", () => {
    const data = [firstIncomingEventData, firstIncomingEventData];

    emitter.on(firstEvent, firstEventHandler);
    emitter.on(firstEvent, firstEventHandler);

    emitter.emit(firstEvent, ...data);

    expect(firstEventHandler).toHaveBeenNthCalledWith(1, ...data);
    expect(firstEventHandler).toHaveBeenNthCalledWith(2, ...data);
  });

  it("should properly stop an exact event listener", () => {
    const additionalFirstEventHandler = vi.fn();

    const firstData = [firstIncomingEventData, firstIncomingEventData];
    const secData = [secIncomingEventData, secIncomingEventData];

    emitter.on(firstEvent, firstEventHandler);
    emitter.on(firstEvent, additionalFirstEventHandler);

    emitter.on(secEvent, secEventHandler);

    emitter.off(firstEvent, firstEventHandler);

    emitter.emit(firstEvent, ...firstData);
    emitter.emit(secEvent, ...secData);

    expect(firstEventHandler).not.toHaveBeenCalled();
    expect(additionalFirstEventHandler).toHaveBeenCalledExactlyOnceWith(
      ...firstData,
    );

    expect(secEventHandler).toHaveBeenCalledExactlyOnceWith(...secData);
  });

  it("should properly stop all listeners of an event", () => {
    const additionalFirstEventHandler = vi.fn();

    const firstData = [firstIncomingEventData, firstIncomingEventData];
    const secData = [secIncomingEventData, secIncomingEventData];

    emitter.on(firstEvent, firstEventHandler);
    emitter.on(firstEvent, additionalFirstEventHandler);

    emitter.on(secEvent, secEventHandler);

    emitter.off(firstEvent);

    emitter.emit(firstEvent, ...firstData);
    emitter.emit(secEvent, ...secData);

    expect(firstEventHandler).not.toHaveBeenCalled();
    expect(additionalFirstEventHandler).not.toHaveBeenCalled();

    expect(secEventHandler).toHaveBeenCalledExactlyOnceWith(...secData);
  });

  it("should properly stop all listeners of all events", () => {
    const additionalFirstEventHandler = vi.fn();

    const firstData = [firstIncomingEventData, firstIncomingEventData];
    const secData = [secIncomingEventData, secIncomingEventData];

    emitter.on(firstEvent, firstEventHandler);
    emitter.on(firstEvent, additionalFirstEventHandler);

    emitter.on(secEvent, secEventHandler);
    emitter.off();

    emitter.emit(firstEvent, ...firstData);
    emitter.emit(secEvent, ...secData);

    expect(firstEventHandler).not.toHaveBeenCalled();
    expect(additionalFirstEventHandler).not.toHaveBeenCalled();
    expect(secEventHandler).not.toHaveBeenCalled();
  });
});
