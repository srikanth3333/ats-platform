import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon, MailIcon, PhoneIcon, TagIcon } from "lucide-react";
import Link from "next/link";

interface CandidateCardProps {
  candidate: {
    id: string | number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    source: string;
    status:
      | "new"
      | "reviewing"
      | "interviewed"
      | "offered"
      | "hired"
      | "rejected";
    created_at: Date;
  };
}
export function CandidateCard({ candidate }: CandidateCardProps) {
  const statusColors = {
    new: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    reviewing: "bg-amber-100 text-amber-800 hover:bg-amber-200",
    interviewed: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    offered: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
    hired: "bg-green-100 text-green-800 hover:bg-green-200",
    rejected: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  const fullName = `${candidate.first_name} ${candidate.first_name}`;
  const initials = `${candidate.first_name.charAt(
    0
  )}${candidate.first_name.charAt(0)}`;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <Link
                  href={`/candidates/${candidate.id}`}
                  className="hover:underline"
                >
                  <h3 className="font-semibold text-lg">{fullName}</h3>
                </Link>
              </div>
              <Badge
                className={statusColors[candidate.status]}
                variant="outline"
              >
                {candidate.status.charAt(0).toUpperCase() +
                  candidate.status.slice(1)}
              </Badge>
            </div>

            <div className="flex flex-col gap-2 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-2">
                <MailIcon className="h-4 w-4" />
                <a
                  href={`mailto:${candidate.email}`}
                  className="hover:underline"
                >
                  {candidate.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4" />
                <a href={`tel:${candidate.phone}`} className="hover:underline">
                  {candidate.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                <span>Source: {candidate.source}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Added {format(candidate.created_at, "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between bg-muted/50 p-4">
        <Link href={`/candidates/${candidate.id}`} passHref>
          <Button variant="outline" size="sm">
            View Profile
          </Button>
        </Link>
        <Link href={`/candidates/${candidate.id}/applications`} passHref>
          <Button variant="ghost" size="sm">
            View Applications
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
