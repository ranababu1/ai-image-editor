"use client";

import { useState } from "react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [format, setFormat] = useState("webp");
  const [resizeOption, setResizeOption] = useState("original");
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setBefore(URL.createObjectURL(selectedFile));
    } else {
      setBefore(null);
    }
  };

  const submit = async () => {
    if (!file || !prompt) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB");
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append("image", file);
    form.append("prompt", prompt);
    form.append("resizeOption", resizeOption);
    if (resizeOption === "resize") {
      form.append("width", width.toString());
      form.append("height", height.toString());
    }
    form.append("format", format);

    try {
      const res = await fetch("/api/edit-image", {
        method: "POST",
        body: form
      });

      const data = await res.json();

      if (data.error) {
        alert(`Error: ${data.error}`);
      } else if (data.image) {
        setAfter(`data:image/${format};base64,${data.image}`);
      }
    } catch (error) {
      alert("Failed to process image. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">
          AI Image Editor
        </h1>

        <div className="grid grid-cols-2 gap-6">
          <div className="card bg-base-100 p-4 min-h-[300px]">
            {before ? <img src={before} /> : "Before"}
          </div>
          <div className="card bg-base-100 p-4 min-h-[300px]">
            {after ? <img src={after} /> : "After"}
          </div>
        </div>

        <div className="card bg-base-100 p-6 space-y-4">
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
            onChange={handleFileChange}
          />

          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Describe the edit you want to make"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />

          <div className="flex gap-4">
            <select
              className="select select-bordered"
              value={resizeOption}
              onChange={e => setResizeOption(e.target.value)}
            >
              <option value="original">Original Size</option>
              <option value="resize">Resize</option>
            </select>

            {resizeOption === "resize" && (
              <>
                <input
                  type="number"
                  className="input input-bordered"
                  placeholder="Width"
                  value={width}
                  onChange={e => setWidth(Number(e.target.value))}
                />
                <input
                  type="number"
                  className="input input-bordered"
                  placeholder="Height"
                  value={height}
                  onChange={e => setHeight(Number(e.target.value))}
                />
              </>
            )}

            <select
              className="select select-bordered"
              value={format}
              onChange={e => setFormat(e.target.value)}
            >
              <option value="webp">WebP</option>
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
            </select>
          </div>

          <button
            className={`btn btn-primary ${loading ? "loading" : ""}`}
            onClick={submit}
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
