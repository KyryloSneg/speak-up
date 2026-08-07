type DefaultEvent = string;
type EventHandler = (...args: unknown[]) => void;

// TODO: type the values too?
class Emitter<Event extends DefaultEvent = DefaultEvent> {
  public events: Partial<Record<Event, EventHandler[]>>;

  constructor() {
    this.events = {};
  }

  emit(event: Event, ...args: Parameters<EventHandler>): Emitter {
    this.events[event]?.forEach(cb => cb(...args));
    return this;
  }

  on(event: Event, cb: EventHandler): Emitter {
    if (this.events[event]) {
      this.events[event].push(cb);
    } else {
      this.events[event] = [cb];
    }

    return this;
  }

  off(event: Event | null = null, cb: EventHandler | null = null): Emitter {
    if (event && typeof cb === "function") {
      if (this.events[event]) {
        this.events[event] = this.events[event].filter(item => item !== cb);
        if (!this.events[event].length) delete this.events[event];
      }
    } else if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }

    return this;
  }
}

export default Emitter;
