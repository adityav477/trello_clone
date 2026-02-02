import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Layout, Clock } from "lucide-react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  const [boards, setBoards] = useState<any[]>([]);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const { data } = await axiosPrivate.get("/api/boards");
        setBoards(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBoards();
  }, []);

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;
    setLoading(true);
    try {
      const { data } = await axiosPrivate.post("/api/boards", { title: newBoardTitle });
      setBoards([...boards, data]);
      setOpen(false);
      setNewBoardTitle("");
    } catch (err) {
      alert("Failed to create board");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Workspaces</h1>
          <p className="text-muted-foreground">Manage projects and track tasks across your boards.</p>
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {/* Create New Board Button */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="group relative flex h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white/50 hover:bg-white hover:border-blue-500 hover:shadow-md transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <div className="rounded-full bg-gray-100 p-3 group-hover:bg-blue-50 transition-colors">
                  <Plus className="h-6 w-6 text-gray-500 group-hover:text-blue-600" />
                </div>
                <span className="font-medium text-gray-600 group-hover:text-blue-700">Create New Board</span>
              </button>
            </DialogTrigger>

            {/* Clean Dialog Design */}
            <DialogContent className="sm:max-w-[425px] bg-white">
              <DialogHeader>
                <DialogTitle>Create Board</DialogTitle>
                <DialogDescription>
                  Give your new board a name to get started.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Board Title</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Marketing Campaign Q1"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    className="col-span-3"
                    autoFocus
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateBoard}
                  disabled={loading || !newBoardTitle.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? "Creating..." : "Create Board"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Existing Boards Cards */}
          {boards.map((board) => (
            <Link to={`/board/${board.id}`} key={board.id} className="block group">
              <Card className="h-36 relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-gray-200 bg-white group-hover:border-blue-200/60">
                {/* Decorative top gradient bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardHeader className="p-5 pb-2">
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-gray-800 truncate leading-tight group-hover:text-blue-700 transition-colors">
                      {board.title}
                    </span>
                    <Layout className="h-5 w-5 text-gray-400 shrink-0 group-hover:text-blue-500 transition-colors" />
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 pt-2">
                  <div className="flex items-center text-xs text-gray-400 gap-1.5 mt-auto">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Updated recently</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

        </div>
      </div>
    </div>
  );
}
