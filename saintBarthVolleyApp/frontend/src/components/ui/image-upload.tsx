"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      onChange(`http://localhost:5000/uploads/${data.filename}`);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-muted transition"
    >
      {loading ? (
        <p>Upload...</p>
      ) : value ? (
        <Image
          src={value}
          alt="preview"
          className="mx-auto h-32 object-contain"
        />
      ) : (
        <p>Glisse une image ici ou clique</p>
      )}
    </div>
  );
}
