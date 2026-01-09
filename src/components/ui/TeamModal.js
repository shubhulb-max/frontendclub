"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { clubService } from "@/services/clubService";

export default function TeamModal({ open, onOpenChange, team, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState([]);
  
  // State to hold form data
  const [formData, setFormData] = useState({
    name: "",
    captain: "",
    player_ids: [], // Stores an array of Integers (e.g., [1, 2, 5])
  });

  // 1. Load all players when modal opens (to populate dropdowns)
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const res = await clubService.getPlayers();
        setPlayers(res.data);
      } catch (err) {
        toast.error("Could not load players list");
      }
    };
    if (open) loadPlayers();
  }, [open]);

  // 2. Pre-fill form when editing a team
  useEffect(() => {
    if (team) {
      // Extract just the IDs from the team.players object array
      const existingPlayerIds = team.players?.map(p => p.id) || [];
      
      setFormData({ 
        name: team.name, 
        // Convert ID to string for the Select component
        captain: team.captain ? team.captain.toString() : "",
        player_ids: existingPlayerIds
      });
    } else {
      // Reset for "Create New" mode
      setFormData({ name: "", captain: "", player_ids: [] });
    }
  }, [team, open]);

  // Helper to handle checkbox toggles
  const togglePlayer = (playerId) => {
    setFormData(prev => {
      const isSelected = prev.player_ids.includes(playerId);
      const newIds = isSelected 
        ? prev.player_ids.filter(id => id !== playerId)
        : [...prev.player_ids, playerId];
      return { ...prev, player_ids: newIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step A: Format Data for API
      const captainId = formData.captain ? parseInt(formData.captain, 10) : null;
      
      // Ensure we are using the array of IDs we built in state
      let finalSquadIds = [...formData.player_ids];

      // Rule: If a Captain is selected, ensure they are in the squad list
      if (captainId && !finalSquadIds.includes(captainId)) {
        finalSquadIds.push(captainId);
      }

      const payload = {
        name: formData.name,
        captain: captainId,
    player_ids: finalSquadIds // Sends array of IDs: [1, 2, 3]
      };

      console.log("Sending Payload:", payload);

      // Step B: Send Request
      if (team && team.id) {
        await clubService.updateTeam(team.id, payload);
        toast.success("Team updated successfully");
      } else {
        await clubService.createTeam(payload);
        toast.success("Team created successfully");
      }

      onSuccess(); // Refresh parent list
      onOpenChange(false); // Close modal

    } catch (error) {
      console.error("Save Error:", error);
      // specific error handling
      if (error.response?.data) {
        toast.error(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        toast.error("Failed to save team details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{team ? "Edit Team Squad" : "Create New Team"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          
          {/* Team Name Input */}
          <div className="space-y-2">
            <Label>Team Name</Label>
            <Input 
              placeholder="e.g. Thunderbolts"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>

          {/* Captain Select Dropdown */}
          <div className="space-y-2">
            <Label>Team Captain</Label>
            <Select 
              value={formData.captain} 
              onValueChange={(v) => setFormData({...formData, captain: v})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a captain" />
              </SelectTrigger>
              <SelectContent>
                {players.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.first_name} {p.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Squad Selection Checklist */}
          <div className="space-y-3">
            <Label>Assign Players to Squad ({formData.player_ids.length} selected)</Label>
            <ScrollArea className="h-48 border rounded-md p-4 bg-slate-50">
              <div className="space-y-3">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center space-x-3">
                    <Checkbox 
                      id={`player-${player.id}`}
                      // Check if this player's ID is in our selected array
                      checked={formData.player_ids.includes(player.id)}
                      onCheckedChange={() => togglePlayer(player.id)}
                    />
                    <label 
                      htmlFor={`player-${player.id}`}
                      className="text-sm font-medium leading-none cursor-pointer flex-1"
                    >
                      {player.first_name} {player.last_name} 
                      <span className="ml-2 text-xs text-slate-500">({player.role})</span>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Processing..." : team ? "Update Team" : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}