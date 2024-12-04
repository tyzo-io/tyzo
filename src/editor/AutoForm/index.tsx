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

const renderField = (
  key: string,
  form: UseFormReturn<any, any, undefined>,
  fieldSchema: JSONSchemaType<any>,
  allCollections?: Record<
    string,
    { schema: JSONSchemaType<any>; name: string }
  >,
) => {
  const title = capitalizeFirstLetter(key);

  const commonProps = {
    key,
    control: form.control,
    name: key,
  };

  if (isImageJsonSchema(fieldSchema)) {
    return (
      <FormField
        {...commonProps}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{title}</FormLabel>
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
        {...commonProps}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{title}</FormLabel>
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
        {...commonProps}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{title}</FormLabel>
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
        {...commonProps}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{title}</FormLabel>
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
        {...commonProps}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{title}</FormLabel>
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

  if (fieldSchema.format?.startsWith('#/ref/collections/')) {
    const collectionReference = Object.keys(allCollections ?? {}).find(
      (key) => fieldSchema.format === `#/ref/collections/${key}`
    );

    if (collectionReference) {
      return (
        <FormField
          {...commonProps}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{title}</FormLabel>
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
          {...commonProps}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{title}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Select ${title.toLowerCase()}`}
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
          {...commonProps}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{title}</FormLabel>
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
          {...commonProps}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{title}</FormLabel>
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
          {...commonProps}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{title}</FormLabel>
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
          {...commonProps}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{title}</FormLabel>
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
          {...commonProps}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{title}</FormLabel>
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
          {...commonProps}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{title}</FormLabel>
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
        {...commonProps}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{title}</FormLabel>
            <FormControl>
              <Input type="text" {...field} />
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
        {...commonProps}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{title}</FormLabel>
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
        {...commonProps}
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel>{title}</FormLabel>
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
        {...commonProps}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{title}</FormLabel>
            <FormControl>
              <ArrayInput
                value={field.value || []}
                onChange={field.onChange}
                minItems={fieldSchema.minItems}
                maxItems={fieldSchema.maxItems}
                renderItem={(value, onChange) =>
                  isPrimitiveArray ? (
                    <Input
                      type={
                        fieldSchema.items.type === "number" ? "number" : "text"
                      }
                      value={value || ""}
                      onChange={(e) => {
                        let newValue: string | number | boolean | undefined =
                          e.target.value;
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
                  ) : (
                    <AutoForm
                      schema={fieldSchema.items}
                      defaultValues={value}
                      onSubmit={onChange}
                      withSubmit={false}
                    />
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

  if (fieldSchema.type === "object") {
    return (
      <div key={key} className="space-y-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="grid gap-4">
          {Object.entries(fieldSchema.properties || {}).map(([key, schema]) =>
            renderField(
              key,
              form,
              schema as JSONSchemaType<any>,
              allCollections
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
    defaultValues: defaultValues || getDefaultValue(schema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {Object.entries(schema.properties || {}).map(([key, fieldSchema]) =>
          renderField(
            key,
            form,
            fieldSchema as JSONSchemaType<any>,
            allCollections
          )
        )}
        {withSubmit && (
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save"}
          </Button>
        )}
        {children}
      </form>
    </Form>
  );
};

export default AutoForm;
