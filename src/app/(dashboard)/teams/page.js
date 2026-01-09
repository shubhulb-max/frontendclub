"use client";
import React, { useEffect, useState } from 'react';
import { clubService } from '@/services/clubService';
import TeamModal from "@/components/ui/TeamModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Trophy, MoreVertical } from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => { loadTeams(); }, []);

  const loadTeams = async () => {
    const res = await clubService.getTeams();
    setTeams(res.data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">Manage squads and assign captains.</p>
        </div>
        <Button onClick={() => { setSelectedTeam(null); setIsModalOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New Team
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Trophy className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setSelectedTeam(team); setIsModalOpen(true); }}>
                    Edit Team
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Disband Team</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="h-4 w-4" /> Squad Size
                  </span>
                  <span className="font-bold">{team.players?.length || 0} Players</span>
                </div>
                <div className="flex items-center gap-2">
  <Avatar className="h-8 w-8">
    <AvatarFallback className="text-xs bg-indigo-600 text-white">
      C
    </AvatarFallback>
  </Avatar>
  <span className="text-sm font-medium">
    {/* Logic Fix: Find the captain object in the players array */}
    {team.players?.find(p => p.id === team.captain) 
      ? `${team.players.find(p => p.id === team.captain).first_name} ${team.players.find(p => p.id === team.captain).last_name}`
      : `Captain ID: ${team.captain || "Not Assigned"}`
    }
  </span>
</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <TeamModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        team={selectedTeam}
        onSuccess={loadTeams}
      />
    </div>
  );
}