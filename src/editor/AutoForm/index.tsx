import React from "react";
import { JSONSchemaType } from "ajv";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useForm, UseFormReturn } from "react-hook-form";
import { ajvResolver } from "@hookform/resolvers/ajv";
import { format as dateFormat } from "date-fns";
import { getDefaultValue } from "./defaults";
import { ImageInput } from "../ImageInput";
import { VideoInput } from "../VideoInput";
import { AssetInput } from "./AssetInput";
import { DurationInput } from "./DurationInput";
import { ArrayInput } from "./ArrayInput";
import { ReferenceInput } from "./ReferenceInput";
import { ajvFormats } from "../../validate";
import { MarkdownEditor, RichTextEditor } from "../RichTextEditor";
import {
  isAssetJsonSchema,
  isImageJsonSchema,
  isMarkdownJsonSchema,
  isRichTextJsonSchema,
  isVideoJsonSchema,
} from "../../schemas";
import { Undo, X } from "lucide-react";

function ClearButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="sm" onClick={onClick}>
      <X className="h-4 w-4" />
    </Button>
  );
}

// function ResetButton({ onClick }: { onClick: () => void }) {
//   return (
//     <Button type="button" variant="ghost" size="sm" onClick={onClick}>
//       <Undo className="h-4 w-4" />
//     </Button>
//   );
// }

function FormFieldHeader({
  children,
  form,
  resetValue,
  fieldKey,
}: {
  children: React.ReactNode;
  form: UseFormReturn<any, any, undefined>;
  resetValue: any,
  fieldKey: string;
}) {
  return (
    <div className="flex flex-row items-center gap-2 justify-between">
      <FormLabel className="text-lg font-semibold">{children}</FormLabel>
      <div className="flex flex-row items-center gap-2">
        {/* {form.getFieldState(fieldKey).isDirty && (
          <ResetButton
            onClick={() => {
              form.resetField(fieldKey);
            }}
          />
        )} */}
        <ClearButton
          onClick={() => {
            form.setValue(fieldKey, resetValue);
          }}
        />
      </div>
    </div>
  );
}

