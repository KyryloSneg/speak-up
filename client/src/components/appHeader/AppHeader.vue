<template>
  <header :class="styles.header">
    <AppHeading />
    <AppHeaderActions />
  </header>
</template>

<script setup lang="ts">
import AppHeaderActions from "@/components/appHeader/actions/AppHeaderActions.vue";
import AppHeading from "@/components/appHeading/AppHeading.vue";
import * as styles from "./AppHeader.css";
</script>
