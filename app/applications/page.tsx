"use client";

import { ApplicationBoard } from "@/components/applications/application-board";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { GridIcon, ListIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FetchTableDataParams, PaginatedResponse } from "../jobs/page";

interface Candidate {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source: string;
  resume_url: string;
  user_id: string;
  status: string;
}

interface Applications {
  new: Candidate[];
  reviewed: Candidate[];
  interviewScheduled: Candidate[];
  rejected: Candidate[];
  offered: Candidate[];
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Applications>({
    new: [],
    reviewed: [],
    interviewScheduled: [],
    rejected: [],
    offered: [],
  });
  const [view, setView] = useState<"board" | "list">("board");
  const [data, setData] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchTableData<T>({
    tableName,
    page = 1,
    pageSize = 10,
    columnToSort = "id",
    sortDirection = "asc",
    filters = {},
    searchTerm = "",
    searchColumns = [],
  }: FetchTableDataParams): Promise<PaginatedResponse<T>> {
    try {
      setLoading(true);
      const supabase = await createClient();
      const userId = "5e281aee-9f16-4b7f-b5b9-6c4564d3b00c";
      let query = supabase
        .from(tableName)
        .select("*", { count: "exact" })
        .eq("user_id", userId);

      Object.entries(filters).forEach(([column, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (typeof value === "object" && value.operator && value.value) {
            const { operator, value: filterValue } = value;
            if (filterValue === "") return;
            if (["eq", "gt", "gte", "lt", "lte", "ne"].includes(operator)) {
              if (operator === "eq") query = query.eq(column, filterValue);
              else if (operator === "gt") query = query.gt(column, filterValue);
              else if (operator === "gte")
                query = query.gte(column, filterValue);
              else if (operator === "lt") query = query.lt(column, filterValue);
              else if (operator === "lte")
                query = query.lte(column, filterValue);
              else if (operator === "ne")
                query = query.neq(column, filterValue);
            } else if (operator === "ilike") {
              query = query.ilike(column, `%${filterValue}%`);
            }
          } else {
            query = query.eq(column, value);
          }
        }
      });

      if (searchTerm && searchColumns.length > 0) {
        const searchConditions = searchColumns.map(
          (column) => `${column}.ilike.%${searchTerm}%`
        );
        query = query.or(searchConditions.join(","));
      }

      const { count: totalCount } = await query;
      query = query
        .order(columnToSort, { ascending: sortDirection === "asc" })
        .range((page - 1) * pageSize, page * pageSize - 1);

      const { data, error } = await query;
      if (error) throw new Error(`Error fetching data: ${error.message}`);

      const totalItems = totalCount || 0;
      setLoading(false);
      return {
        data: data as T[],
        totalCount: totalItems,
        page,
        pageSize,
        totalPages: Math.ceil(totalItems / pageSize),
      };
    } catch (error) {
      setLoading(false);
      console.error("Error in fetchTableData:", error);
      throw error;
    }
  }

  const getData = async () => {
    try {
      const { data } = await fetchTableData<Candidate>({
        tableName: "candidates",
        page: 1,
        pageSize: 10,
      });
      return data;
    } catch (error) {
      console.error("Error fetching initial data:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const candidates = await getData();
      setData(candidates);
      // Group candidates by status
      const groupedApplications = candidates.reduce(
        (acc: Applications, candidate: Candidate) => {
          const status = (candidate.status || "new") as keyof Applications;
          if (!acc[status as keyof Applications])
            acc[status as keyof Applications] = [];
          acc[status as keyof Applications].push({
            ...candidate,
            id: candidate.id.toString(), // Convert id to string
          });
          return acc;
        },
        {
          new: [],
          reviewed: [],
          interviewScheduled: [],
          rejected: [],
          offered: [],
        }
      );
      setApplications(groupedApplications);
      setLoading(false);
    };
    fetchData();
  }, []);

  const applyFilters = async (
    filters: Record<string, any> = {},
    searchTerm: string = ""
  ) => {
    try {
      const filteredData = await fetchTableData<Candidate>({
        tableName: "candidates",
        page: 1,
        pageSize: 10,
        filters,
        searchTerm,
        searchColumns: searchTerm
          ? ["first_name", "last_name", "email", "phone", "source", "status"]
          : [],
      });
      setData(filteredData?.data || []);
      const groupedApplications = filteredData.data.reduce(
        (acc: Applications, candidate: Candidate) => {
          const status = candidate.status || "new";
          if (!acc[status as keyof Applications])
            acc[status as keyof Applications] = [];
          acc[status as keyof Applications].push({
            ...candidate,
            id: candidate.id.toString(), // Ensure id is a string
          });
          return acc;
        },
        {
          new: [],
          reviewed: [],
          interviewScheduled: [],
          rejected: [],
          offered: [],
        }
      );
      setApplications(groupedApplications);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const handleStatusChange = async (
    candidateId: string,
    newStatus: string,
    oldStatus: string
  ) => {
    const candidate = applications[oldStatus as keyof Applications]?.find(
      (c) => c.id.toString() === candidateId
    );
    if (!candidate) return;

    // Update Supabase
    const supabase = await createClient();
    const { error } = await supabase
      .from("candidates")
      .update({ status: newStatus })
      .eq("id", candidateId);

    if (error) {
      toast.error("Failed to update candidate status");
      console.error("Error updating status:", error);
      return;
    }

    // Update local state
    const updatedOldStatusArray = applications[
      oldStatus as keyof Applications
    ].filter((c) => c.id.toString() !== candidateId);
    const updatedNewStatusArray = [
      ...(applications[newStatus as keyof Applications] || []),
      { ...candidate, status: newStatus },
    ];

    setApplications({
      ...applications,
      [oldStatus]: updatedOldStatusArray,
      [newStatus]: updatedNewStatusArray,
    });

    toast.success(
      `Moved ${candidate.first_name} ${candidate.last_name} to ${newStatus
        .replace(/([A-Z])/g, " $1")
        .toLowerCase()}`
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    applyFilters({}, searchTerm);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Applications</h1>
          <div className="flex gap-2">
            <Button
              variant={view === "board" ? "default" : "outline"}
              size="icon"
              onClick={() => setView("board")}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setView("list")}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search applications..."
              className="pl-8"
              onChange={handleSearch}
            />
          </div>
          <Select
            defaultValue="all"
            onValueChange={(value) =>
              applyFilters({ job: value !== "all" ? value : "" })
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="software-engineer">
                Software Engineer
              </SelectItem>
              <SelectItem value="product-designer">Product Designer</SelectItem>
              <SelectItem value="marketing-director">
                Marketing Director
              </SelectItem>
              <SelectItem value="data-scientist">Data Scientist</SelectItem>
              <SelectItem value="support-specialist">
                Support Specialist
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <ApplicationBoard
            applications={applications}
            onStatusChange={handleStatusChange}
            view={view}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
