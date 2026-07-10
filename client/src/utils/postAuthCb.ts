import { useSocketStore } from "@/stores/socket";

function postAuthCb(): void {
  const socketStore = useSocketStore();
  socketStore.connect();
}

export default postAuthCb;
