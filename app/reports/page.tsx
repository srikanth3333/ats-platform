import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { RecruitmentFunnel } from '@/components/dashboard/recruitment-funnel';
import { TimeToFillChart } from '@/components/reports/time-to-fill-chart';
import { SourceEffectiveness } from '@/components/reports/source-effectiveness';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample data for the charts
const sampleFunnelData = [
  { name: 'Applications', value: 120, fill: 'hsl(var(--chart-1))' },
  { name: 'Reviewed', value: 75, fill: 'hsl(var(--chart-2))' },
  { name: 'Interviews', value: 40, fill: 'hsl(var(--chart-3))' },
  { name: 'Offers', value: 15, fill: 'hsl(var(--chart-4))' },
  { name: 'Hired', value: 8, fill: 'hsl(var(--chart-5))' },
];

const sampleTimeToFillData = [
  { department: 'Engineering', avgDays: 24, positions: 5 },
  { department: 'Design', avgDays: 18, positions: 3 },
  { department: 'Marketing', avgDays: 22, positions: 2 },
  { department: 'Sales', avgDays: 15, positions: 4 },
  { department: 'Customer Support', avgDays: 12, positions: 6 },
  { department: 'HR', avgDays: 20, positions: 1 },
];

const sampleSourceData = [
  { name: 'LinkedIn', value: 35, quality: 4.2 },
  { name: 'Job Board', value: 25, quality: 3.5 },
  { name: 'Referral', value: 15, quality: 4.8 },
  { name: 'Company Website', value: 18, quality: 3.9 },
  { name: 'Recruitment Agency', value: 7, quality: 3.7 },
];

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Reports</h1>
          
          <div className="flex items-center gap-4">
            <Select defaultValue="last30days">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="last90days">Last 90 days</SelectItem>
                <SelectItem value="thisYear">This year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recruitment Summary</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">New Applications</p>
                      <p className="text-2xl font-bold">120</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Interviews Conducted</p>
                      <p className="text-2xl font-bold">48</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Offers Extended</p>
                      <p className="text-2xl font-bold">15</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">New Hires</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <TimeToFillChart data={sampleTimeToFillData} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RecruitmentFunnel data={sampleFunnelData} title="Recruitment Funnel" description="Current recruitment pipeline" />
              <div className="lg:col-span-2">
                <SourceEffectiveness data={sampleSourceData} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Metrics</CardTitle>
                <CardDescription>Performance data by job posting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="text-muted-foreground">Coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="candidates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Metrics</CardTitle>
                <CardDescription>Performance data by candidate source and quality</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="text-muted-foreground">Coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}