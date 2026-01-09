"use client";
import React, { useEffect, useState } from 'react';
import { clubService } from '@/services/clubService';
import PlayerModal from "@/components/ui/PlayerModal";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Trophy, Users, Phone } from "lucide-react";

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => { loadPlayers(); }, []);
  const handleEdit = (player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const loadPlayers = async () => {
    try {
      const res = await clubService.getPlayers();
      setPlayers(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const filteredPlayers = players.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Player Directory</h1>
          <p className="text-muted-foreground">Detailed overview of club members, teams, and leadership.</p>
        </div>
        <Button onClick={() => { setSelectedPlayer(null); setIsModalOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Player
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[250px]">Player</TableHead>
              <TableHead>Role & Age</TableHead>
              <TableHead>Teams & Captaincy</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead className="text-right">Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">Loading players...</TableCell></TableRow>
            ) : filteredPlayers.map((player) => (
              <TableRow key={player.id} className="hover:bg-slate-50/50">
                {/* Profile Column */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={player.profile_picture} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                        {player.first_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 leading-none mb-1">
                        {player.first_name} {player.last_name}
                      </span>
                      <span className="text-xs text-muted-foreground italic">ID: #{player.id}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Role & Age */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="w-fit capitalize">{player.role}</Badge>
                    <span className="text-xs text-slate-500">{player.age} Years Old</span>
                  </div>
                </TableCell>

                {/* Teams & Leadership */}
                <TableCell>
                  <div className="flex flex-col gap-2">
                    {/* Teams as member */}
                    <div className="flex flex-wrap gap-1">
                      {player.teams?.map(t => (
                        <Badge key={t.id} variant="secondary" className="text-[10px] py-0 px-1.5 flex items-center gap-1">
                          <Users className="h-3 w-3" /> {t.name}
                        </Badge>
                      ))}
                    </div>
                    {/* Teams as Captain */}
                    <div className="flex flex-wrap gap-1">
                      {player.captain_of?.map(t => (
                        <Badge key={t.id} variant="default" className="text-[10px] py-0 px-1.5 bg-amber-600 hover:bg-amber-600 flex items-center gap-1">
                          <Trophy className="h-3 w-3" /> Lead: {t.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TableCell>

                {/* Membership Details */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${player.membership_active ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-medium capitalize">{player.membership?.status}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Joined: {player.membership?.join_date}
                    </span>
                  </div>
                </TableCell>

                {/* Contact & Actions */}
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-2">
                    <a href={`tel:${player.phone_number}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                      <Phone className="h-3 w-3" /> {player.phone_number}
                    </a>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs border"
                      onClick={() => handleEdit(player)}
                    >
                      Manage
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PlayerModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        player={selectedPlayer}
        onSuccess={loadPlayers}
      />
    </div>
  );
}