const FieldEdit = ({
  fieldKey,
  form,
  fieldSchema,
  allCollections,
  title: titleString,
}: {
  fieldKey: string;
  form: UseFormReturn<any, any, undefined>;
  fieldSchema: JSONSchemaType<any>;
  allCollections?: Record<
    string,
    { schema: JSONSchemaType<any>; name: string }
  >;
  title?: string
}) => {
  const parts = fieldKey.split(".");
  const lastPart = parts[parts.length - 1];
  const title = (
    <div className="flex flex-row items-center gap-2">
      <span className="text-lg font-semibold">
        {titleString ?? capitalizeFirstLetter(lastPart)}
      </span>
    </div>
  );

  const commonProps = {
    control: form.control,
    name: fieldKey,
  };

  if (isImageJsonSchema(fieldSchema)) {
    return (
      <FormField
        key={fieldKey}
        {...commonProps}
        render={({ field }) => (
          <FormItem className="pb-2 space-y-2">
            <FormFieldHeader form={form} fieldKey={fieldKey} resetValue={null}>
              {title}
            </FormFieldHeader>
            <FormControl>
              <ImageInput
                value={field.value || { url: "", alt: "" }}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (isVideoJsonSchema(fieldSchema)) {
    return (
      <FormField
        key={fieldKey}
        {...commonProps}
        render={({ field }) => (
          <FormItem className="pb-2 space-y-2">
            <FormFieldHeader form={form} fieldKey={fieldKey} resetValue={null}>
              {title}
            </FormFieldHeader>
            <FormControl>
              <VideoInput
                value={field.value || { url: "", alt: "" }}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (isAssetJsonSchema(fieldSchema)) {
    return (
      <FormField
        key={fieldKey}
        {...commonProps}
        render={({ field }) => (
          <FormItem className="pb-2 space-y-2">
            <FormFieldHeader form={form} fieldKey={fieldKey} resetValue={null}>
              {title}
            </FormFieldHeader>
            <FormControl>
              <AssetInput
                value={field.value || { url: "" }}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (isMarkdownJsonSchema(fieldSchema)) {
    return (
      <FormField
        key={fieldKey}
        {...commonProps}
        render={({ field }) => (
          <FormItem className="pb-2 space-y-2">
            <FormLabel className="text-lg font-semibold">{title}</FormLabel>
            <FormControl>
              <MarkdownEditor
                value={field.value?.markdown}
                onChange={(value) => field.onChange({ markdown: value })}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (isRichTextJsonSchema(fieldSchema)) {
    return (
      <FormField
        key={fieldKey}
        {...commonProps}
        render={({ field }) => (
          <FormItem className="pb-2 space-y-2">
            <FormLabel className="text-lg font-semibold">{title}</FormLabel>
            <FormControl>
              <RichTextEditor
                value={field.value?.richText}
                onChange={(value) => field.onChange({ richText: value })}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (fieldSchema.$ref?.startsWith("#/definitions/")) {
    const collectionReference = Object.keys(allCollections ?? {}).find(
      (key) => fieldSchema.$ref === `#/definitions/${key}`
    );

    if (collectionReference) {
      return (
        <FormField
          key={fieldKey}
          {...commonProps}
          render={({ field }) => (
            <FormItem className="pb-2 space-y-2">
              <FormFieldHeader
                form={form}
                fieldKey={fieldKey}
                resetValue={null}
              >
                {title}
              </FormFieldHeader>
              <FormControl>
                <ReferenceInput
                  value={
                    field.value || { id: "", collection: collectionReference }
                  }
                  onChange={field.onChange}
                  collectionName={collectionReference}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
  }

  if (fieldSchema.type === "string") {
    const format = fieldSchema.format;

    if (fieldSchema.enum) {
      return (
        <FormField
          key={fieldKey}
          {...commonProps}
          render={({ field }) => (
            <FormItem className="pb-2 space-y-2">
              <FormFieldHeader form={form} fieldKey={fieldKey} resetValue={""}>
                {title}
              </FormFieldHeader>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Select ${parts[
                        parts.length - 1
                      ].toLowerCase()}`}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fieldSchema.enum.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (format === "email") {
      return (
        <FormField
          key={fieldKey}
          {...commonProps}
          render={({ field }) => (
            <FormItem className="pb-2 space-y-2">
              <FormFieldHeader form={form} fieldKey={fieldKey} resetValue={""}>
                {title}
              </FormFieldHeader>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (format === "uri") {
      return (
        <FormField
          key={fieldKey}
          {...commonProps}
          render={({ field }) => (
            <FormItem className="pb-2 space-y-2">
              <FormFieldHeader form={form} fieldKey={fieldKey} resetValue={""}>
                {title}
              </FormFieldHeader>
              <FormControl>
                <Input type="url" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (format === "uuid") {
      return (
        <FormField
          key={fieldKey}
          {...commonProps}
          render={({ field }) => (
            <FormItem className="pb-2 space-y-2">
              <FormLabel className="text-lh font-semibold">{title}</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input type="text" {...field} readOnly className="bg-muted" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => field.onChange(crypto.randomUUID())}
                  >
                    Generate
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (format === "date-time") {
      return (
        <FormField
          key={fieldKey}
          {...commonProps}
          render={({ field }) => (
            <FormItem className="pb-2 space-y-2">
              <FormLabel className="text-lh font-semibold">{title}</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={
                    field.value
                      ? dateFormat(new Date(field.value), "yyyy-MM-dd")
                      : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : null;
                    field.onChange(date?.toISOString());
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (format === "duration") {
      return (
        <FormField
          key={fieldKey}
          {...commonProps}
          render={({ field }) => (
            <FormItem className="pb-2 space-y-2">
              <FormLabel className="text-lh font-semibold">{title}</FormLabel>
              <FormControl>
                <DurationInput
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (fieldSchema.maxLength && fieldSchema.maxLength > 100) {
      return (
        <FormField
          key={fieldKey}
          {...commonProps}
          render={({ field }) => (
            <FormItem className="pb-2 space-y-2">
              <FormFieldHeader form={form} fieldKey={fieldKey} resetValue={""}>
                {title}
              </FormFieldHeader>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    return (
      <FormField
        key={fieldKey}
        {...commonProps}
        render={({ field }) => (
          <FormItem className="pb-2 space-y-2">
            <FormFieldHeader form={form} fieldKey={fieldKey} resetValue={""}>
              {title}
            </FormFieldHeader>
            <FormControl>
              <Input
                type="text"
                {...field}
                onChange={(e) =>
                  field.onChange(
                    e.target.value.length === 0 ? undefined : e.target.value
                  )
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (fieldSchema.type === "number" || fieldSchema.type === "integer") {
    return (
      <FormField
        key={fieldKey}
        {...commonProps}
        render={({ field }) => (
          <FormItem className="pb-2 space-y-2">
            <FormLabel className="text-lh font-semibold">{title}</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (fieldSchema.type === "boolean") {
    return (
      <FormField
        key={fieldKey}
        {...commonProps}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 pb-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormFieldHeader form={form} fieldKey={fieldKey} resetValue={null}>
              {title}
            </FormFieldHeader>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (fieldSchema.type === "array") {
    const isPrimitiveArray =
      fieldSchema.items.type === "string" ||
      fieldSchema.items.type === "number" ||
      fieldSchema.items.type === "boolean";

    return (
      <FormField
        key={fieldKey}
        {...commonProps}
        render={({ field }) => (
          <FormItem className="pb-2 space-y-2">
            <FormFieldHeader form={form} fieldKey={fieldKey} resetValue={null}>
              {title}
            </FormFieldHeader>
            <FormControl>
              <div className="pl-4">
                <ArrayInput
                  value={form.watch(fieldKey) || []}
                  onChange={field.onChange}
                  minItems={fieldSchema.minItems}
                  maxItems={fieldSchema.maxItems}
                  defaultValue={
                    fieldSchema.items.type === "string"
                      ? ""
                      : fieldSchema.items.type === "number"
                      ? 0
                      : fieldSchema.items.type === "boolean"
                      ? false
                      : fieldSchema.items.type === "object"
                      ? {}
                      : fieldSchema.items.type === "array"
                      ? []
                      : ""
                  }
                  renderItem={(value, onChange, index) =>
                    isPrimitiveArray ? (
                      <div className="flex flex-row items-center gap-4">
                        {index + 1}
                        <Input
                          type={
                            fieldSchema.items.type === "number"
                              ? "number"
                              : "text"
                          }
                          value={value || ""}
                          onChange={(e) => {
                            let newValue:
                              | string
                              | number
                              | boolean
                              | undefined = e.target.value;
                            if (fieldSchema.items.type === "number") {
                              newValue = e.target.value
                                ? Number(e.target.value)
                                : undefined;
                            } else if (fieldSchema.items.type === "boolean") {
                              newValue = e.target.value === "true";
                            }
                            onChange(newValue);
                          }}
                        />
                      </div>
                    ) : (
                      <FieldEdit
                        title={`Element ${index + 1}`}
                        fieldKey={`${fieldKey}.${index}`}
                        form={form}
                        fieldSchema={fieldSchema.items}
                        allCollections={allCollections}
                      />
                    )
                  }
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (fieldSchema.type === "object") {
    return (
      <div key={fieldKey} className="space-y-4">
        <FormFieldHeader form={form} fieldKey={fieldKey} resetValue={null}>
          {title}
        </FormFieldHeader>
        <div className="grid gapb-2">
          {Object.entries(fieldSchema.properties || {}).map(
            ([propertyKey, schema]) => (
              <FieldEdit
                key={`${fieldKey}.${propertyKey}`}
                fieldKey={`${fieldKey}.${propertyKey}`}
                form={form}
                fieldSchema={schema as JSONSchemaType<any>}
                allCollections={allCollections}
              />
            )
          )}
        </div>
      </div>
    );
  }

  return null;
};

interface AutoFormProps {
  schema: JSONSchemaType<any>;
  allCollections?: Record<
    string,
    { schema: JSONSchemaType<any>; name: string }
  >;
  onSubmit: (data: any) => void;
  defaultValues?: any;
  withSubmit?: boolean;
  children?: React.ReactNode;
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const AutoForm: React.FC<AutoFormProps> = ({
  schema,
  onSubmit,
  allCollections,
  defaultValues,
  withSubmit = true,
  children,
}) => {
  const form = useForm({
    resolver: ajvResolver(schema, {
      formats: ajvFormats(Object.keys(allCollections ?? {})),
    }),
    values: defaultValues ?? getDefaultValue(schema),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log(errors);
          console.log(form.getValues());
        })}
        className="space-y-6"
      >
        <div className="space-y-2">
          {Object.entries(schema.properties || {}).map(([key, fieldSchema]) => (
            <div key={key} className="pb-8 last:pb-0">
              <FieldEdit
                fieldKey={key}
                form={form}
                fieldSchema={fieldSchema as JSONSchemaType<any>}
                allCollections={allCollections}
              />
            </div>
          ))}
        </div>
        {withSubmit && (
          <div className="pt-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
        {children}
      </form>
    </Form>
  );
};

export default AutoForm;
