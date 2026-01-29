"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";
import { Target, PiggyBank, Wallet, Car, Home, Plane, GraduationCap, Heart } from "lucide-react";

interface GoalFormData {
  name: string;
  targetAmount: number;
  targetDate: Date;
  icon: string;
  color: string;
}

interface AddGoalDialogProps {
  goal?: {
    id: string;
    name: string;
    targetAmount: number;
    targetDate: Date;
    icon: string;
    color: string;
  };
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ICON_OPTIONS = [
  { value: "Target", icon: Target, label: "Target" },
  { value: "PiggyBank", icon: PiggyBank, label: "Savings" },
  { value: "Wallet", icon: Wallet, label: "Wallet" },
  { value: "Car", icon: Car, label: "Car" },
  { value: "Home", icon: Home, label: "Home" },
  { value: "Plane", icon: Plane, label: "Travel" },
  { value: "GraduationCap", icon: GraduationCap, label: "Education" },
  { value: "Heart", icon: Heart, label: "Health" },
];

const COLOR_OPTIONS = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#ec4899", label: "Pink" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Orange" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#84cc16", label: "Lime" },
];

export function AddGoalDialog({ goal, children, open: controlledOpen, onOpenChange }: AddGoalDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [icon, setIcon] = useState("Target");
  const [color, setColor] = useState("#6366f1");
  const utils = trpc.useUtils();

  useEffect(() => {
    if (goal) {
      setTimeout(() => {
        setName(goal.name);
        setTargetAmount(goal.targetAmount.toString());
        setTargetDate(goal.targetDate.toISOString().split('T')[0]);
        setIcon(goal.icon);
        setColor(goal.color);
      }, 0);
    } else if (!controlledOpen) {
      setTimeout(() => {
        setName("");
        setTargetAmount("");
        setTargetDate("");
        setIcon("Target");
        setColor("#6366f1");
      }, 0);
    }
  }, [goal, controlledOpen]);

  const createMutation = trpc.goals.create.useMutation({
    onSuccess: () => {
      toast.success("Goal created successfully");
      utils.goals.invalidate();
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to create goal");
    },
  });

  const updateMutation = trpc.goals.update.useMutation({
    onSuccess: () => {
      toast.success("Goal updated successfully");
      utils.goals.invalidate();
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to update goal");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: GoalFormData = {
      name,
      targetAmount: parseFloat(targetAmount),
      targetDate: new Date(targetDate),
      icon,
      color,
    };

    if (goal) {
      updateMutation.mutate({ id: goal.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{goal ? "Edit Savings Goal" : "Create Savings Goal"}</DialogTitle>
            <DialogDescription>
              {goal ? "Update your savings goal details" : "Set a new savings target to track"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name</Label>
              <Input
                id="name"
                placeholder="Vacation Fund"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Target Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Target Date</Label>
              <Input
                id="date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-4 gap-2">
                {ICON_OPTIONS.map((opt) => {
                  const OptIcon = opt.icon;
                  return (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={icon === opt.value ? "default" : "outline"}
                      className="h-12"
                      onClick={() => setIcon(opt.value)}
                    >
                      <OptIcon className="h-5 w-5" />
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-8 gap-2">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`h-8 rounded-full border-2 ${
                      color === opt.value ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: opt.value }}
                    onClick={() => setColor(opt.value)}
                    title={opt.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : goal ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
