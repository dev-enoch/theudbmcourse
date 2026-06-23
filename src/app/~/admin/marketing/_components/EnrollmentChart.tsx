"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface EnrollmentChartProps {
  data: {
    name: string;
    Organic: number;
    Paid: number;
    Email: number;
  }[];
}

const chartConfig = {
  Organic: {
    label: "Organic",
    color: "#6366F1", // Indigo
  },
  Paid: {
    label: "Paid",
    color: "#F97316", // Orange
  },
  Email: {
    label: "Email",
    color: "#14B8A6", // Teal
  },
};

export default function EnrollmentChart({ data }: EnrollmentChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monthly Enrollments by Channel</CardTitle>
            <CardDescription>Jan - Dec 2024 · All channels</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
            <Bar dataKey="Organic" stackId="a" fill="var(--color-Organic)" radius={[0, 0, 4, 4]} barSize={40} />
            <Bar dataKey="Paid" stackId="a" fill="var(--color-Paid)" />
            <Bar dataKey="Email" stackId="a" fill="var(--color-Email)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
