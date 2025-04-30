"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Camera,
  FileIcon,
  Loader2,
  Mic,
  Upload,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Define input types with stricter constraints
interface InputBase {
  label: string;
  name: string;
  required?: boolean;
  errorMsg?: string;
  disabled?: boolean;
  placeholder?: string;
}

interface InputWithOptions extends InputBase {
  type: "select" | "radio";
  options: { value: string; label: string }[];
  defaultValue?: string;
}

interface InputWithoutOptions extends InputBase {
  type:
    | "text"
    | "textarea"
    | "number"
    | "date"
    | "checkbox"
    | "password"
    | "upload"
    | "switch"
    | "mediaPermission";
  options?: never;
  defaultValue?: any;
  helperText?: string | React.ReactNode;
  // For mediaPermission type
  permissionType?: "camera" | "microphone";
}

export type InputType = InputWithOptions | InputWithoutOptions;

interface SubmitFormProps {
  inputs: InputType[];
  btnTxt?: string;
  pageLink?: string;
  initialValues?: Record<string, any>;
  onSubmit: (
    values?: Record<string, any>
  ) => Promise<{ success: boolean; error?: string }>;
  btnsList?: { cancelAction: () => void; label: string }[];
}

const createFormSchema = (inputs: InputType[]) => {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  inputs.forEach((input) => {
    let fieldSchema: z.ZodTypeAny;

    switch (input.type) {
      case "text":
        if (input.label.toLowerCase() === "email") {
          let emailSchema = z
            .string()
            .email({
              message: input.errorMsg || "Please enter a valid email address",
            })
            .max(100, {
              message: `${input.label} must be less than 100 characters`,
            })
            .trim();

          fieldSchema = input.required
            ? emailSchema
            : z.union([z.literal(""), emailSchema]).optional();
        } else {
          let textSchema = z
            .string()
            .max(100, {
              message: `${input.label} must be less than 100 characters`,
            })
            .trim();

          if (input.required) {
            textSchema = textSchema.min(1, {
              message: input.errorMsg || `${input.label} cannot be empty`,
            });
            fieldSchema = textSchema;
          } else {
            fieldSchema = z.union([z.literal(""), textSchema]).optional();
          }
        }
        break;
      case "textarea":
        let textareaSchema = z
          .string()
          .max(500, {
            message: `${input.label} must be less than 500 characters`,
          })
          .trim();

        if (input.required) {
          textareaSchema = textareaSchema.min(1, {
            message: input.errorMsg || `${input.label} cannot be empty`,
          });
          fieldSchema = textareaSchema;
        } else {
          fieldSchema = z.union([z.literal(""), textareaSchema]).optional();
        }
        break;
      case "password":
        if (input.required) {
          fieldSchema = z
            .string()
            .min(8, {
              message:
                input.errorMsg || "Password must be at least 8 characters",
            })
            .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
              message:
                "Password must contain at least one letter and one number",
            });
        } else {
          fieldSchema = z
            .union([
              z.literal(""),
              z
                .string()
                .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
                  message:
                    "If provided, password must be at least 8 characters with one letter and one number",
                }),
            ])
            .optional();
        }
        break;
      case "number":
        if (input.required) {
          fieldSchema = z
            .number()
            .min(0, { message: `${input.label} must be positive` })
            .max(1000000, { message: `${input.label} is too large` });
        } else {
          fieldSchema = z.number().optional();
        }
        break;
      case "date":
        if (input.required) {
          fieldSchema = z.date({
            required_error: input.errorMsg || `${input.label} is required`,
            invalid_type_error: "Please select a valid date",
          });
        } else {
          fieldSchema = z.date().optional();
        }
        break;
      case "select":
      case "radio":
        if (input.required) {
          fieldSchema = z
            .string()
            .refine((val) => val !== undefined && val !== "", {
              message: input.errorMsg || `${input.label} must be selected`,
            });
        } else {
          fieldSchema = z.string().optional();
        }
        break;
      case "checkbox":
        fieldSchema = z.boolean().optional();
        break;
      case "switch":
      case "mediaPermission":
        if (input.required) {
          fieldSchema = z.boolean().refine((val) => val !== undefined, {
            message: input.errorMsg || `${input.label} state must be defined`,
          });
        } else {
          fieldSchema = z.boolean().optional();
        }
        break;
      case "upload":
        if (input.required) {
          fieldSchema = z
            .instanceof(File)
            .refine(
              (file) => file && file.size > 0,
              input.errorMsg || "Please upload a file"
            )
            .refine(
              (file) => file.size <= 5 * 1024 * 1024, // 5MB limit
              "File size must be less than 5MB"
            )
            .refine(
              (file) => file.type === "application/pdf",
              "Only PDF files are allowed"
            );
        } else {
          fieldSchema = z
            .instanceof(File)
            .optional()
            .nullable()
            .refine(
              (file) => !file || file.size <= 5 * 1024 * 1024,
              "File size must be less than 5MB"
            )
            .refine(
              (file) => !file || file.type === "application/pdf",
              "Only PDF files are allowed"
            );
        }
        break;
    }

    schemaShape[input.label] = fieldSchema;
  });

  return z.object(schemaShape);
};

