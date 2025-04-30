"use client";

import { InterviewCalendar } from "@/components/interviews/interview-calendar";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import {
  addDays,
  addMonths,
  format,
  isToday,
  isValid,
  subMonths,
} from "date-fns";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
}

interface Interview {
  id: string;
  candidate_id: string;
  candidate_name: string;
  job_title: string;
  interviewer: string;
  scheduled_at: string;
  duration: number;
  type: "phone" | "video" | "in-person";
  user_id: string;
}

export default function InterviewsPage() {
  const [selectedInterview, setSelectedInterview] = useState<string | null>(
    null
  );
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newInterview, setNewInterview] = useState({
    candidate_id: "",
    job_title: "",
    interviewer: "",
    scheduled_date: "",
    scheduled_time: "",
    duration: "60",
    type: "video" as "phone" | "video" | "in-person",
  });
  const [filterInterviewer, setFilterInterviewer] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const supabase = createClient();

  // Fetch candidates for dropdown
  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from("candidates")
        .select("id, first_name, last_name, email, status")
        .eq("user_id", "5e281aee-9f16-4b7f-b5b9-6c4564d3b00c");
      if (error)
        throw new Error(`Failed to fetch candidates: ${error.message}`);
      return data.map((candidate: any) => ({
        ...candidate,
        id: candidate.id.toString(),
      }));
    } catch (err: any) {
      console.error("Error fetching candidates:", err);
      toast.error("Failed to load candidates");
      setError("Failed to load candidates");
      return [];
    }
  };

  // Fetch interviews
  const fetchInterviews = async () => {
    try {
      let query = supabase
        .from("interview_schdule")
        .select("*")
        .eq("user_id", "5e281aee-9f16-4b7f-b5b9-6c4564d3b00c");

      if (filterInterviewer !== "all") {
        query = query.eq("interviewer", filterInterviewer);
      }
      if (filterType !== "all") {
        query = query.eq("type", filterType);
      }

      const { data, error } = await query;
      if (error)
        throw new Error(`Failed to fetch interviews: ${error.message}`);
      const mappedData = data.map((interview: any) => ({
        ...interview,
        id: interview.id.toString(),
        candidate_id: interview.candidate_id.toString(),
        scheduled_at: interview.scheduled_at,
      }));
      console.log("Fetched interviews:", mappedData); // Debug log
      return mappedData;
    } catch (err: any) {
      console.error("Error fetching interviews:", err);
      toast.error("Failed to load interviews");
      setError("Failed to load interviews");
      return [];
    }
  };

  // Initialize data
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        const [candidateData, interviewData] = await Promise.all([
          fetchCandidates(),
          fetchInterviews(),
        ]);
        setCandidates(candidateData);
        setInterviews(interviewData);
      } catch (err: any) {
        console.error("Initialization error:", err);
        setError("Failed to initialize data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [filterInterviewer, filterType]);

  // Handle interview click
  const handleInterviewClick = (interviewId: string) => {
    setSelectedInterview(interviewId);
  };

  // Handle month navigation
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Handle schedule interview form
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (
        !newInterview.candidate_id ||
        !newInterview.job_title ||
        !newInterview.interviewer ||
        !newInterview.scheduled_date ||
        !newInterview.scheduled_time
      ) {
        throw new Error("Please fill all required fields");
      }

      const candidate = candidates.find(
        (c) => c.id === newInterview.candidate_id
      );
      if (!candidate) {
        throw new Error("Invalid candidate selected");
      }

      const scheduledAt = new Date(
        `${newInterview.scheduled_date}T${newInterview.scheduled_time}:00Z`
      );
      if (!isValid(scheduledAt)) {
        throw new Error("Invalid date or time");
      }

      const interviewData = {
        candidate_id: newInterview.candidate_id,
        candidate_name: `${candidate.first_name} ${candidate.last_name}`,
        job_title: newInterview.job_title,
        interviewer: newInterview.interviewer,
        scheduled_at: scheduledAt.toISOString(),
        duration: parseInt(newInterview.duration),
        type: newInterview.type,
        user_id: "5e281aee-9f16-4b7f-b5b9-6c4564d3b00c",
      };

      const { data, error } = await supabase
        .from("interview_schdule")
        .insert([interviewData])
        .select();
      if (error)
        throw new Error(`Failed to schedule interview: ${error.message}`);

      const { error: statusError } = await supabase
        .from("candidates")
        .update({ status: "interviewScheduled" })
        .eq("id", newInterview.candidate_id);
      if (statusError) {
        console.error("Error updating candidate status:", statusError);
        toast.error("Failed to update candidate status");
      }

      setInterviews([
        ...interviews,
        {
          ...data[0],
          id: data[0].id.toString(),
          candidate_id: data[0].candidate_id.toString(),
        },
      ]);
      setIsScheduleModalOpen(false);
      setNewInterview({
        candidate_id: "",
        job_title: "",
        interviewer: "",
        scheduled_date: "",
        scheduled_time: "",
        duration: "60",
        type: "video",
      });
      toast.success("Interview scheduled successfully");
    } catch (err: any) {
      console.error("Error scheduling interview:", err);
      toast.error(err.message || "Failed to schedule interview");
    }
  };

  // Filter interviews for cards
  const todayInterviews = interviews.filter((interview) => {
    try {
      return isToday(new Date(interview.scheduled_at));
    } catch {
      console.warn(`Invalid scheduled_at for interview ${interview.id}`);
      return false;
    }
  });

  const upcomingInterviews = interviews.filter((interview) => {
    try {
      const interviewDate = new Date(interview.scheduled_at);
      return (
        interviewDate > new Date() && interviewDate <= addDays(new Date(), 7)
      );
    } catch {
      console.warn(`Invalid scheduled_at for interview ${interview.id}`);
      return false;
    }
  });

  const selectedInterviewData = interviews.find(
    (interview) => interview.id === selectedInterview
  );

  // Log calendar props for debugging
  const calendarInterviews = interviews
    .map((interview) => {
      try {
        return {
          id: interview.id,
          candidateName: interview.candidate_name || "Unknown",
          jobTitle: interview.job_title || "Unknown",
          interviewer: interview.interviewer || "Unknown",
          scheduledAt: new Date(interview.scheduled_at),
          duration: interview.duration || 60,
          type: interview.type || "video",
        };
      } catch (err) {
        console.warn(`Invalid interview data for ID ${interview.id}`, err);
        return null;
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <DashboardLayout>
      <div className="space-y-6 mb-5">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Interviews</h1>
          <Button onClick={() => setIsScheduleModalOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="font-medium">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1" />

          <Select
            value={filterInterviewer}
            onValueChange={setFilterInterviewer}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Interviewer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Interviewers</SelectItem>
              {Array.from(new Set(interviews.map((i) => i.interviewer)))
                .sort()
                .map((interviewer) => (
                  <SelectItem key={interviewer} value={interviewer}>
                    {interviewer}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="in-person">In-person</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Todays Interviews</CardTitle>
              <CardDescription>
                {format(new Date(), "MMMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayInterviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No interviews scheduled for today.
                </p>
              ) : (
                <div className="space-y-4">
                  {todayInterviews.map((interview) => (
                    <div key={interview.id} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {interview.candidate_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {interview.job_title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(interview.scheduled_at), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingInterviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No upcoming interviews in the next 7 days.
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingInterviews.map((interview) => (
                    <div key={interview.id} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {interview.candidate_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {interview.job_title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(
                            new Date(interview.scheduled_at),
                            "MMM d, yyyy"
                          )}{" "}
                          at{" "}
                          {format(new Date(interview.scheduled_at), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Feedback</CardTitle>
              <CardDescription>Interviews without feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No pending feedback.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-muted-foreground py-8">
          Loading interviews...
        </div>
      ) : error ? (
        <div className="text-center text-destructive py-8">
          {error}. Please try again later.
        </div>
      ) : interviews.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No interviews scheduled. Click Schedule Interview to add one.
        </div>
      ) : (
        <InterviewCalendar
          interviews={calendarInterviews}
          onInterviewClick={handleInterviewClick}
        />
      )}

      <Dialog
        open={!!selectedInterview}
        onOpenChange={(open) => !open && setSelectedInterview(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Interview Details</DialogTitle>
            <DialogDescription>
              {selectedInterviewData && (
                <>
                  {format(
                    new Date(selectedInterviewData.scheduled_at),
                    "MMMM d, yyyy"
                  )}{" "}
                  at{" "}
                  {format(
                    new Date(selectedInterviewData.scheduled_at),
                    "h:mm a"
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedInterviewData && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Candidate</h3>
                <p className="text-sm">
                  {selectedInterviewData.candidate_name || "Unknown"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Position</h3>
                <p className="text-sm">
                  {selectedInterviewData.job_title || "Unknown"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Interviewer</h3>
                <p className="text-sm">
                  {selectedInterviewData.interviewer || "Unknown"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Type</h3>
                <p className="text-sm capitalize">
                  {selectedInterviewData.type || "Unknown"} Interview
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Duration</h3>
                <p className="text-sm">
                  {selectedInterviewData.duration || 60} minutes
                </p>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedInterview(null)}
                >
                  Close
                </Button>
                <Button disabled>Add Feedback</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Enter details for the new interview.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="candidate">Candidate</Label>
              <Select
                value={newInterview.candidate_id}
                onValueChange={(value) =>
                  setNewInterview({ ...newInterview, candidate_id: value })
                }
              >
                <SelectTrigger id="candidate">
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-2">
                      No candidates available
                    </div>
                  ) : (
                    candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.first_name} {candidate.last_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={newInterview.job_title}
                onChange={(e) =>
                  setNewInterview({
                    ...newInterview,
                    job_title: e.target.value,
                  })
                }
                placeholder="e.g., Software Engineer"
                required
              />
            </div>
            <div>
              <Label htmlFor="interviewer">Interviewer</Label>
              <Input
                id="interviewer"
                value={newInterview.interviewer}
                onChange={(e) =>
                  setNewInterview({
                    ...newInterview,
                    interviewer: e.target.value,
                  })
                }
                placeholder="e.g., John Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="scheduled_date">Date</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={newInterview.scheduled_date}
                onChange={(e) =>
                  setNewInterview({
                    ...newInterview,
                    scheduled_date: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="scheduled_time">Time</Label>
              <Input
                id="scheduled_time"
                type="time"
                value={newInterview.scheduled_time}
                onChange={(e) =>
                  setNewInterview({
                    ...newInterview,
                    scheduled_time: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select
                value={newInterview.duration}
                onValueChange={(value) =>
                  setNewInterview({ ...newInterview, duration: value })
                }
              >
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={newInterview.type}
                onValueChange={(value) =>
                  setNewInterview({
                    ...newInterview,
                    type: value as "phone" | "video" | "in-person",
                  })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="in-person">In-person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsScheduleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Schedule</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
