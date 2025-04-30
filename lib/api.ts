import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Jobs API
export const jobsApi = {
  async list(params: { page?: number; search?: string; status?: string; department?: string }) {
    const { page = 1, search, status, department } = params;
    const limit = 10;
    const start = (page - 1) * limit;

    let query = supabase.from('jobs').select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (department) {
      query = query.eq('department', department);
    }

    const { data, error, count } = await query
      .range(start, start + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, count };
  },

  async create(jobData: Database['public']['Tables']['jobs']['Insert']) {
    const { data, error } = await supabase.from('jobs').insert(jobData).select().single();
    if (error) throw error;
    return data;
  },

  async get(id: string) {
    const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async update(id: string, jobData: Partial<Database['public']['Tables']['jobs']['Update']>) {
    const { data, error } = await supabase.from('jobs').update(jobData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};

// Candidates API
export const candidatesApi = {
  async list(params: { page?: number; search?: string; status?: string; source?: string }) {
    const { page = 1, search, status, source } = params;
    const limit = 10;
    const start = (page - 1) * limit;

    let query = supabase.from('candidates').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (source) {
      query = query.eq('source', source);
    }

    const { data, error, count } = await query
      .range(start, start + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, count };
  },

  async create(candidateData: Database['public']['Tables']['candidates']['Insert']) {
    const { data, error } = await supabase.from('candidates').insert(candidateData).select().single();
    if (error) throw error;
    return data;
  },

  async get(id: string) {
    const { data, error } = await supabase.from('candidates').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async update(id: string, candidateData: Partial<Database['public']['Tables']['candidates']['Update']>) {
    const { data, error } = await supabase.from('candidates').update(candidateData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};

// Applications API
export const applicationsApi = {
  async list(params: { jobId?: string; status?: string }) {
    const { jobId, status } = params;
    let query = supabase.from('applications').select(`
      *,
      candidates (*),
      jobs (*)
    `);

    if (jobId) {
      query = query.eq('job_id', jobId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('applied_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(applicationData: Database['public']['Tables']['applications']['Insert']) {
    const { data, error } = await supabase.from('applications').insert(applicationData).select().single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: Database['public']['Tables']['applications']['Row']['status']) {
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// Interviews API
export const interviewsApi = {
  async list(params: { startDate?: Date; endDate?: Date; interviewerId?: string }) {
    const { startDate, endDate, interviewerId } = params;
    let query = supabase.from('interviews').select(`
      *,
      applications (
        *,
        candidates (*),
        jobs (*)
      )
    `);

    if (startDate) {
      query = query.gte('scheduled_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('scheduled_at', endDate.toISOString());
    }
    if (interviewerId) {
      query = query.eq('interviewer_id', interviewerId);
    }

    const { data, error } = await query.order('scheduled_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async schedule(interviewData: Database['public']['Tables']['interviews']['Insert']) {
    const { data, error } = await supabase.from('interviews').insert(interviewData).select().single();
    if (error) throw error;
    return data;
  },

  async submitFeedback(id: string, feedback: { feedback: string; rating: number }) {
    const { data, error } = await supabase
      .from('interviews')
      .update(feedback)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// Dashboard API
export const dashboardApi = {
  async getMetrics() {
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('status')
      .eq('status', 'published');

    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('status')
      .in('status', ['new', 'reviewing', 'interviewed']);

    const { data: interviews, error: interviewsError } = await supabase
      .from('interviews')
      .select('scheduled_at')
      .gte('scheduled_at', new Date().toISOString())
      .lte('scheduled_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

    if (jobsError || candidatesError || interviewsError) {
      throw new Error('Failed to fetch metrics');
    }

    return {
      activeJobs: jobs?.length || 0,
      candidatesInPipeline: candidates?.length || 0,
      upcomingInterviews: interviews?.length || 0
    };
  },

  async getRecruitmentFunnel() {
    const { data, error } = await supabase.from('applications').select('status');
    if (error) throw error;

    const funnel = {
      new: 0,
      reviewed: 0,
      interview_scheduled: 0,
      offered: 0,
      rejected: 0
    };

    data.forEach(application => {
      funnel[application.status as keyof typeof funnel]++;
    });

    return funnel;
  }
};