const generateDefaultValues = (
  inputs: InputType[],
  initialValues?: Record<string, any>
): Record<string, any> => {
  const defaults: Record<string, any> = {};

  inputs.forEach((input) => {
    const initialValue = initialValues?.[input.label];
    switch (input.type) {
      case "text":
      case "textarea":
      case "password":
        defaults[input.label] = initialValue ?? input.defaultValue ?? "";
        break;
      case "select":
      case "radio":
        defaults[input.label] =
          initialValue ?? input.defaultValue ?? input.options?.[0]?.value ?? "";
        break;
      case "number":
        defaults[input.label] = initialValue ?? input.defaultValue ?? 0;
        break;
      case "date":
        defaults[input.label] = initialValue ?? input.defaultValue ?? undefined;
        break;
      case "checkbox":
      case "switch":
      case "mediaPermission":
        defaults[input.label] = initialValue ?? input.defaultValue ?? false;
        break;
      case "upload":
        defaults[input.label] = initialValue ?? undefined;
        break;
    }
  });

  return defaults;
};

const SubmitForm: React.FC<SubmitFormProps> = ({
  inputs,
  btnTxt,
  initialValues,
  onSubmit,
  btnsList,
}) => {
  const formSchema = createFormSchema(inputs);
  const defaultValues = generateDefaultValues(inputs, initialValues);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [mediaStreams, setMediaStreams] = useState<
    Record<string, MediaStream | null>
  >({});
  const [permissionErrors, setPermissionErrors] = useState<
    Record<string, string>
  >({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Handle file preview
  const handleFilePreview = useCallback(
    (file: File | null, fieldName: string) => {
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviews((prev) => ({
            ...prev,
            [fieldName]: reader.result as string,
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setPreviews((prev) => {
          const newPreviews = { ...prev };
          delete newPreviews[fieldName];
          return newPreviews;
        });
      }
    },
    []
  );

  // Handle media permissions
  const requestMediaPermission = useCallback(
    async (type: "camera" | "microphone", fieldName: string) => {
      try {
        let stream: MediaStream;
        if (type === "camera") {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
        }
        setMediaStreams((prev) => ({ ...prev, [fieldName]: stream }));
        setPermissionErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
        form.setValue(fieldName, true);
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "Permission denied or device not available";
        setPermissionErrors((prev) => ({
          ...prev,
          [fieldName]: errorMsg,
        }));
        form.setValue(fieldName, false);
      }
    },
    [form]
  );

  // Clean up media streams
  useEffect(() => {
    return () => {
      Object.values(mediaStreams).forEach((stream) => {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      });
    };
  }, [mediaStreams]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const result = await onSubmit(values);
      if (result.success) {
        form.reset();
        setPreviews({});
        setMediaStreams({});
        setPermissionErrors({});
      } else {
        toast.error(result.error);
        form.setError("root", {
          message: result.error || "Submission error occurred",
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      form.setError("root", { message: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {inputs.map((input, index) => (
          <FormField
            key={index}
            control={form.control}
            name={input.label}
            render={({ field }) => (
              <FormItem className="">
                <FormLabel className="w-full text-right capitalize">
                  {input.label}
                  {!input.required && (
                    <span className="text-sm text-muted-foreground ml-1">
                      (optional)
                    </span>
                  )}
                </FormLabel>

                <div className="flex-1 space-y-2">
                  <FormControl>
                    {input.type === "text" ? (
                      <div key={index}>
                        <Input
                          placeholder={input.placeholder}
                          disabled={input.disabled}
                          {...field}
                          value={(field.value as string) ?? ""}
                        />
                        {input.helperText ? input.helperText : null}
                      </div>
                    ) : input.type === "textarea" ? (
                      <Textarea
                        disabled={input.disabled}
                        placeholder={input.placeholder}
                        {...field}
                        value={(field.value as string) ?? ""}
                      />
                    ) : input.type === "number" ? (
                      <Input
                        type="number"
                        placeholder={input.placeholder}
                        disabled={input.disabled}
                        {...field}
                        value={(field.value as number) ?? 0}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : 0
                          )
                        }
                      />
                    ) : input.type === "date" ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(field.value as Date, "PPP")
                                : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value as Date}
                            onSelect={field.onChange}
                            disabled={input.disabled}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : input.type === "select" ? (
                      <Select
                        disabled={input.disabled}
                        onValueChange={field.onChange}
                        value={field.value as string}
                        defaultValue={input.defaultValue}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder={input.placeholder} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {input.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : input.type === "checkbox" ? (
                      <Checkbox
                        placeholder={input.placeholder}
                        checked={(field.value as boolean) ?? false}
                        onCheckedChange={field.onChange}
                        disabled={input.disabled}
                      />
                    ) : input.type === "radio" ? (
                      <RadioGroup
                        placeholder={input.placeholder}
                        onValueChange={field.onChange}
                        value={(field.value as string) ?? ""}
                        disabled={input.disabled}
                        className="flex flex-col space-y-1"
                      >
                        {input.options?.map((option) => (
                          <FormItem
                            key={option.value}
                            className="flex items-center space-x-2 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem
                                value={option.value}
                                id={option.value}
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor={option.value}
                              className="font-normal"
                            >
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    ) : input.type === "password" ? (
                      <Input
                        type="password"
                        disabled={input.disabled}
                        {...field}
                        value={(field.value as string) ?? ""}
                      />
                    ) : input.type === "upload" ? (
                      <div
                        className={cn(
                          "border-2 border-dashed rounded-md p-4",
                          field.value ? "border-primary" : "border-muted"
                        )}
                      >
                        <FormControl>
                          <Dropzone
                            input={input}
                            field={field}
                            handleFilePreview={handleFilePreview}
                          />
                        </FormControl>
                        {field.value && (
                          <div className="mt-2 relative">
                            <div className="flex items-center space-x-2">
                              <FileIcon className="h-6 w-6" />
                              <span>{(field.value as File).name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              className="absolute top-0 right-0"
                              onClick={() => {
                                field.onChange(undefined);
                                form.setValue(input.label, undefined); // Ensure form value is cleared
                                handleFilePreview(null, input.label);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {input.helperText ? input.helperText : null}
                      </div>
                    ) : input.type === "switch" ? (
                      <Switch
                        checked={(field.value as boolean) ?? false}
                        onCheckedChange={field.onChange}
                        disabled={input.disabled}
                      />
                    ) : input.type === "mediaPermission" ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {input.permissionType === "camera" ? (
                            <Camera className="h-4 w-4" />
                          ) : (
                            <Mic className="h-4 w-4" />
                          )}
                          <Switch
                            checked={(field.value as boolean) ?? false}
                            onCheckedChange={(checked) => {
                              if (checked && !mediaStreams[input.label]) {
                                requestMediaPermission(
                                  input.permissionType!,
                                  input.label
                                );
                              } else if (
                                !checked &&
                                mediaStreams[input.label]
                              ) {
                                mediaStreams[input.label]
                                  ?.getTracks()
                                  .forEach((track) => track.stop());
                                setMediaStreams((prev) => ({
                                  ...prev,
                                  [input.label]: null,
                                }));
                                field.onChange(false);
                              }
                            }}
                            disabled={input.disabled}
                          />
                          <Button
                            variant="outline"
                            type="button"
                            size="sm"
                            onClick={() =>
                              requestMediaPermission(
                                input.permissionType!,
                                input.label
                              )
                            }
                          >
                            Request Permission
                          </Button>
                        </div>
                        {permissionErrors[input.label] && (
                          <p className="text-sm text-red-500">
                            {permissionErrors[input.label]}
                          </p>
                        )}
                        {mediaStreams[input.label] &&
                          input.permissionType === "camera" && (
                            <video
                              autoPlay
                              ref={(video) => {
                                if (video && mediaStreams[input.label]) {
                                  video.srcObject = mediaStreams[input.label];
                                }
                              }}
                              className="mt-2 max-w-full h-32 rounded"
                            />
                          )}
                      </div>
                    ) : null}
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        ))}
        {form.formState.errors.root && (
          <div className="text-red-500 text-sm text-center">
            {form.formState.errors.root.message}
          </div>
        )}
        <div
          className={`${btnsList?.length ? "flex justify-end gap-4" : "w-64"}`}
        >
          {btnsList?.map((btn) => (
            <Button
              key={btn.label}
              type="button"
              variant={"outline"}
              className={`rounded ${btnsList?.length ? "w-32" : "w-full"}`}
              onClick={() => btn.cancelAction()}
            >
              {btn.label}
            </Button>
          ))}
          <Button
            type="submit"
            disabled={isLoading}
            className={`rounded ${btnsList?.length ? "w-32" : "w-full"}`}
          >
            {isLoading && <Loader2 className="animate-spin" />}
            {isLoading ? "Loading..." : btnTxt}
          </Button>
        </div>
      </form>
    </Form>
  );
};

interface DropzoneProps {
  input: InputType;
  field: any;
  handleFilePreview: (file: File | null, fieldName: string) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({
  input,
  field,
  handleFilePreview,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        field.onChange(file);
        handleFilePreview(file, input.label);
      }
    },
    [field, handleFilePreview, input.label]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: input.disabled,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-md transition-colors",
        isDragActive
          ? "bg-primary/10 border-primary"
          : "bg-background border-muted",
        input.disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <Upload className="h-6 w-6 mb-2" />
      <p className="text-sm text-center">
        {isDragActive
          ? "Drop the PDF file here"
          : "Drag & drop a PDF file here, or click to select"}
      </p>
      {field.value && (
        <span className="text-sm text-gray-500 mt-2">
          {(field.value as File).name}
        </span>
      )}
    </div>
  );
};

export default SubmitForm;
