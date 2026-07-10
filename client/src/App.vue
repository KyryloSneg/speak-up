<script setup lang="ts">
import GlobalComponents from "@/components/global/GlobalComponents.vue";
import useAppInitialization from "@/composables/useAppInitialization";
import useAppLayout from "@/composables/useAppLayout";
import { RouterView } from "vue-router";

useAppInitialization();

const layout = useAppLayout();
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
  <GlobalComponents />
</template>
