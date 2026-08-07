import { useAuthStore } from "@/stores/auth";

function checkIsPCPolite(remoteId: string): boolean {
  const authStore = useAuthStore();
  const userId = authStore.user?.id;

  if (!userId) return true;
  return userId > remoteId;
}

export default checkIsPCPolite;
