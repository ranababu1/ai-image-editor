"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import ControlPanel from "./components/ControlPanel";
import Toast, { ToastType } from "./components/Toast";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { getEncryptedItem, setEncryptedItem } from "./lib/encryption";

interface SizePreset {
  name: string;
  width: number;
  height: number;
}

interface ToastMessage {
  message: string;
  type: ToastType;
}

export default function Page() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [format, setFormat] = useState("webp");
  const [resizeOption, setResizeOption] = useState("original");
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [loading, setLoading] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [quotaUsed, setQuotaUsed] = useState(0);
  const [quotaLimit, setQuotaLimit] = useState(5);
  const [sizePresets, setSizePresets] = useState<SizePreset[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  useEffect(() => {
    // Load presets from encrypted localStorage
    const savedPresets = getEncryptedItem("sizePresets") || [];
    setSizePresets(savedPresets);

    // Load daily limit from encrypted localStorage
    const savedLimit = getEncryptedItem("dailyLimit") || 5;
    setQuotaLimit(savedLimit);
  }, []);

  useEffect(() => {
    if (session) {
      fetchQuota();
    }
  }, [session]);

  const fetchQuota = async () => {
    try {
      const customLimit = getEncryptedItem("dailyLimit") || 5;
      const res = await fetch(`/api/quota?customLimit=${customLimit}`);
      const data = await res.json();
      if (data.used !== undefined) {
        setQuotaUsed(data.used);
        setQuotaLimit(data.limit);
      }
    } catch (error) {
      console.error("Failed to fetch quota:", error);
      showToast("Failed to fetch quota information", "error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setBefore(URL.createObjectURL(selectedFile));
      setAfter(null); // Clear previous result
    } else {
      setBefore(null);
    }
  };

  const handleDownload = () => {
    if (!after) return;

    const link = document.createElement("a");
    link.href = after;
    link.download = `intelligent-editor-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Image downloaded successfully!", "success");
  };

  const handlePresetChange = (value: string) => {
    setResizeOption(value);

    if (value !== "original" && value !== "resize") {
      // It's a preset
      const preset = sizePresets.find(p => p.name === value);
      if (preset) {
        setWidth(preset.width);
        setHeight(preset.height);
      }
    }
  };

  const submit = async () => {
    if (!file || !prompt) {
      showToast("Please upload an image and enter a prompt", "warning");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be under 2MB. Please upload a smaller file.", "error");
      return;
    }

    // Check quota before making request (don't increment yet)
    const customLimit = getEncryptedItem("dailyLimit") || 5;
    const quotaRes = await fetch("/api/quota", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customLimit, increment: false }),
    });

    const quotaData = await quotaRes.json();

    if (!quotaRes.ok) {
      showToast(
        `Daily quota exceeded! You've used ${quotaData.used}/${quotaData.limit} generations today. Reset at midnight or add your own API key in Settings.`,
        "error"
      );
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append("image", file);
    form.append("prompt", prompt);

    // Determine resize option based on selection
    if (resizeOption === "original") {
      form.append("resizeOption", "original");
    } else {
      form.append("resizeOption", "resize");
      form.append("width", width.toString());
      form.append("height", height.toString());
    }

    form.append("format", format);

    // Use custom API key if provided
    const userApiKey = getEncryptedItem("userApiKey");
    if (userApiKey) {
      form.append("apiKey", userApiKey);
    }

    try {
      const res = await fetch("/api/edit-image", {
        method: "POST",
        body: form
      });

      const data = await res.json();

      if (data.error) {
        // API error handling with specific messages
        if (data.error.includes("API key") || data.error.includes("api_key")) {
          showToast(
            "API Key issue: " + data.error + ". Please check your API key in Settings.",
            "error"
          );
        } else if (data.error.includes("quota") || data.error.includes("limit")) {
          showToast(
            "API quota exceeded: " + data.error + ". Try using your own API key in Settings for unlimited access.",
            "error"
          );
        } else {
          showToast("Error: " + data.error, "error");
        }
      } else if (data.image) {
        // SUCCESS! Now increment the quota
        await fetch("/api/quota", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customLimit, increment: true }),
        });

        // Fetch updated quota
        await fetchQuota();

        setAfter(`data:image/${format};base64,${data.image}`);
        showToast("Image generated successfully! 🎨", "success");
      }
    } catch (error) {
      showToast(
        "Network error: Failed to connect to the server. Please check your connection and try again.",
        "error"
      );
    }

    setLoading(false);
  };

  const handleControlPanelSave = (message: string) => {
    showToast(message, "success");
    // Reload presets and limit
    const savedPresets = getEncryptedItem("sizePresets") || [];
    setSizePresets(savedPresets);
    const savedLimit = getEncryptedItem("dailyLimit") || 5;
    setQuotaLimit(savedLimit);
  };

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in page if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
        <div className="card bg-base-100 shadow-xl max-w-md w-full p-8">
          <h1 className="text-4xl font-bold text-center mb-2">Intelligent Editor</h1>
          <p className="text-center text-gray-500 mb-8">AI-assisted image creation and editing on the fly</p>

          <div className="text-center mb-6">
            <p className="mb-4">Sign in with Google to get started</p>
            <p className="text-sm text-gray-500">Free tier: 5 generations per day</p>
          </div>

          <button
            className="btn btn-primary btn-lg w-full"
            onClick={() => signIn("google")}
          >
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 pb-12 space-y-6">
        {/* Header with User Info */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Intelligent Editor</h1>
            <p className="text-sm text-gray-500">AI-assisted image creation and editing on the fly</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">
                Quota: {quotaUsed}/{quotaLimit} used
              </p>
              <p className="text-xs text-gray-500">{session.user?.email}</p>
            </div>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setShowControlPanel(true)}
            >
              ⚙️ Settings
            </button>
            <button className="btn btn-sm btn-error" onClick={() => signOut()}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Image Preview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-base-100 p-4 min-h-[300px] relative shadow-xl">
            {before ? (
              <img src={before} alt="Before" className="w-full h-full object-contain rounded-lg" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Before</p>
                </div>
              </div>
            )}
          </div>
          <div className="card bg-base-100 p-4 min-h-[300px] relative shadow-xl">
            {after ? (
              <>
                <img src={after} alt="After" className="w-full h-full object-contain rounded-lg" />
                <button
                  className="btn btn-primary btn-sm absolute top-6 right-6 gap-2"
                  onClick={handleDownload}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p>After</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Control Form */}
        <div className="card bg-base-100 p-6 space-y-4 shadow-xl">
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
            onChange={handleFileChange}
          />

          <textarea
            className="textarea textarea-bordered w-full h-24"
            placeholder="Describe the image you want to create (e.g., 'a futuristic city with neon lights')"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />

          <div className="flex gap-4 flex-wrap">
            <select
              className="select select-bordered flex-1 min-w-[200px]"
              value={resizeOption}
              onChange={e => handlePresetChange(e.target.value)}
            >
              <option value="original">Original Size</option>
              <option value="resize">Custom Resize</option>
              {sizePresets.map((preset, index) => (
                <option key={index} value={preset.name}>
                  {preset.name} ({preset.width}x{preset.height})
                </option>
              ))}
            </select>

            {(resizeOption === "resize" || sizePresets.some(p => p.name === resizeOption)) && (
              <>
                <input
                  type="number"
                  className="input input-bordered w-32"
                  placeholder="Width"
                  value={width}
                  onChange={e => setWidth(Number(e.target.value))}
                />
                <input
                  type="number"
                  className="input input-bordered w-32"
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
            className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
            onClick={submit}
            disabled={loading || quotaUsed >= quotaLimit}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner"></span>
                Generating...
              </>
            ) : (
              `Generate (${quotaUsed}/${quotaLimit} used)`
            )}
          </button>
        </div>
      </div>

      <Footer />

      {showControlPanel && (
        <ControlPanel
          onClose={() => setShowControlPanel(false)}
          onSave={handleControlPanelSave}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
}
