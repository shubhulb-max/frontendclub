"use client";
import React, { useEffect, useState } from 'react';
import { clubService } from '@/services/clubService';
import InventoryModal from "@/components/ui/InventoryModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, Search, Plus, Archive, RotateCcw } from "lucide-react";

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const loadInventory = async () => {
    try {
      const res = await clubService.getInventory();
      setItems(res.data);
    } catch (err) {
      console.error("Failed to load inventory", err);
    }
  };

  useEffect(() => { loadInventory(); }, []);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Helper to color-code status
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'available': 
        return <Badge className="bg-green-600 hover:bg-green-700">Available</Badge>;
      case 'distributed': 
        return <Badge className="bg-blue-600 hover:bg-blue-700">Distributed</Badge>;
      case 'missing': 
        return <Badge variant="destructive">Missing</Badge>;
      case 'damaged': 
      case 'destroyed':
        return <Badge variant="secondary" className="bg-gray-200 text-gray-700">Destroyed</Badge>;
      default: 
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage equipment availability and status.</p>
        </div>
        <Button onClick={() => { setSelectedItem(null); setIsModalOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
               <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No items found.</TableCell></TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-slate-400" />
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-slate-600">{item.category}</TableCell>
                  <TableCell>
                    <span className="font-bold">{item.quantity}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-sm text-slate-500 max-w-[200px] truncate">
                    {item.notes || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      Edit / Update Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InventoryModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        item={selectedItem}
        onSuccess={loadInventory}
      />
    </div>
  );
}