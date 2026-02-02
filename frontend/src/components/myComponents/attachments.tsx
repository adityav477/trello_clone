import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";

export const AttachmentComponent = () => {
  const [file, setFile] = useState<File | null>();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files != null && e.target.files[0] != null) {
      setFile(e.target.files[0]);
    }
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submitted");

    if (file) {
      console.log("file read to upload:", file.name);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await axios.post("http://localhost:3000/api/posts", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        console.log("response:", response);
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} encType="multipart/form-data">
        <div className="grid w-full max-w-sm items-center gap-3">
          <Label htmlFor="picture">Upload File</Label>
          <Input id="picture" type="file" name="file" onChange={handleFileChange} />
          <Button type="submit">Upload</Button>
        </div>
      </form>
    </>
  )
}
