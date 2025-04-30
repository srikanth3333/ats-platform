"use client";
import { JobCard } from "@/components/jobs/job-card";
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

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FetchTableDataParams {
  tableName: string;
  page: number;
  pageSize: number;
  columnToSort?: string;
  sortDirection?: "asc" | "desc";
  filters?: Record<string, any>;
  searchTerm?: string;
  searchColumns?: string[];
}

export default function JobsPage() {
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
        tableName: "jobs",
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
        tableName: "jobs",
        page: 1,
        pageSize: 10,
        filters,
        searchTerm,
        searchColumns: searchTerm ? ["title", "department", "location"] : [],
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
          <h1 className="text-2xl font-bold">Jobs</h1>
          <Link href="/jobs/new" passHref>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Job
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs..."
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
                      job_status: {
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="publish">Published</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select
            defaultValue="all"
            onValueChange={(value) => {
              const departmentFilter =
                value === "all"
                  ? {}
                  : {
                      department: {
                        operator: "ilike",
                        value: value,
                      },
                    };
              applyFilters(departmentFilter);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="hr">Human Resources</SelectItem>
              <SelectItem value="support">Customer Support</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        ) : data?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((job: any) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[200px] border rounded-md p-6">
            <p className="text-muted-foreground">
              No jobs found. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
