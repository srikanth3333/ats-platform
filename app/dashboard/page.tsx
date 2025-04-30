"use client";

import { MetricCard } from "@/components/dashboard/metric-card";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { RecruitmentFunnel } from "@/components/dashboard/recruitment-funnel";
import { UpcomingInterviews } from "@/components/dashboard/upcoming-interviews";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase"; // Adjust path to your Supabase client
import { isFuture } from "date-fns";
import {
  BriefcaseIcon,
  CalendarIcon,
  Clock3Icon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Interview {
  id: string;
  candidate_name: string;
  job_title: string;
  interviewer: string;
  duration: number;
  type: "phone" | "video" | "in-person";
  user_id: string;
  candidate_id: string;
  scheduled_at: string;
  created_at: string;
}

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  job_description: string;
  requirements: string;
  job_status: "publish" | "draft";
  created_at: string;
}

interface FunnelData {
  name: string;
  value: number;
  fill: string;
}

interface Activity {
  id: string;
  type:
    | "interview_scheduled"
    | "job_published"
    | "candidate_added"
    | "application_status_changed";
  message: string;
  user: { name: string; avatar: string };
  timestamp: Date;
}

interface InterviewSummary {
  id: string;
  candidateName: string;
  jobTitle: string;
  date: Date;
  interviewers: string[];
}

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch interviews
        const { data: interviewData, error: interviewError } = await supabase
          .from("interview_schdule")
          .select("*")
          .eq("user_id", "5e281aee-9f16-4b7f-b5b9-6c4564d3b00c");
        if (interviewError)
          throw new Error(`Interviews: ${interviewError.message}`);

        // Fetch candidates
        const { data: candidateData, error: candidateError } = await supabase
          .from("candidates")
          .select("*");
        if (candidateError)
          throw new Error(`Candidates: ${candidateError.message}`);

        // Fetch jobs
        const { data: jobData, error: jobError } = await supabase
          .from("jobs")
          .select("*")
          .eq("user_id", "5e281aee-9f16-4b7f-b5b9-6c4564d3b00c");
        if (jobError) throw new Error(`Jobs: ${jobError.message}`);

        // Map data
        const mappedInterviews = interviewData.map((item: any) => ({
          ...item,
          id: item.id.toString(),
          candidate_id: item.candidate_id.toString(),
        }));
        const mappedCandidates = candidateData.map((item: any) => ({
          ...item,
          id: item.id.toString(),
        }));
        const mappedJobs = jobData.map((item: any) => ({
          ...item,
          id: item.id.toString(),
        }));

        setInterviews(mappedInterviews);
        setCandidates(mappedCandidates);
        setJobs(mappedJobs);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data");
        // toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Derive dashboard data
  const activeJobs = jobs.filter((job) => job.job_status === "publish").length;
  const candidatesInPipeline = candidates.filter((c) =>
    ["interviewScheduled"].includes(c.status)
  ).length;
  const upcomingInterviews = interviews.filter((i) =>
    isFuture(new Date(i.scheduled_at))
  ).length;

  const funnelData: FunnelData[] = [
    {
      name: "Applications",
      value: candidates.length,
      fill: "hsl(var(--chart-1))",
    },
    {
      name: "Reviewed",
      value: candidates.filter((c) => c.status !== "applied").length,
      fill: "hsl(var(--chart-2))",
    },
    {
      name: "Interviews",
      value: candidates.filter((c) => c.status === "interviewScheduled").length,
      fill: "hsl(var(--chart-3))",
    },
    {
      name: "Offers",
      value: candidates.filter((c) => c.status === "offered").length,
      fill: "hsl(var(--chart-4))",
    },
    {
      name: "Hired",
      value: candidates.filter((c) => c.status === "hired").length,
      fill: "hsl(var(--chart-5))",
    },
  ];

  const activities: Activity[] = [
    ...interviews.map((i) => ({
      id: i.id,
      type: "interview_scheduled" as const,
      message: `Scheduled an interview with ${i.candidate_name} for ${i.job_title}`,
      user: { name: i.interviewer, avatar: "" },
      timestamp: new Date(i.created_at),
    })),
    ...jobs
      .filter((j) => j.job_status === "publish")
      .map((j) => ({
        id: j.id,
        type: "job_published" as const,
        message: `Published a new job: ${j.title}`,
        user: { name: "System", avatar: "" },
        timestamp: new Date(j.created_at),
      })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const interviewSummaries: InterviewSummary[] = interviews
    .filter((i) => isFuture(new Date(i.scheduled_at)))
    .map((i) => ({
      id: i.id,
      candidateName: i.candidate_name,
      jobTitle: i.job_title,
      date: new Date(i.scheduled_at),
      interviewers: [i.interviewer],
    }));

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Jobs"
            value={activeJobs}
            icon={BriefcaseIcon}
            trend={{ value: 0, isPositive: true }}
          />
          <MetricCard
            title="Candidates in Pipeline"
            value={candidatesInPipeline}
            icon={UsersIcon}
            trend={{ value: 0, isPositive: true }}
          />
          <MetricCard
            title="Upcoming Interviews"
            value={upcomingInterviews}
            icon={CalendarIcon}
            trend={{ value: 0, isPositive: true }}
          />
          <MetricCard
            title="Avg. Time to Fill"
            value="N/A"
            icon={Clock3Icon}
            trend={{ value: 0, isPositive: false }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <RecruitmentFunnel data={funnelData} />
          <div className="lg:col-span-1 space-y-4">
            <UpcomingInterviews interviews={interviewSummaries} />
            <RecentActivities activities={activities} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
