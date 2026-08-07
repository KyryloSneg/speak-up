import type {
  AllowedComponentProps,
  AriaAttributes,
  ComponentCustomProps,
} from "vue";

type ExtractProps<T> = T extends new (...args: any[]) => { $props: infer P }
  ? P
  : T extends (props: infer P, ...args: any[]) => any
    ? P
    : {};

type RawComponentBindings<TargetComponent> = ExtractProps<TargetComponent> &
  AllowedComponentProps &
  ComponentCustomProps &
  AriaAttributes;

export type ComponentBindings<
  TargetComponent,
  IsRequired extends boolean = true,
> = IsRequired extends true
  ? RawComponentBindings<TargetComponent>
  : Partial<RawComponentBindings<TargetComponent>>;
