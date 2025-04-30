import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi, candidatesApi, applicationsApi, interviewsApi, dashboardApi } from '@/lib/api';
import { toast } from 'sonner';

// Jobs hooks
export function useJobs(params: Parameters<typeof jobsApi.list>[0]) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => jobsApi.list(params)
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.get(id)
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: jobsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job created successfully');
    },
    onError: () => toast.error('Failed to create job')
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof jobsApi.update>[1] }) =>
      jobsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated successfully');
    },
    onError: () => toast.error('Failed to update job')
  });
}

// Candidates hooks
export function useCandidates(params: Parameters<typeof candidatesApi.list>[0]) {
  return useQuery({
    queryKey: ['candidates', params],
    queryFn: () => candidatesApi.list(params)
  });
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: ['candidates', id],
    queryFn: () => candidatesApi.get(id)
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: candidatesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate created successfully');
    },
    onError: () => toast.error('Failed to create candidate')
  });
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof candidatesApi.update>[1] }) =>
      candidatesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate updated successfully');
    },
    onError: () => toast.error('Failed to update candidate')
  });
}

// Applications hooks
export function useApplications(params: Parameters<typeof applicationsApi.list>[0]) {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: () => applicationsApi.list(params)
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applicationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application created successfully');
    },
    onError: () => toast.error('Failed to create application')
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Parameters<typeof applicationsApi.updateStatus>[1] }) =>
      applicationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application status updated');
    },
    onError: () => toast.error('Failed to update application status')
  });
}

// Interviews hooks
export function useInterviews(params: Parameters<typeof interviewsApi.list>[0]) {
  return useQuery({
    queryKey: ['interviews', params],
    queryFn: () => interviewsApi.list(params)
  });
}

export function useScheduleInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: interviewsApi.schedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Interview scheduled successfully');
    },
    onError: () => toast.error('Failed to schedule interview')
  });
}

export function useSubmitInterviewFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, feedback }: { id: string; feedback: Parameters<typeof interviewsApi.submitFeedback>[1] }) =>
      interviewsApi.submitFeedback(id, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Feedback submitted successfully');
    },
    onError: () => toast.error('Failed to submit feedback')
  });
}

// Dashboard hooks
export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: dashboardApi.getMetrics
  });
}

export function useRecruitmentFunnel() {
  return useQuery({
    queryKey: ['dashboard', 'funnel'],
    queryFn: dashboardApi.getRecruitmentFunnel
  });
}