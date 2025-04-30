import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    department: string;
    location: string;
    job_status: "draft" | "publish" | "closed";
    created_at: Date;
    applicantsCount: number;
  };
}

export function JobCard({ job }: JobCardProps) {
  const statusStyles = {
    draft: "bg-amber-100 text-amber-800 hover:bg-amber-200",
    publish: "bg-green-100 text-green-800 hover:bg-green-200",
    closed: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <Link href={`/jobs/${job.id}`} className="hover:underline">
              <h3 className="font-semibold text-lg">{job.title}</h3>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {job.department}
            </p>
          </div>
          <Badge className={statusStyles[job.job_status]} variant="outline">
            {job?.job_status?.charAt(0).toUpperCase() +
              job?.job_status?.slice(1)}
          </Badge>
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Posted {format(job.created_at, "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            <span>{job.applicantsCount} applicants</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between bg-muted/50 p-4">
        <Link href={`/jobs/${job.id}`} passHref>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
        <Link href={`/jobs/${job.id}/applications`} passHref>
          <Button variant="ghost" size="sm">
            View Applicants
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
