"use client";

import { NewCertificationAction } from "@/app/actions/action/certificates/NewCertificateAction";
import { initialState } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { redirect } from "next/navigation";

const recipientSchema = z.object({
  email: z.string().email("Invalid email"),
  file: z
    .custom<File>((v) => v instanceof File, "File is required")
    .nullable()
    .refine((file) => !!file, "Certificate file is required"),
});

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  recipients: z
    .array(recipientSchema)
    .min(1, "At least one recipient is required"),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function NewCertificateForm() {
  const [state, action, actionPending] = useActionState(
    NewCertificationAction,
    initialState
  );
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      recipients: [{ email: "", file: null }],
    },
  });

  const { fields, append } = useFieldArray({
    control,
    name: "recipients",
  });

  const onSubmit = async (data: FormSchemaType) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("emails", data.recipients.map((r) => r.email).join(","));
    data.recipients.forEach((r) => {
      if (r.file) formData.append("files", r.file);
    });
    startTransition(async () => {
      await action(formData);
    });
  };
  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      redirect("/dashboard/issuer/");
    }
    if (!state.success && state.errorMessage) toast.error(state.errorMessage);
  }, [state]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 w-full max-w-5xl mx-auto border-2 px-2 py-2 rounded-md glass-container"
    >
      <div className="space-y-3 mt-5">
        <Label>Title</Label>
        <Input
          type="text"
          placeholder="Certificate title"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-red-600 text-sm">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <Label>Recipients</Label>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col sm:flex-row items-start gap-2"
          >
            <div className="w-full">
              <Input
                type="email"
                placeholder="Recipient Email"
                {...register(`recipients.${index}.email`)}
              />
              {errors.recipients?.[index]?.email && (
                <p className="text-red-600 text-sm">
                  {errors.recipients[index]?.email?.message}
                </p>
              )}
            </div>
            <div className="w-full">
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) =>
                  setValue(
                    `recipients.${index}.file`,
                    e.target.files?.[0] ?? null,
                    {
                      shouldValidate: true,
                    }
                  )
                }
              />
              {errors.recipients?.[index]?.file && (
                <p className="text-red-600 text-sm">
                  {errors.recipients[index]?.file?.message as string}
                </p>
              )}
            </div>
          </div>
        ))}
        <Button type="button" onClick={() => append({ email: "", file: null })}>
          + Add Recipient
        </Button>
      </div>

      <Button
        disabled={actionPending}
        type="submit"
        className=" w-full mx-auto cursor-pointer "
      >
        {isPending && <Loader2 size={20} className="size-5 animate-spin" />}
        <span> Submit Certificates</span>
      </Button>
    </form>
  );
}
