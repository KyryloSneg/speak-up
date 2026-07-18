<template>
  <section :class="styles.messageGroup">
    <header :class="styles.header">
      <img
        :src="messageGroup.picture"
        alt=""
        draggable="false"
        :class="styles.picture"
      />
      <h3 :class="cn(styles.nickname, 'truncate')">
        {{ messageGroup.nickname }}
      </h3>
    </header>
    <ul :class="styles.list">
      <li
        v-for="message in messageGroup.messages"
        :key="message.id"
        :class="styles.message"
      >
        <p :class="styles.content" tabindex="0" data-message="true">
          <template
            v-for="(token, i) in getMessageTokens(message.content)"
            :key="i"
          >
            <UIButton
              v-if="token.isLink"
              variant="link"
              as="a"
              class="inline whitespace-normal break-word h-auto p-0 align-baseline"
              :type="undefined"
              :href="token.href"
              :target="
                token.type === 'url' && !token.href.startsWith('mailto:')
                  ? '_blank'
                  : undefined
              "
            >
              {{ token.value }}
            </UIButton>
            <span v-else>{{ token.value }}</span>
          </template>
        </p>
        <time
          :datetime="message.createdAt"
          :class="
            cn(
              styles.time,
              !checkIsToRenderTime(message, messageGroup) && 'sr-only',
            )
          "
        >
          {{ getTime(message.createdAt) }}
        </time>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import UIButton from "@/components/ui/shadcn/button/UIButton.vue";
import type { MessageGroup } from "@/types/message";
import { cn } from "@/utils/shadcn/utils";
import type { Message, MessageContent } from "@speak-up/shared";
import { tokenize, type MultiToken } from "linkifyjs";
import * as styles from "./RoomChatMessageGroup.css";

function getTime(createdAt: string): string {
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return formatter.format(new Date(createdAt));
}

function getMessageContent(content: MessageContent): string {
  return content.reduce(
    (acc, curr) => (curr.type === "text" ? `${acc} ${curr.value}` : acc),
    "",
  );
}

function getMessageTokens(
  content: MessageContent,
): ReturnType<MultiToken["toObject"]>[] {
  const text = getMessageContent(content);
  return tokenize(text).map(token => token.toObject());
}

function checkIsToRenderTime(
  message: Message,
  messageGroup: MessageGroup,
): boolean {
  const index = messageGroup.messages.indexOf(message);

  if (index === -1) return false;
  if (index === 0) return true;

  const prevMessage = messageGroup.messages[index - 1]!;

  const time = getTime(message.createdAt);
  const prevTime = getTime(prevMessage.createdAt);

  return time !== prevTime;
}

defineProps<{
  messageGroup: MessageGroup;
}>();
</script>
