"use client";

import React, { useEffect, useState } from "react";
import { clubService } from "@/services/clubService";
import MatchModal from "@/components/ui/MatchModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Edit,
  Swords,
} from "lucide-react";
import { format } from "date-fns";

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------- */
  /* Load matches & teams               */
  /* ---------------------------------- */
  const loadData = async () => {
    setLoading(true);
    try {
      const [matchRes, teamRes] = await Promise.all([
        clubService.getMatches(),
        clubService.getTeams(),
      ]);

      setMatches(matchRes.data);

      const teamMap = {};
      teamRes.data.forEach((t) => {
        teamMap[t.id] = t.name;
      });
      setTeams(teamMap);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---------------------------------- */
  /* Date-safe filtering (IMPORTANT)    */
  /* ---------------------------------- */
  const now = Date.now();

  const upcomingMatches = matches.filter(
    (m) => new Date(m.date).getTime() > now
  );

  const pastMatches = matches.filter(
    (m) => new Date(m.date).getTime() <= now
  );

  /* ---------------------------------- */
  /* Match Card Component               */
  /* ---------------------------------- */
  const MatchCard = ({ match }) => {
    const isInternal = !match.external_opponent;
    const team1 = teams[match.team1] || "Loading...";
    const team2 = isInternal
      ? teams[match.team2] || "Loading..."
      : match.external_opponent;

    const matchDate = new Date(match.date);
    const status = match.result ? "completed" : "scheduled";

    return (
      <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition">
        <CardContent className="p-5 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {format(matchDate, "EEE, MMM d yyyy")}
              <Clock className="h-4 w-4 ml-2" />
              {format(matchDate, "h:mm a")}
            </div>
            <Badge
              variant={status === "completed" ? "secondary" : "default"}
              className="capitalize"
            >
              {status}
            </Badge>
          </div>

          {/* Teams */}
          <div className="flex items-center justify-between text-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{team1}</h3>
            </div>

            <div className="flex flex-col items-center px-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <Swords className="h-4 w-4" />
              </div>
              <span className="text-[10px] mt-1 text-muted-foreground">
                VS
              </span>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold">{team2}</h3>
              {!isInternal && (
                <span className="text-xs text-amber-600">(Visitor)</span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center border-t pt-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-red-500" />
              Ground #{match.ground}
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedMatch(match);
                setIsModalOpen(true);
              }}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  /* ---------------------------------- */
  /* Render                             */
  /* ---------------------------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Match Schedule</h1>
          <p className="text-muted-foreground">
            Manage fixtures and results
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedMatch(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Match
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-[360px] grid-cols-2">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastMatches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <p className="text-muted-foreground text-center py-10">
              Loading matches...
            </p>
          ) : upcomingMatches.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingMatches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          ) : (
            <EmptyState text="No upcoming matches scheduled." />
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastMatches.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastMatches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          ) : (
            <EmptyState text="No past matches found." />
          )}
        </TabsContent>
      </Tabs>

      {/* Modal */}
      <MatchModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        match={selectedMatch}
        onSuccess={loadData}
      />
    </div>
  );
}

/* ---------------------------------- */
/* Empty State Component               */
/* ---------------------------------- */
function EmptyState({ text }) {
  return (
    <div className="border border-dashed rounded-lg py-14 text-center text-muted-foreground">
      {text}
    </div>
  );
}
