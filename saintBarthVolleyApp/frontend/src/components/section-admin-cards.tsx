"use client";

import {
  IconUsers,
  IconFolder,
  IconListDetails,
  IconChartBar,
} from "@tabler/icons-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SectionAdminCards({
  stats,
}: {
  stats: {
    users: number;
    clubs: number;
    teams: number;
    matches: number;
  };
}) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-4 lg:px-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Total Users</CardTitle>
          <IconUsers size={20} />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.users}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Total Clubs</CardTitle>
          <IconFolder size={20} />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.clubs}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Total Teams</CardTitle>
          <IconListDetails size={20} />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.teams}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Total Matches</CardTitle>
          <IconChartBar size={20} />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.matches}</p>
        </CardContent>
      </Card>
    </div>
  );
}
