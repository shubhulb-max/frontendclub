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
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 1,
    available_quantity: "",
    distributed_quantity: 0,
    missing_quantity: 0,
    destroyed_quantity: 0,
    type: "",
    cost: "",
    description: ""
  });

  useEffect(() => {
    if (!open) return;
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await clubService.getInventoryCategories();
        setCategories(res.data || []);
      } catch (error) {
        console.error("Failed to load inventory categories", error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, [open]);

  useEffect(() => {
    if (!open || item || categories.length === 0 || formData.category) return;
    setFormData((prev) => ({ ...prev, category: String(categories[0].id) }));
  }, [categories, open, item, formData.category]);

  useEffect(() => {
    if (item) {
      const categoryId =
        item.category_detail?.id ??
        (typeof item.category === "object" ? item.category?.id : item.category);
      setFormData({
        name: item.name || "",
        category: categoryId ?? "",
        quantity: item.quantity || 1,
        available_quantity: item.available_quantity ?? "",
        distributed_quantity: item.distributed_quantity ?? 0,
        missing_quantity: item.missing_quantity ?? 0,
        destroyed_quantity: item.destroyed_quantity ?? 0,
        cost: item.cost || "",
        type: item.type || "",
        description: item.description || ""
      });
    } else {
      setFormData({
        name: "",
        category: "",
        quantity: 1,
        available_quantity: "",
        distributed_quantity: 0,
        missing_quantity: 0,
        destroyed_quantity: 0,
        type: "",
        cost: "",
        description: ""
      });
    }
  }, [item, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const toInt = (value) => {
        const parsed = parseInt(value, 10);
        return Number.isNaN(parsed) ? 0 : parsed;
      };

      const quantity = toInt(formData.quantity);
      const distributed = toInt(formData.distributed_quantity);
      const missing = toInt(formData.missing_quantity);
      const destroyed = toInt(formData.destroyed_quantity);
      let available = toInt(formData.available_quantity);

      if (formData.available_quantity === "" || formData.available_quantity === null) {
        const derived = quantity - distributed - missing - destroyed;
        available = derived >= 0 ? derived : 0;
      }

      const categoryId = formData.category ? parseInt(formData.category, 10) : null;
      if (!categoryId) {
        toast.error("Please select a category");
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        category: categoryId,
        quantity,
        available_quantity: available,
        distributed_quantity: distributed,
        missing_quantity: missing,
        destroyed_quantity: destroyed,
        type: formData.type,
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        description: formData.description
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
                value={formData.category ? String(formData.category) : ""}
                onValueChange={(v) => setFormData({...formData, category: v})}
                disabled={categoriesLoading || categories.length === 0}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categoriesLoading && (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  )}
                  {!categoriesLoading && categories.length === 0 && (
                    <SelectItem value="empty" disabled>No categories</SelectItem>
                  )}
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Total Quantity</Label>
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
            <Label>Type</Label>
            <Input
              placeholder="e.g. Match, Practice, Protective"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Available</Label>
              <Input
                type="number"
                min="0"
                value={formData.available_quantity}
                onChange={(e) => setFormData({...formData, available_quantity: e.target.value})}
                placeholder="Auto-calc if blank"
              />
            </div>
            <div className="space-y-2">
              <Label>Distributed</Label>
              <Input
                type="number"
                min="0"
                value={formData.distributed_quantity}
                onChange={(e) => setFormData({...formData, distributed_quantity: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Missing</Label>
              <Input
                type="number"
                min="0"
                value={formData.missing_quantity}
                onChange={(e) => setFormData({...formData, missing_quantity: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Destroyed</Label>
              <Input
                type="number"
                min="0"
                value={formData.destroyed_quantity}
                onChange={(e) => setFormData({...formData, destroyed_quantity: e.target.value})}
              />
            </div>
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
            <Label>Description</Label>
            <Input 
              placeholder="Details about condition, usage, or assignment..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
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
