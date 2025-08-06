"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  useFormContext,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = useFormContext

type FormFieldRenderProps = {
  field: ControllerRenderProps<FieldValues, FieldPath<FieldValues>>
  fieldState: ControllerFieldState
  formState: UseFormStateReturn<FieldValues>
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

type ControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  onChange: (...event: any[]) => void
  onBlur: () => void
  value: GetValue<TFieldValues, TName>
  name: TName
  ref: RefCallBack
  disabled?: boolean
}

type ControllerFieldState = {
  invalid: boolean
  isDirty: boolean
  isTouched: boolean
  error?: FieldError
}

type UseFormStateReturn<TFieldValues extends FieldValues = FieldValues> = {
  isDirty: boolean
  isLoading: boolean
  isSubmitted: boolean
  isSubmitSuccessful: boolean
  isSubmitting: boolean
  isValidating: boolean
  isValid: boolean
  submitCount: number
  errors: FieldErrors<TFieldValues>
  touchedFields: FieldNamesMarkedBoolean<TFieldValues>
  dirtyFields: FieldNamesMarkedBoolean<TFieldValues>
}

type FieldError = {
  type: string
  ref?: Ref
  types?: MultipleFieldErrors
  message?: string
}

type FieldErrors<
  TFieldValues extends FieldValues = FieldValues
> = DeepMap<TFieldValues, FieldError>

type DeepMap<T, TValue> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function
      ? TValue
      : T[K] extends readonly (infer U)[]
      ? U extends object
        ? DeepMap<U, TValue>[]
        : TValue
      : DeepMap<T[K], TValue>
    : TValue
}

type FieldNamesMarkedBoolean<TFieldValues extends FieldValues> = DeepMap<
  TFieldValues,
  true
>

type GetValue<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = TName extends keyof TFieldValues
  ? TFieldValues[TName]
  : TName extends `${infer TKey}.${infer TRest}`
  ? TKey extends keyof TFieldValues
    ? GetValue<TFieldValues[TKey], TRest>
    : undefined
  : undefined

type Ref =
  | React.Ref<any>
  | ((instance: any) => void)
  | React.MutableRefObject<any>

type RefCallBack = (instance: any) => void

function useFormField() {
  const fieldContext = React.useContext(FormField)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = ControllerProps<TFieldValues, TName>

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: FormFieldProps<TFieldValues, TName>) => {
  return (
    <Controller
      {...props}
      render={({ field, fieldState, formState }) => (
        <FormFieldRenderPropsContext.Provider
          value={{ field, fieldState, formState }}
        >
          {props.render({ field, fieldState, formState })}
        </FormFieldRenderPropsContext.Provider>
      )}
    />
  )
}

const FormFieldRenderPropsContext = React.createContext<FormFieldRenderProps>(
  {} as FormFieldRenderProps
)

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
