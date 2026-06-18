<template>
  <BaseAuthView>
    <AuthSection
      heading="Sign Up"
      :goToOtherAuthMethodLink="{
        text: 'Have an account? Sign In',
        to: RoutesWithoutParams.SIGN_IN,
      }"
      :submitButton="{
        text: 'Register',
        submit,
      }"
      :isSubmitting
      :disabled="isError"
    >
      <UIFieldGroup>
        <AuthField name="nickname" :autofocus="true" />
        <AuthField name="username" />
        <AuthField name="password" type="password" />
      </UIFieldGroup>
    </AuthSection>
  </BaseAuthView>
</template>

<script setup lang="ts">
import AuthField from "@/components/auth/authField/AuthField.vue";
import AuthSection from "@/components/auth/section/AuthSection.vue";
import BaseAuthView from "@/components/auth/view/BaseAuthView.vue";
import { UIFieldGroup } from "@/components/ui/shadcn/field";
import $api from "@/http";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { LocalStorageKeys } from "@/types/localStorage";
import { RoutesWithoutParams } from "@/types/routes";
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
