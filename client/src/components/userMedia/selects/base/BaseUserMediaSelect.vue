<template>
  <UISelect
    :disabled="!devices.length"
    :model-value="value"
    @update:modelValue="select"
  >
    <UISelectTrigger :aria-label="triggerAriaLabel" :class="styles.trigger">
      <UISelectValue placeholder="Select" />
    </UISelectTrigger>
    <UISelectContent>
      <UISelectGroup>
        <UISelectLabel>{{ label }}</UISelectLabel>
        <template v-for="device in devices">
          <!-- on "granted" => "prompt" or "granted" => "denied",
               browser replaces actual device ids with empty string,
               which causes the UISelect error, so utilize v-if here -->
          <UISelectItem
            v-if="device.deviceId"
            :value="device.deviceId"
            :key="device.deviceId"
          >
            {{ device.label }}
          </UISelectItem>
        </template>
      </UISelectGroup>
    </UISelectContent>
  </UISelect>
</template>

<script setup lang="ts">
import {
  UISelect,
  UISelectContent,
  UISelectGroup,
  UISelectItem,
  UISelectLabel,
  UISelectTrigger,
  UISelectValue,
} from "@/components/ui/shadcn/select";
import type { AcceptableValue } from "reka-ui";
import type { HTMLAttributes } from "vue";
import * as styles from "./BaseUserMediaSelect.css";

defineProps<{
  label: string;
  value: MediaDeviceInfo["deviceId"] | undefined;
  select: (value: AcceptableValue) => void;
  devices: MediaDeviceInfo[];
  triggerAriaLabel?: HTMLAttributes["aria-label"];
}>();
</script>
