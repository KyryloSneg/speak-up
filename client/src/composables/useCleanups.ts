import useIsJoiningRoomCleanup from "@/composables/useIsJoiningRoomCleanup";
import useMaxMembersOfFutureRoomCleanup from "@/composables/useMaxMembersOfFutureRoomCleanup";
import useUserIdsToRemoveCleanup from "@/composables/useUserIdsToRemoveCleanup";

function useCleanups() {
  useIsJoiningRoomCleanup();
  useMaxMembersOfFutureRoomCleanup();
  useUserIdsToRemoveCleanup();
}

export default useCleanups;
