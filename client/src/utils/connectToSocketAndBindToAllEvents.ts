import bindToAllSocketEvents from "@/utils/bindToAllSocketEvents";
import socket from "@/utils/socket";

function connectToSocketAndBindToAllEvents(): void {
  bindToAllSocketEvents();
  socket.connect();
}

export default connectToSocketAndBindToAllEvents;
