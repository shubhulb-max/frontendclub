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
import { clubService } from "@/services/clubService";

export default function InventoryModal({ open, onOpenChange, item, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "equipment", 
    quantity: 1,
    status: "available", // Default status
    cost: "",
    notes: ""
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        category: item.category || "equipment",
        quantity: item.quantity || 1,
        status: item.status || "available",
        cost: item.cost || "",
        notes: item.notes || ""
      });
    } else {
      setFormData({ name: "", category: "equipment", quantity: 1, status: "available", cost: "", notes: "" });
    }
  }, [item, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity),
        cost: formData.cost ? parseFloat(formData.cost) : 0
      };

      if (item?.id) {
        await clubService.updateInventoryItem(item.id, payload);
        toast.success("Item updated");
      } else {
        await clubService.createInventoryItem(payload);
        toast.success("New item added to inventory");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save inventory item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Add New Inventory"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          <div className="space-y-2">
            <Label>Item Name</Label>
            <Input 
              placeholder="e.g. SG Cricket Bat - Grade A"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({...formData, category: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="apparel">Apparel/Kit</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input 
                type="number" 
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(v) => setFormData({...formData, status: v})}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available (In Stock)</SelectItem>
                <SelectItem value="distributed">Distributed (In Use)</SelectItem>
                <SelectItem value="damaged">Damaged / Destroyed</SelectItem>
                <SelectItem value="missing">Missing / Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cost / Value (₹)</Label>
            <Input 
              type="number" 
              placeholder="0.00"
              value={formData.cost}
              onChange={(e) => setFormData({...formData, cost: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (e.g., Who has it?)</Label>
            <Input 
              placeholder="Assigned to Team A..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}