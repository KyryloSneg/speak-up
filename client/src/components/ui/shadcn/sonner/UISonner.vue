<script lang="ts" setup>
import { cn } from "@/utils/shadcn/utils";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "@lucide/vue";
import type { ToasterProps } from "vue-sonner";
import { Toaster as Sonner } from "vue-sonner";
import "vue-sonner/style.css";

const props = defineProps<ToasterProps>();
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    v-bind="{
      ...props,
      toastOptions: {
        ...props.toastOptions,
        classes: {
          toast:
            'group toast flex items-center gap-3 w-full font-sans p-4 min-w-[340px] !rounded-xl !border ' +
            '!bg-white !text-neutral-900 !border-neutral-200/80 !shadow-[0_15px_45px_rgba(0,0,0,0.14)] ' +
            'dark:!bg-neutral-900 dark:!text-neutral-50 dark:!border-white/[0.08] dark:!shadow-[0_22px_60px_rgba(0,0,0,0.7)]',

          description: 'text-neutral-500 dark:text-neutral-400 text-xs',
          actionButton:
            'bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-md transition-colors hover:bg-primary/90',
          cancelButton:
            'bg-muted text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-md transition-colors hover:bg-muted/80',
          ...props.toastOptions?.classes,
        },
      },
    }"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-4 text-success" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4 text-accent-foreground" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4 text-warning" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4 text-destructive" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin text-muted-foreground" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>
