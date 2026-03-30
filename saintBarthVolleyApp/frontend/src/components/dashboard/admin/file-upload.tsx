"use client";

import { useState, useId } from "react";

interface Props {
  onUpload: (file: File) => void;
}

export function FileUpload({ onUpload }: Props) {
  const [loading, setLoading] = useState(false);
  const inputId = useId(); // 🔥 ID UNIQUE

  const handleFiles = async (file: File) => {
    setLoading(true);
    try {
      await onUpload(file);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFiles(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    handleFiles(e.target.files[0]);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-muted transition"
    >
      <input
        type="file"
        onChange={handleChange}
        className="hidden"
        id={inputId} // 🔥 unique
      />

      {loading ? (
        <p>Upload...</p>
      ) : (
        <label htmlFor={inputId} className="cursor-pointer">
          Glisse une image ici ou clique
        </label>
      )}
    </div>
  );
}
