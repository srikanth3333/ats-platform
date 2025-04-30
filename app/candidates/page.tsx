"use client";
import { CandidateCard } from "@/components/candidates/candidate-card";
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
import { PlusIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FetchTableDataParams, PaginatedResponse } from "../jobs/page";

const sampleCandidates = [
  {
    id: "1",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@example.com",
    phone: "+1 (555) 123-4567",
    source: "LinkedIn",
    status: "new",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@example.com",
    phone: "+1 (555) 987-6543",
    source: "Job Board",
    status: "reviewing",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    firstName: "Robert",
    lastName: "Smith",
    email: "robert.smith@example.com",
    phone: "+1 (555) 456-7890",
    source: "Referral",
    status: "interviewed",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@example.com",
    phone: "+1 (555) 789-0123",
    source: "Company Website",
    status: "new",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "5",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@example.com",
    phone: "+1 (555) 234-5678",
    source: "LinkedIn",
    status: "offered",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: "6",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 345-6789",
    source: "Job Fair",
    status: "hired",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
  },
];

export default function CandidatesPage() {
  const [data, setData] = useState<any>([]);
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
      // Calculate offset
      const offset = (page - 1) * pageSize;
      // const { data: userDetails } = await supabase.auth.getUser();
      // const userId = userDetails?.user?.id;
      const userId = "5e281aee-9f16-4b7f-b5b9-6c4564d3b00c";
      // Start building the query with default filter
      let query = supabase
        .from(tableName)
        .select("*", { count: "exact" })
        .eq("user_id", userId);

      // Apply additional filters if any
      Object.entries(filters).forEach(([column, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Handle different filter types
          if (typeof value === "object" && value.operator && value.value) {
            // Support custom operators (e.g., { operator: 'gte', value: 10 })
            const { operator, value: filterValue } = value;

            // Skip this filter if it's the "all" value
            if (filterValue === "") {
              return;
            }

            if (["eq", "gt", "gte", "lt", "lte", "ne"].includes(operator)) {
              // Map operators to Supabase methods
              if (operator === "eq") {
                query = query.eq(column, filterValue);
              } else if (operator === "gt") {
                query = query.gt(column, filterValue);
              } else if (operator === "gte") {
                query = query.gte(column, filterValue);
              } else if (operator === "lt") {
                query = query.lt(column, filterValue);
              } else if (operator === "lte") {
                query = query.lte(column, filterValue);
              } else if (operator === "ne") {
                query = query.neq(column, filterValue); // Add not equals support
              }
            } else if (operator === "ilike") {
              query = query.ilike(column, `%${filterValue}%`);
            }
          } else {
            // Default to equality filter
            query = query.eq(column, value);
          }
        }
      });

      // Apply search if provided
      if (searchTerm && searchColumns.length > 0) {
        const searchConditions = searchColumns.map((column) => {
          return `${column}.ilike.%${searchTerm}%`;
        });
        query = query.or(searchConditions.join(","));
      }

      // Create a separate query for counting
      const { count: totalCount } = await query;

      // Add pagination and sorting to main query
      query = query
        .order(columnToSort, { ascending: sortDirection === "asc" })
        .range(offset, offset + pageSize - 1);

      // Execute the main query
      const { data, error } = await query;

      if (error) {
        throw new Error(
          `Error fetching data from ${tableName}: ${error.message}`
        );
      }

      const totalItems = totalCount || 0;
      const totalPages = Math.ceil(totalItems / pageSize);

      setLoading(false);
      return {
        data: data as T[],
        totalCount: totalItems,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      setLoading(false);
      console.error("Error in fetchTableData:", error);
      throw error;
    }
  }

  const getData = async () => {
    try {
      const { data } = await fetchTableData({
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
      const jobs = await getData();
      setData(jobs);
      setLoading(false);
    };
    fetchData();
  }, []);

  const applyFilters = async (
    filters: Record<string, any> = {},
    searchTerm: string = ""
  ) => {
    try {
      const filteredData = await fetchTableData({
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
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Candidates</h1>
          <Link href="/candidates/new" passHref>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Candidate
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search candidates..."
              className="pl-8"
              onChange={(e) => {
                const searchTerm = e.target.value.trim();
                applyFilters({}, searchTerm);
              }}
            />
          </div>
          <Select
            defaultValue="all"
            onValueChange={(value) => {
              const statusFilter =
                value === "all"
                  ? {}
                  : {
                      status: {
                        operator: "ilike",
                        value: value,
                      },
                    };
              applyFilters(statusFilter);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="interviewed">Interviewed</SelectItem>
              <SelectItem value="offered">Offered</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select
            defaultValue="all"
            onValueChange={(value) => {
              const statusFilter =
                value === "all"
                  ? {}
                  : {
                      source: {
                        operator: "ilike",
                        value: value,
                      },
                    };
              applyFilters(statusFilter);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="jobBoard">Job Board</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="website">Company Website</SelectItem>
              <SelectItem value="agency">Recruitment Agency</SelectItem>
              <SelectItem value="jobFair">Job Fair</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : data?.length > 0 ? (
            data.map((candidate: any) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))
          ) : (
            <div className="flex justify-center items-center min-h-[200px] border rounded-md p-6">
              <p className="text-muted-foreground">
                No candidates found. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
