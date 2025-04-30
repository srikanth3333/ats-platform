"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useState } from "react";

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source: string;
  resume_url: string;
  user_id: string;
  status: string;
  created_at: string;
}

interface ApplicationBoardProps {
  applications: {
    new: Candidate[];
    reviewed: Candidate[];
    interviewScheduled: Candidate[];
    rejected: Candidate[];
    offered: Candidate[];
  };
  onStatusChange?: (
    candidateId: string,
    newStatus: string,
    oldStatus: string
  ) => void;
  view: "board" | "list";
}

export function ApplicationBoard({
  applications,
  onStatusChange,
  view,
}: ApplicationBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingSource, setDraggingSource] = useState<string | null>(null);

  const statuses = [
    { key: "new", label: "New", color: "border-blue-400" },
    { key: "reviewed", label: "Reviewed", color: "border-purple-400" },
    {
      key: "interviewScheduled",
      label: "Interview Scheduled",
      color: "border-amber-400",
    },
    { key: "offered", label: "Offered", color: "border-green-400" },
    { key: "rejected", label: "Rejected", color: "border-gray-400" },
  ];

  const handleDragStart = (e: React.DragEvent, id: string, status: string) => {
    setDraggingId(id);
    setDraggingSource(status);
    e.dataTransfer.setData("application/reactflow", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();

    const id = draggingId;
    const sourceStatus = draggingSource;

    if (id && sourceStatus && sourceStatus !== targetStatus) {
      onStatusChange?.(id, targetStatus, sourceStatus);
    }

    setDraggingId(null);
    setDraggingSource(null);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  if (view === "list") {
    const allCandidates = Object.values(applications).flat();
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allCandidates.length > 0 ? (
                allCandidates.map((candidate) => (
                  <TableRow
                    key={candidate.id}
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(e, candidate.id, candidate.status)
                    }
                  >
                    <TableCell>
                      <Link
                        href={`/candidates/${candidate.id}`}
                        className="hover:underline"
                      >
                        {candidate.first_name} {candidate.last_name}
                      </Link>
                    </TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>{candidate.phone}</TableCell>
                    <TableCell>{candidate.source}</TableCell>
                    <TableCell>
                      {statuses.find((s) => s.key === candidate.status)
                        ?.label || candidate.status}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(candidate.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No candidates found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {statuses.map((status) => (
        <div
          key={status.key}
          className="flex flex-col h-full"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status.key)}
        >
          <Card className={`border-t-4 ${status.color} h-full`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {status.label} (
                {applications[status.key as keyof typeof applications]
                  ?.length || 0}
                )
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 overflow-y-auto max-h-[calc(100vh-13rem)]">
              {applications[status.key as keyof typeof applications]?.map(
                (candidate) => (
                  <div
                    key={candidate.id}
                    className="p-3 bg-card border rounded-md cursor-move hover:shadow-sm transition-shadow"
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(e, candidate.id, status.key)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(
                            candidate.first_name,
                            candidate.last_name
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/candidates/${candidate.id}`}
                          className="block text-sm font-medium truncate hover:underline"
                        >
                          {candidate.first_name} {candidate.last_name}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">
                          {candidate.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied{" "}
                          {formatDistanceToNow(new Date(candidate.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}

              {(!applications[status.key as keyof typeof applications] ||
                applications[status.key as keyof typeof applications].length ===
                  0) && (
                <div className="p-3 border border-dashed rounded-md text-center">
                  <p className="text-xs text-muted-foreground">No candidates</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
