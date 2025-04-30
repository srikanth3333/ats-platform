import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Clock3Icon, UserIcon } from 'lucide-react';
import { format } from 'date-fns';

interface Interview {
  id: string;
  candidateName: string;
  jobTitle: string;
  date: Date;
  interviewers: string[];
}

interface UpcomingInterviewsProps {
  interviews: Interview[];
}

export function UpcomingInterviews({ interviews }: UpcomingInterviewsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Interviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {interviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming interviews</p>
          ) : (
            interviews.map((interview) => (
              <div key={interview.id} className="border rounded-lg p-3">
                <h4 className="font-medium text-sm">{interview.candidateName}</h4>
                <p className="text-xs text-muted-foreground mb-2">{interview.jobTitle}</p>
                <div className="flex flex-wrap gap-y-2 gap-x-3 text-xs">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{format(interview.date, 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock3Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{format(interview.date, 'h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{interview.interviewers.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}