<template>
  <header :class="styles.header">
    <AppHeading />
    <AppHeaderInvisibleFocus />
    <AppHeaderActions />
  </header>
</template>

<script setup lang="ts">
import AppHeaderActions from "@/components/appHeader/actions/AppHeaderActions.vue";
import AppHeaderInvisibleFocus from "@/components/appHeader/invisibleFocus/AppHeaderInvisibleFocus.vue";
import AppHeading from "@/components/appHeading/AppHeading.vue";
import * as styles from "./AppHeader.css";
</script>
