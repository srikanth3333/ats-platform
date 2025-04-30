import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BriefcaseIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="container  mx-auto px-4">
      <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="h-6 w-6" />
            <span className="text-lg font-bold">TalentTrack</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" passHref>
              <Button variant="outline">Sign In</Button>
            </Link>
            <Button>
              Get Started
            </Button>
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="pt-20 pb-16 md:pt-32 md:pb-24 container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Simplify Your Hiring Process
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              TalentTrack is an all-in-one applicant tracking system that helps you find, 
              evaluate, and hire the best talent.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" passHref>
                <Button size="lg">Get Started</Button>
              </Link>
              <Button size="lg" variant="outline">
                Request Demo
              </Button>
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">
              Streamline Your Recruitment
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BriefcaseIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Job Management</h3>
                <p className="text-muted-foreground">
                  Create, edit, and publish job listings with ease. Track applications for each position.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Candidate Tracking</h3>
                <p className="text-muted-foreground">
                  Organize and evaluate candidates. Store resumes, contact information, and application history.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Interview Scheduling</h3>
                <p className="text-muted-foreground">
                  Schedule and manage interviews. Send notifications to interviewers and candidates.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Feedback Collection</h3>
                <p className="text-muted-foreground">
                  Collect and review interview feedback. Make data-driven hiring decisions.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><rect width="20" height="14" x="2" y="3" rx="2"></rect><line x1="8" x2="16" y1="21" y2="21"></line><line x1="12" x2="12" y1="17" y2="21"></line></svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Comprehensive Dashboard</h3>
                <p className="text-muted-foreground">
                  Get a birds-eye view of your recruitment process with detailed analytics and reports.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"></path><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"></path><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"></path><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"></path></svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
                <p className="text-muted-foreground">
                  Collaborate with your hiring team. Share notes, feedback, and make decisions together.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BriefcaseIcon className="h-5 w-5" />
            <span className="font-semibold">TalentTrack</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; 2025 TalentTrack. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
    </div>
  );
}