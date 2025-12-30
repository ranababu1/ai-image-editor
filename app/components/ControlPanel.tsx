"use client";

import { useState, useEffect } from "react";
import { setEncryptedItem, getEncryptedItem } from "../lib/encryption";

interface SizePreset {
    name: string;
    width: number;
    height: number;
}

interface ControlPanelProps {
    onClose: () => void;
    onSave: (message: string) => void;
}

export default function ControlPanel({ onClose, onSave }: ControlPanelProps) {
    const [activeTab, setActiveTab] = useState<"api" | "presets">("api");
    const [apiKey, setApiKey] = useState("");
    const [dailyLimit, setDailyLimit] = useState(5);
    const [sizePresets, setSizePresets] = useState<SizePreset[]>([]);
    const [newPresetName, setNewPresetName] = useState("");
    const [newPresetWidth, setNewPresetWidth] = useState(1024);
    const [newPresetHeight, setNewPresetHeight] = useState(1024);
    const [showApiKey, setShowApiKey] = useState(false);

    useEffect(() => {
        // Load encrypted settings from localStorage
        const savedApiKey = getEncryptedItem("userApiKey") || "";
        const savedLimit = getEncryptedItem("dailyLimit") || 5;
        const savedPresets = getEncryptedItem("sizePresets") || [];

        setApiKey(savedApiKey);
        setDailyLimit(savedLimit);
        setSizePresets(savedPresets);
    }, []);

    const saveApiKey = () => {
        setEncryptedItem("userApiKey", apiKey);
        onSave("API Key saved successfully! Your key is encrypted and stored securely.");
    };

    const saveDailyLimit = () => {
        setEncryptedItem("dailyLimit", dailyLimit);
        onSave(`Daily limit updated to ${dailyLimit} generations per day.`);
    };

    const addPreset = () => {
        if (!newPresetName.trim()) {
            onSave("Please enter a preset name");
            return;
        }
        const newPreset = {
            name: newPresetName,
            width: newPresetWidth,
            height: newPresetHeight,
        };
        const updated = [...sizePresets, newPreset];
        setSizePresets(updated);
        setEncryptedItem("sizePresets", updated);
        setNewPresetName("");
        setNewPresetWidth(1024);
        setNewPresetHeight(1024);
        onSave(`Preset "${newPresetName}" added successfully!`);
    };

    const deletePreset = (index: number) => {
        const presetName = sizePresets[index].name;
        const updated = sizePresets.filter((_, i) => i !== index);
        setSizePresets(updated);
        setEncryptedItem("sizePresets", updated);
        onSave(`Preset "${presetName}" deleted.`);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden border border-base-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-content">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Settings</h2>
                            <p className="text-sm opacity-90 mt-1">Customize your editor experience</p>
                        </div>
                        <button
                            className="btn btn-sm btn-circle btn-ghost hover:bg-white/20"
                            onClick={onClose}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs tabs-boxed bg-base-200 p-2 justify-center">
                    <button
                        className={`tab tab-lg ${activeTab === "api" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("api")}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        API & Quota
                    </button>
                    <button
                        className={`tab tab-lg ${activeTab === "presets" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("presets")}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Size Presets
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
                    {activeTab === "api" && (
                        <div className="space-y-6">
                            {/* API Key Section */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h3 className="card-title text-lg flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                        API Key
                                    </h3>
                                    <p className="text-sm text-base-content/70">
                                        Use your own Google Gemini API key for unlimited generations
                                    </p>

                                    <div className="form-control mt-4">
                                        <div className="relative">
                                            <input
                                                type={showApiKey ? "text" : "password"}
                                                className="input input-bordered w-full pr-20"
                                                placeholder="Enter your Google API key"
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                            />
                                            <button
                                                className="btn btn-ghost btn-sm absolute right-1 top-1"
                                                onClick={() => setShowApiKey(!showApiKey)}
                                            >
                                                {showApiKey ? "🙈" : "👁️"}
                                            </button>
                                        </div>
                                        <label className="label">
                                            <span className="label-text-alt">🔒 Encrypted and stored locally</span>
                                            <span className="label-text-alt text-base-content/50">Get your own API key</span>
                                        </label>
                                    </div>

                                    <button className="btn btn-primary" onClick={saveApiKey}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Save API Key
                                    </button>
                                </div>
                            </div>

                            {/* Daily Limit Section */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h3 className="card-title text-lg flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        Daily Quota Limit
                                    </h3>
                                    <p className="text-sm text-base-content/70">
                                        Set your preferred daily generation limit
                                    </p>

                                    <div className="form-control mt-4">
                                        <input
                                            type="number"
                                            className="input input-bordered w-full"
                                            value={dailyLimit}
                                            onChange={(e) => setDailyLimit(Number(e.target.value))}
                                            min={1}
                                            max={100}
                                        />
                                        <label className="label">
                                            <span className="label-text-alt">Minimum: 1 | Recommended: 5-20</span>
                                        </label>
                                    </div>

                                    <button className="btn btn-primary" onClick={saveDailyLimit}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Update Limit
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "presets" && (
                        <div className="space-y-6">
                            {/* Saved Presets */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h3 className="card-title text-lg">Saved Presets</h3>
                                    <p className="text-sm text-base-content/70 mb-4">
                                        Manage your custom image size presets
                                    </p>

                                    {sizePresets.length === 0 ? (
                                        <div className="text-center py-8 text-base-content/50">
                                            <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p>No presets yet. Create your first one below!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {sizePresets.map((preset, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-3 p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                                                >
                                                    <div className="avatar placeholder">
                                                        <div className="bg-primary text-primary-content rounded-lg w-12">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold">{preset.name}</p>
                                                        <p className="text-sm text-base-content/70">
                                                            {preset.width} × {preset.height}px
                                                        </p>
                                                    </div>
                                                    <button
                                                        className="btn btn-error btn-sm gap-2"
                                                        onClick={() => deletePreset(index)}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Add New Preset */}
                            <div className="card bg-base-100 shadow-xl border-2 border-primary/20">
                                <div className="card-body">
                                    <h3 className="card-title text-lg flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Create New Preset
                                    </h3>

                                    <div className="space-y-4 mt-4">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-semibold">Preset Name</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="input input-bordered"
                                                placeholder="e.g., Instagram Post, Blog Header"
                                                value={newPresetName}
                                                onChange={(e) => setNewPresetName(e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-semibold">Width (px)</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    className="input input-bordered"
                                                    placeholder="1024"
                                                    value={newPresetWidth}
                                                    onChange={(e) => setNewPresetWidth(Number(e.target.value))}
                                                    min={1}
                                                />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-semibold">Height (px)</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    className="input input-bordered"
                                                    placeholder="1024"
                                                    value={newPresetHeight}
                                                    onChange={(e) => setNewPresetHeight(Number(e.target.value))}
                                                    min={1}
                                                />
                                            </div>
                                        </div>

                                        <button className="btn btn-primary w-full" onClick={addPreset}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add Preset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
