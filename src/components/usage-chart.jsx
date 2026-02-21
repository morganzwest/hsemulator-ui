'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';

export const description = 'Monthly execution usage chart';

const chartConfig = {
  executions: {
    label: 'Executions',
  },
};

export function UsageChart({ data = [], loading = false }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Execution Usage
          </CardTitle>
          <CardDescription>Monthly action execution history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-75 flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Execution Usage
          </CardTitle>
          <CardDescription>Monthly action execution history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-75 flex items-center justify-center text-muted-foreground'>
            <div className='text-center'>
              <TrendingUp className='h-12 w-12 mx-auto mb-2 opacity-50' />
              <p>No execution data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get last 6 months of data
  const lastSixMonths = data.slice(-6);

  // Calculate trend
  const currentMonth = lastSixMonths[lastSixMonths.length - 1]?.executions || 0;
  const previousMonth =
    lastSixMonths[lastSixMonths.length - 2]?.executions || 0;
  const trend =
    previousMonth > 0
      ? ((currentMonth - previousMonth) / previousMonth) * 100
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <TrendingUp className='h-5 w-5' />
          Execution Usage
        </CardTitle>
        <CardDescription>
          Showing total executions for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-80 max-h-80'>
          <ChartContainer config={chartConfig} className='h-full'>
            <BarChart
              accessibilityLayer
              data={lastSixMonths}
              margin={{
                top: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='month'
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value + '-01');
                  return date.toLocaleDateString('en-US', { month: 'short' });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey='executions' radius={8} fill='#ffffff'>
                <LabelList
                  position='top'
                  offset={12}
                  className='fill-foreground'
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className='flex-col items-start gap-2 text-sm'>
        <div className='flex gap-2 leading-none font-medium'>
          {trend > 0 ? (
            <>
              Trending up by {Math.abs(trend).toFixed(1)}% this month
              <TrendingUp className='h-4 w-4' />
            </>
          ) : trend < 0 ? (
            <>
              Trending down by {Math.abs(trend).toFixed(1)}% this month
              <TrendingUp className='h-4 w-4 rotate-180' />
            </>
          ) : (
            <>No change this month</>
          )}
        </div>
        <div className='text-muted-foreground leading-none'>
          Showing total executions for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
