<template>
  <FormCard
    heading="Sign Up"
    :link="{
      text: 'Have an account? Sign In',
      to: RoutesWithoutParams.SIGN_IN,
    }"
    :invisibleFocus="{
      text: 'Go back to the header',
      props: { selector: 'header' },
    }"
    :submitButton="{
      text: 'Register',
      submit,
    }"
    :isSubmitting
    :disabled="isError"
    :headerClass="styles.header"
    :titleClass="styles.title"
    :actionClass="styles.action"
  >
    <UIFieldGroup :id="authLayoutFieldGroupId">
      <FormField name="nickname" :autofocus="true" />
      <FormField name="username" />
      <FormField name="password" type="password" />
    </UIFieldGroup>
  </FormCard>
</template>

<script setup lang="ts">
import FormCard from "@/components/formCard/FormCard.vue";
import FormField from "@/components/formField/FormField.vue";
import * as styles from "@/components/layout/auth/AuthLayout.css";
import { UIFieldGroup } from "@/components/ui/shadcn/field";
import $api from "@/http";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { LocalStorageKeys } from "@/types/localStorage";
import { RoutesWithoutParams } from "@/types/routes";
import { authLayoutFieldGroupId } from "@/utils/idConsts";
import { getZodRegisterBodyValidation } from "@speak-up/shared";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed } from "vue";
import { toast } from "vue-sonner";

const authStore = useAuthStore();
const { handleSubmit, isSubmitting, errors } = useForm({
  validationSchema: toTypedSchema(getZodRegisterBodyValidation()),
  initialValues: {
    nickname: "",
    username: "",
    password: "",
  },
});

const isError = computed(() => !!Object.keys(errors.value).length);
const submit = handleSubmit(async data => {
  const res = await $api.auth.register(data);

  if (res.data) {
    localStorage.setItem(
      LocalStorageKeys.ACCESS_TOKEN,
      res.data.tokens.accessToken,
    );

    authStore.user = res.data.user;
    router.push(RoutesWithoutParams.HOME);
  } else if (res.errorMessage) {
    toast.error(res.errorMessage);
  }
});
</script>
