"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface AudienceSegment {
  name: string;
  value: number;
  fill: string;
}

interface AudienceDonutChartProps {
  data: AudienceSegment[];
}

export default function AudienceDonutChart({ data }: AudienceDonutChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  // Convert the array of config into a mapping for ChartContainer
  const chartConfig = data.reduce((acc: any, item) => {
    acc[item.name] = {
      label: item.name,
      color: item.fill,
    };
    return acc;
  }, {});

  return (
    <Card className="col-span-1 h-full">
      <CardHeader>
        <CardTitle>Audience Segments</CardTitle>
        <CardDescription>Total active leads: {total.toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-[300px]">
        <div className="flex-1 relative">
          <ChartContainer config={chartConfig} className="absolute inset-0 w-full h-full pb-0">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold">{(total / 1000).toFixed(1)}k</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Leads</span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="text-muted-foreground/50 text-xs">
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              </div>
              <span className="font-medium">{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
