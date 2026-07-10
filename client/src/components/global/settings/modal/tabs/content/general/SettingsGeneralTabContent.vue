<template>
  <section :class="baseStyles.base">
    <h3 class="sr-only">General</h3>
    <FormCard
      width="full"
      heading="Nickname"
      titleAs="h4"
      :class="cn(styles.formCard, `**:data-[slot='card-header']:sr-only`)"
      :submitButton="{ text: 'Update', submit }"
      :isSubmitting
      :disabled="isError"
    >
      <UIFieldGroup>
        <FormField name="nickname" :placeholder="initialValues.nickname" />
      </UIFieldGroup>
    </FormCard>
  </section>
</template>

<script setup lang="ts">
import FormCard from "@/components/formCard/FormCard.vue";
import FormField from "@/components/formField/FormField.vue";
import { UIFieldGroup } from "@/components/ui/shadcn/field";
import $api from "@/http";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/utils/shadcn/utils";
import { getZodChangeNicknameBodyValidation } from "@speak-up/shared";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed, watch } from "vue";
import { toast } from "vue-sonner";
import * as baseStyles from "../base.css";
import * as styles from "./SettingsGeneralTabContent.css";

const authStore = useAuthStore();
const initialValues = computed(() => ({
  nickname: authStore.user?.nickname || "",
}));

const { handleSubmit, resetForm, isSubmitting, errors } = useForm({
  validationSchema: toTypedSchema(getZodChangeNicknameBodyValidation()),
  initialValues: initialValues.value,
});

watch(initialValues, newValues => resetForm({ values: newValues }));

const isError = computed(() => !!Object.keys(errors.value).length);
const submit = handleSubmit(async data => {
  if (data.nickname === initialValues.value.nickname) return;
  // TODO: notify other in-room users about nickname change (server thingy ig)
  const res = await $api.user.changeNickname(data);

  if (res.data) {
    authStore.user = res.data;
  } else if (res.errorMessage) {
    toast.error(res.errorMessage);
  }
});
</script>
