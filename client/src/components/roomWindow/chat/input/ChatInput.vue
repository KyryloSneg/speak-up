<template>
  <form :class="styles.wrapper" @submit.prevent="submit">
    <label :class="styles.label">
      <span class="sr-only">Message</span>
      <UITextarea
        autocomplete="off"
        placeholder="Send a message..."
        name="message"
        rows="1"
        ref="textareaRef"
        v-model="message"
        v-bind="messageProps"
        @input="handleInput"
        @keydown.enter="handleKeyDown"
        :aria-invalid="!!error"
        :aria-describbedby="isErrorShown ? errorId : undefined"
        :class="styles.textarea"
        :data-id="roomChatInputId"
        autofocus
      />
      <p
        v-if="isErrorShown"
        role="alert"
        aria-live="polite"
        :id="errorId"
        :class="cn(styles.error, 'truncate shadow-sm')"
      >
        {{ error }}
      </p>
    </label>
    <UISeparator orientation="vertical" />
    <UIButton
      size="icon"
      variant="ghost"
      type="submit"
      :class="styles.submitButton"
      :disabled="!!error || isSubmitting"
    >
      <SendHorizontal />
    </UIButton>
  </form>
</template>

<script setup lang="ts">
import { UIButton } from "@/components/ui/shadcn/button";
import UISeparator from "@/components/ui/shadcn/separator/UISeparator.vue";
import { UITextarea } from "@/components/ui/shadcn/textarea";
import { useChatStore } from "@/stores/chat";
import { useMessageStore } from "@/stores/message";
import { roomChatInputId } from "@/utils/idConsts";
import { cn } from "@/utils/shadcn/utils";
import { SendHorizontal } from "@lucide/vue";
import { getZodTextMessageContentPartValueValidation } from "@speak-up/shared";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import {
  computed,
  nextTick,
  ref,
  useId,
  type ComponentPublicInstance,
} from "vue";
import z from "zod";
import * as styles from "./ChatInput.css";

const field = "message" as const;
const textareaRef = ref<ComponentPublicInstance | null>(null);
const errorId = useId();

const messageStore = useMessageStore();
const chatStore = useChatStore();

const { handleSubmit, resetForm, isSubmitting, errors, defineField } = useForm({
  validationSchema: toTypedSchema(
    z
      .object({ [field]: getZodTextMessageContentPartValueValidation() })
      .strict(),
  ),
  initialValues: { [field]: "" },
});

const [message, messageProps] = defineField(field);
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();

    if (message.value?.trim() && !error.value) {
      submit();
    }
  }
};

const handleInput = () => {
  nextTick(() => {
    const elem = textareaRef.value?.$el as HTMLTextAreaElement | undefined;
    if (!elem) return;

    elem.style.height = "auto";
    elem.style.height = `${Math.min(elem.scrollHeight, 140)}px`;
  });
};

const error = computed(() => errors.value[field]);
const isErrorShown = computed(
  () =>
    !!message.value?.trim().length &&
    !!error.value &&
    // idk why but the "Required" error is shown
    // for a fraction of a second when user starts typing
    error.value !== "Required",
);

const submit = handleSubmit(data => {
  messageStore.sendMessage([{ type: "text", value: data[field] }]);

  resetForm();
  nextTick(() => {
    const elem = textareaRef.value?.$el as HTMLTextAreaElement | undefined;
    if (elem) elem.style.height = "auto";

    // wait until the new message is actually shown on the screen
    chatStore.scrollTo(0, chatStore.scrollTemplateRef?.viewport?.scrollHeight);
  });
});
</script>
