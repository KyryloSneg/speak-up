import useInitSentMediaConfigCleanup from "@/composables/useInitSentMediaConfigCleanup";
import useIsJoiningRoomCleanup from "@/composables/useIsJoiningRoomCleanup";
import useMaxMembersOfFutureRoomCleanup from "@/composables/useMaxMembersOfFutureRoomCleanup";
import useStoreChatTriggerCleanup from "@/composables/useStoreChatTriggerCleanup";
import useUserIdsToRemoveCleanup from "@/composables/useUserIdsToRemoveCleanup";

function useCleanups() {
  useIsJoiningRoomCleanup();
  useMaxMembersOfFutureRoomCleanup();
  useInitSentMediaConfigCleanup();
  useUserIdsToRemoveCleanup();
  useStoreChatTriggerCleanup();
}

export default useCleanups;
