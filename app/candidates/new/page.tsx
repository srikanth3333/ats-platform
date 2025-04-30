"use client";

import { CrudResponse, TableData } from "@/app/jobs/new/page";
import SubmitForm from "@/components/core/submit-form";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const sources = [
  "LinkedIn",
  "Job Board",
  "Referral",
  "Company Website",
  "Recruitment Agency",
  "University",
  "Job Fair",
  "Other",
];

export default function NewCandidatePage() {
  const router = useRouter();

  const getProfileInputs = () => [
    {
      type: "text" as "text",
      label: "First Name",
      placeholder: "first name",
      name: "title",
      required: true,
    },
    {
      type: "text" as "text",
      label: "Last Name",
      name: "job_description",
      placeholder: "Last name",
      required: false,
    },
    {
      type: "text" as "text",
      label: "Email",
      name: "location",
      placeholder: "email address",
      required: false,
    },
    {
      type: "text" as "text",
      label: "Phone",
      name: "location",
      placeholder: "Mobile number",
      required: false,
    },

    {
      type: "select" as "select",
      label: "Source",
      name: "department",
      placeholder: "Select source",
      required: false,
      options: sources.map((source) => ({
        label: source,
        value: source,
      })),
    },
    {
      type: "upload" as "upload",
      label: "Upload Resume",
      name: "requirements",
      required: true,
    },
  ];

  async function createRecord<T extends object>(
    tableName: string,
    data: TableData<T>
  ): Promise<CrudResponse<T>> {
    try {
      const supabase = await createClient();

      const { data: createdData, error } = await supabase
        .from(tableName)
        .insert(data)
        .select("*")
        .single();

      return {
        data: (createdData as T) || null,
        success: true,
        error,
      };
    } catch (error) {
      console.error(`Error creating record in ${tableName}:`, error);
      return {
        data: null,
        success: false,
        error: error as PostgrestError,
      };
    }
  }

  async function uploadResume(file: File) {
    try {
      if (!file) {
        return { error: "No file provided" };
      }

      if (file.type !== "application/pdf") {
        return { error: "Only PDF files are allowed" };
      }

      const supabase = await createClient();
      const fileName = `resume-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, file, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        return { error: uploadError.message };
      }

      const { data } = supabase.storage.from("resumes").getPublicUrl(fileName);

      return { data: { url: data.publicUrl }, error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  const uploadFile = async (document: File) => {
    const result = await uploadResume(document);
    return result;
  };

  const handleSubmit = async (
    values?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!values) {
      return { success: false, error: "No values provided" };
    }

    let uploadResult: any = null;
    if (values["Upload Resume"]) {
      uploadResult = await uploadFile(values["Upload Resume"]);
    }

    const formValues = {
      user_id: "5e281aee-9f16-4b7f-b5b9-6c4564d3b00c",
      first_name: values["First Name"],
      last_name: values["Last Name"],
      email: values["Email"],
      phone: values["Phone"],
      source: values["Source"],
      resume_url: uploadResult?.data?.url || null,
    };
    const result = await createRecord("candidates", formValues);
    if (result.success) {
      router.push("/candidates");
    }
    return {
      success: result.success,
      error: result.error ? result.error.message : undefined,
    };
  };
  return (
    <DashboardLayout>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Add Candidate</CardTitle>
        </CardHeader>
        <CardContent className="">
          <SubmitForm
            inputs={getProfileInputs()}
            btnTxt="Add Candidate"
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
