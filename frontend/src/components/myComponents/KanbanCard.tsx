import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  CalendarIcon, AlignLeft, Clock, Tag, Trash2, CheckCircle2, Paperclip, FileIcon, X, Loader2
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export default function KanbanCard({ card, boardId, list = "Todo", refreshBoard }: { card: any, boardId: any, list: any, refreshBoard: any }) {
  const axiosPrivate = useAxiosPrivate();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // console.log("card:", card);

  const hasDescription = card.description && card.description.trim().length > 0;
  // Ensure attachments is always an array to prevent crashes
  const hasAttachments = card.attachments && card.attachments.length > 0;

  const getDateStyles = (dateString: string) => {
    const date = new Date(dateString);
    if (isPast(date) && !isToday(date)) return "bg-red-50 text-red-700 border-red-200";
    if (isToday(date)) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-gray-100 text-black border-transparent";
  };


  const handleDelete = async () => {
    try {
      if (confirm("Are you sure you want to delete this card?")) {
        console.log("boardId:", boardId);
        await axiosPrivate.delete(`/api/cards/${card.id}`, {
          data: {
            boardId: boardId,
          }
        });
        setOpen(false);
        alert("Deleted Sucessfully")
        refreshBoard();
      }
    } catch (error) { console.error("Failed to delete card", error); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large (Max 5MB)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("cardId", card.id);

    setUploading(true);
    try {
      const fileUploadResponse = await axiosPrivate.post("/api/attachments", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("fileUploadResponse:", fileUploadResponse);

      refreshBoard();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload file. Check console for details.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAttachment = async (fileKey: string) => {
    if (!confirm("Delete this attachment?")) return;
    try {
      await axiosPrivate.delete(`/api/attachments/${fileKey}`);
      refreshBoard();
    } catch (err) { console.error(err); }
  };

  const handleOpenFile = async (fileKey: string) => {
    const newWindow = window.open("", "_blank");

    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>Loading...</title></head>
          <body style="background:#f4f5f7; display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; color:#5e6c84;">
            <p>Loading attachment...</p>
          </body>
        </html>
      `);
    }

    try {
      const { data } = await axiosPrivate.get(`/api/attachments/url?key=${fileKey}`);

      if (newWindow) {
        newWindow.location.href = data.url;
      }
    } catch (err) {
      console.error("Failed to open file", err);
      if (newWindow) newWindow.close();
      alert("Could not open file.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className={cn(
          "group relative p-3 space-y-2.5 rounded-lg shadow-sm border-b border-gray-200",
          "cursor-pointer bg-white hover:bg-gray-50 transition-all duration-200",
          "hover:border-blue-400 hover:shadow-md"
        )}>
          <div className="text-sm font-medium text-[#172b4d] leading-snug">
            {card.title}
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              {card.dueDate && (
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border",
                  getDateStyles(card.dueDate)
                )}>
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(card.dueDate), "MMM d")}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 text-gray-400">
              {hasAttachments && <Paperclip className="h-3.5 w-3.5 group-hover:text-gray-600" />}
              {hasDescription && <AlignLeft className="h-3.5 w-3.5 group-hover:text-gray-600" />}
            </div>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-xl sm:p-8 gap-6 bg-white text-[#172b4d] shadow-2xl border-0">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-2">
            <div className="mt-1 text-[#172b4d]">
              <Tag className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold leading-normal text-[#172b4d]">
                {card.title}
              </DialogTitle>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                in list <span className="underline decoration-dotted">{list}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6">

          {/* 1. Description */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlignLeft className="h-4 w-4" /> Description
            </h4>
            <div className={cn(
              "w-full rounded-md p-4 text-sm leading-relaxed",
              "bg-[#091e420f] text-[#172b4d] min-h-[80px]"
            )}>
              {card.description || "Add a more detailed description..."}
            </div>
          </div>

          {/* 2. Attachments */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Paperclip className="h-4 w-4" /> Attachments
            </h4>

            <div className="space-y-2 mb-3">
              {hasAttachments ? (
                card.attachments.map((att: any) => (
                  <div key={att.id} className="flex items-center justify-between p-2 rounded hover:bg-slate-100 transition group border border-transparent hover:border-gray-200">
                    <div
                      className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1"
                      onClick={() => handleOpenFile(att.fileKey)}
                    >
                      <div className="bg-slate-200 p-2 rounded text-slate-600">
                        <FileIcon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-medium truncate text-[#172b4d]">{att.fileName}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{att.fileType ? att.fileType.split('/')[1] : 'FILE'}</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteAttachment(att.fileKey)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400 italic px-1">No attachments yet.</div>
              )}
            </div>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Paperclip className="mr-2 h-4 w-4" />}
                {uploading ? "Uploading..." : "Add an attachment"}
              </Button>
            </div>
          </div>

          {/* 3. Date */}
          {card.dueDate && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" /> Due Date
              </h4>
              <div className="flex items-center gap-3 p-3 rounded bg-[#091e420f]">
                <div className="p-1 rounded text-gray-500">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#172b4d]">
                    {format(new Date(card.dueDate), "PPPP")}
                  </span>
                  <span className="text-xs text-gray-500">
                    {isPast(new Date(card.dueDate)) && !isToday(new Date(card.dueDate)) ? "Overdue" : "Scheduled"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
          <Button
            variant="destructive"
            size="sm"
            className="bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none font-medium"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Card
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
