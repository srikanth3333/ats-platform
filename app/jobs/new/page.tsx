"use client";

import SubmitForm from "@/components/core/submit-form";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export type TableData<T> = T;
export interface CrudResponse<T> {
  data: T | null;
  success: boolean;
  error: PostgrestError | null;
}
const departments = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Customer Support",
  "Human Resources",
  "Finance",
  "Operations",
  "Legal",
  "Other",
];

export default function NewJobPage() {
  const router = useRouter();

  const getProfileInputs = () => [
    {
      type: "text" as "text",
      label: "Job Title",
      placeholder: "e.g. Senior Software Engineer",
      name: "title",
      required: true,
    },
    {
      type: "select" as "select",
      label: "Department",
      name: "department",
      placeholder: "Select department",
      required: false,
      options: departments.map((department) => ({
        label: department,
        value: department,
      })),
    },
    {
      type: "text" as "text",
      label: "Location",
      name: "location",
      placeholder: "e.g. Remote, New York, London",
      required: false,
    },
    {
      type: "text" as "text",
      label: "Job Description",
      name: "job_description",
      placeholder:
        "Describe the job role, responsibilities, and any other relevant information...",
      required: false,
    },
    {
      type: "textarea" as "textarea",
      label: "Requirements",
      name: "requirements",
      placeholder:
        "List the skills, qualifications, and experience required for this role...",
      required: false,
    },
    {
      type: "radio" as "radio",
      label: "Job Status",
      name: "job_status",
      required: false,
      options: [
        { label: "Save as Draft", value: "draft" },
        { label: "Publish Immediately", value: "publish" },
      ],
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

  const handleSubmit = async (
    values?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!values) {
      return { success: false, error: "No values provided" };
    }
    const formValues = {
      user_id: "5e281aee-9f16-4b7f-b5b9-6c4564d3b00c",
      title: values["Job Title"],
      department: values["Department"],
      location: values["Location"],
      job_description: values["Job Description"],
      requirements: values["Requirements"],
      job_status: values["Job Status"],
    };
    const result = await createRecord("jobs", formValues);
    if (result.success) {
      router.push("/jobs");
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
          <CardTitle>Create New Job</CardTitle>
        </CardHeader>
        <CardContent className="">
          <SubmitForm
            inputs={getProfileInputs()}
            btnTxt="Create Job"
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
