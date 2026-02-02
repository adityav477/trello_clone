import { useState } from "react";
import { Plus, Calendar as CalendarIcon, AlignLeft, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export default function KanbanCardCreator({ listId, onCardAdded, listLength }: { listId: string, onCardAdded: (card: any) => void, listLength: number }) {
  // console.log("listLength:", listLength);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(""); // stores YYYY-MM-DD string

  const axiosPrivate = useAxiosPrivate();

  const handleAddCard = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        order: listLength,
        listId,
        ...(dueDate && { dueDate: new Date(dueDate).toISOString() })
      };
      console.log("payload:", payload);

      const { data } = await axiosPrivate.post(`/api/cards`, payload);

      onCardAdded(data);

      setOpen(false);
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (err) {
      console.error("Failed to create card", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" /> Add a card
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] bg-white text-[#172b4d]">
        <DialogHeader>
          <DialogTitle>Create Card</DialogTitle>
          <DialogDescription>
            Add a new task to this list.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">

          <div className="grid gap-2">
            <Label htmlFor="title" className="flex items-center gap-2 text-gray-500">
              <Type className="h-4 w-4" /> Card Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., Fix Navigation Bug"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3 font-medium"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc" className="flex items-center gap-2 text-gray-500">
              <AlignLeft className="h-4 w-4" /> Description
            </Label>
            <Textarea
              id="desc"
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none min-h-[80px]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date" className="flex items-center gap-2 text-gray-500">
              <CalendarIcon className="h-4 w-4" /> Due Date
            </Label>
            <Input
              id="date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="block w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddCard} disabled={loading || !title.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? "Adding..." : "Add Card"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
