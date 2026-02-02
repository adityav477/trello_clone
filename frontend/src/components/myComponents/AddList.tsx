import { useState } from "react";
import { Plus, List as ListIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

interface AddListProps {
  boardId: string;
  onListAdded: (newList: any) => void;
}

export default function AddList({ boardId, onListAdded }: AddListProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  const handleCreateList = async () => {
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const { data } = await axiosPrivate.post("/api/lists", {
        title: title,
        boardId: boardId,
      });

      const newList = { ...data, cards: [] };

      onListAdded(newList);

      setOpen(false);
      setTitle("");
    } catch (error) {
      console.error("Failed to create list", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start h-12 bg-white/20 hover:bg-white/30 text-white font-medium backdrop-blur-sm transition-all"
        >
          <Plus className="mr-2 h-4 w-4" /> Add another list
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px] bg-white text-[#172b4d]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListIcon className="h-5 w-5 text-blue-600" />
            Create new list
          </DialogTitle>
          <DialogDescription>
            Give your list a name (e.g. "To Do", "Backlog").
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <Input
            id="title"
            placeholder="Enter list title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
            autoFocus
            className="col-span-3 font-medium"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateList}
            disabled={isLoading || !title.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              "Create List"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
