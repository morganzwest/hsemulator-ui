'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className='bg-background border rounded-lg shadow-lg p-3'>
        <p className='font-medium'>{data.month || label}</p>
        <p className='text-sm text-muted-foreground'>
          Executions: {data.executions.toLocaleString()}
        </p>
        {data.execution_limit && (
          <p className='text-sm text-muted-foreground'>
            Limit: {data.execution_limit.toLocaleString()}
          </p>
        )}
        {data.percentage && (
          <p className='text-sm text-muted-foreground'>
            Usage: {data.percentage}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function ExecutionUsageChart({
  data = [],
  months = 12,
  onMonthsChange,
  loading = false,
}) {
  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTooltipValue = (value, name) => {
    if (name === 'executions') {
      return [`${value.toLocaleString()} executions`, 'Executions'];
    }
    if (name === 'percentage') {
      return [`${value}%`, 'Usage %'];
    }
    return [value, name];
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-background border rounded-lg shadow-lg p-3'>
          <p className='font-medium'>{formatMonth(label)}</p>
          <p className='text-sm text-muted-foreground'>
            Executions: {data.executions.toLocaleString()}
          </p>
          {data.execution_limit && (
            <p className='text-sm text-muted-foreground'>
              Limit: {data.execution_limit.toLocaleString()}
            </p>
          )}
          {data.percentage && (
            <p className='text-sm text-muted-foreground'>
              Usage: {data.percentage}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Play className='h-5 w-5' />
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
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Play className='h-5 w-5' />
            Execution Usage
          </CardTitle>
          <CardDescription>Monthly action execution history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-75 flex items-center justify-center text-muted-foreground'>
            <div className='text-center'>
              <Play className='h-12 w-12 mx-auto mb-2 opacity-50' />
              <p>No execution data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasUnlimitedPlan = data.some((d) => d.execution_limit === null);
  const chartData = data.map((d) => ({
    ...d,
    month: formatMonth(d.month),
    displayLimit:
      d.execution_limit ||
      Math.max(...data.map((item) => item.executions)) * 1.2,
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Play className='h-5 w-5' />
              Execution Usage
            </CardTitle>
            <CardDescription>Monthly action execution history</CardDescription>
          </div>
          <Select
            value={months.toString()}
            onValueChange={(value) => onMonthsChange?.(parseInt(value))}
          >
            <SelectTrigger className='w-30'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='6'>6 months</SelectItem>
              <SelectItem value='12'>12 months</SelectItem>
              <SelectItem value='24'>24 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className='h-75'>
          <ResponsiveContainer width='100%' height='100%'>
            {hasUnlimitedPlan ? (
              // Bar chart for unlimited plans (no limit line)
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='month'
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor='end'
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey='executions'
                  fill='hsl(var(--primary))'
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              // Line chart for plans with limits
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='month'
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor='end'
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type='monotone'
                  dataKey='executions'
                  stroke='hsl(var(--primary))'
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type='monotone'
                  dataKey='displayLimit'
                  stroke='hsl(var(--destructive))'
                  strokeWidth={2}
                  strokeDasharray='5 5'
                  dot={false}
                  name='limit'
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        {!hasUnlimitedPlan && (
          <div className='mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-0.5 bg-primary'></div>
              <span>Executions</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-0.5 bg-destructive border-dashed'></div>
              <span>Plan Limit</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
