"use client";
import React, { useEffect, useState } from 'react';
import { clubService } from '@/services/clubService';
import InventoryModal from "@/components/ui/InventoryModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Package, Search, Plus } from "lucide-react";

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

  const getCategoryName = (item) =>
    item.category_detail?.name ||
    item.category_name ||
    (typeof item.category === "string" ? item.category : "");

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    getCategoryName(i).toLowerCase().includes(searchTerm.toLowerCase())
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
              <TableHead>Total</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Distributed</TableHead>
              <TableHead>Missing</TableHead>
              <TableHead>Destroyed</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
               <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No items found.</TableCell></TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-slate-400" />
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{getCategoryName(item) || "-"}</TableCell>
                  <TableCell>
                    <span className="font-bold">{item.quantity}</span>
                  </TableCell>
                  <TableCell>{item.available_quantity ?? "-"}</TableCell>
                  <TableCell>{item.distributed_quantity ?? "-"}</TableCell>
                  <TableCell>{item.missing_quantity ?? "-"}</TableCell>
                  <TableCell>{item.destroyed_quantity ?? "-"}</TableCell>
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
