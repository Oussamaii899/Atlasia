"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Calendar, MapPin, Users, Trophy } from "lucide-react"
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem , type User } from '@/types';
import { Head } from "@inertiajs/react";

function formatMatch(match) {
  return {
    ...match,
    homeTeam: match.team_a,
    awayTeam: match.team_b,
    stadium: match.place?.stadium_name ?? 'Unknown Stadium',
    date: new Date(match.time_matche).toLocaleDateString(),
    attendance: match.attendance ?? null,
  };
}


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Matches',
        href: '/matches',
    }
];

function MatchCard({ match }) {

  console.log(match)
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            World Cup 2030
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {match.team_A.charAt(0)}
              </div>
              <span className="font-semibold">{match.team_A}</span>
            </div>
            <div className="text-sm text-muted-foreground">VS</div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{match.team_B}</span>
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {match.team_B.charAt(0)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {match.place.name}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {match.date}
              </div>
              {match.attendance && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {match.attendance}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Component({ matches }) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Matches" />
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="h-6 w-6" />
              <h2 className="text-2xl font-semibold">Football Matches</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {matches.map((match) => (
                <MatchCard key={match.id} match={formatMatch(match)} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
