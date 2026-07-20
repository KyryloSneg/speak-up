<template>
  <FormCard
    width="full"
    titleAs="h3"
    heading="Join a room"
    :link="{
      text: 'Create a room instead',
      to: RoutesWithoutParams.CREATE_ROOM,
      variant: 'secondary',
    }"
    :submitButton="{
      text: 'Join',
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
        name="id"
        label="Room id"
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
import router from "@/router";
import { useRoomStore } from "@/stores/room";
import { RoutesWithoutParams } from "@/types/routes";
import { getZodJoinRoomDataValidation } from "@speak-up/shared";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const defaultId = computed(() => (route.params as { roomId?: string }).roomId);

const initialValues = computed(() => ({
  id: defaultId.value || "",
}));

const roomStore = useRoomStore();
const { handleSubmit, resetForm, isSubmitting, errors, meta } = useForm({
  validationSchema: toTypedSchema(getZodJoinRoomDataValidation()),
  initialValues: initialValues.value,
});

watch(initialValues, newValues => {
  if (!meta.value.touched && defaultId.value) resetForm({ values: newValues });
});

watchEffect(() => {
  if (defaultId.value) router.replace(RoutesWithoutParams.HOME);
});

const isError = computed(() => !!Object.keys(errors.value).length);
const submit = handleSubmit(data => roomStore.joinRoom(data.id));
</script>
