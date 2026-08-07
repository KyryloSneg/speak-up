<template>
  <FormCard
    width="full"
    titleAs="h3"
    heading="Create a room"
    :link="{
      text: 'Join a room instead',
      to: RoutesWithoutParams.HOME,
      variant: 'secondary',
    }"
    :submitButton="{
      text: 'Create',
      submit,
    }"
    :isSubmitting="isSubmitting || roomStore.isJoining"
    :disabled="isError"
    :class="styles.formCard"
    :headerClass="styles.header"
    :titleClass="styles.title"
    :actionClass="styles.action"
  >
    <UIFieldGroup>
      <FormField
        name="maxMembers"
        :preserveErrorSpace="true"
        :autofocus="true"
      />
    </UIFieldGroup>
  </FormCard>
</template>

<script setup lang="ts">
import FormCard from "@/components/formCard/FormCard.vue";
import FormField from "@/components/formField/FormField.vue";
import * as styles from "@/components/layout/home/HomeLayout.css";
import { UIFieldGroup } from "@/components/ui/shadcn/field";
import { useRoomStore } from "@/stores/room";
import { RoutesWithoutParams } from "@/types/routes";
import { getZodRoomMaxMembersValidation } from "@speak-up/shared";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed } from "vue";
import z from "zod";

const roomStore = useRoomStore();
const { handleSubmit, isSubmitting, errors } = useForm({
  validationSchema: toTypedSchema(
    z.object({ maxMembers: getZodRoomMaxMembersValidation() }).strict(),
  ),
  initialValues: {
    maxMembers: "10",
  },
});

const isError = computed(() => !!Object.keys(errors.value).length);
const submit = handleSubmit(data => roomStore.createRoom(data.maxMembers));
</script>
