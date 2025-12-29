"use client";

import { useState, useEffect } from "react";

interface SizePreset {
    name: string;
    width: number;
    height: number;
}

interface ControlPanelProps {
    onClose: () => void;
}

export default function ControlPanel({ onClose }: ControlPanelProps) {
    const [apiKey, setApiKey] = useState("");
    const [dailyLimit, setDailyLimit] = useState(5);
    const [sizePresets, setSizePresets] = useState<SizePreset[]>([]);
    const [newPresetName, setNewPresetName] = useState("");
    const [newPresetWidth, setNewPresetWidth] = useState(1024);
    const [newPresetHeight, setNewPresetHeight] = useState(1024);

    useEffect(() => {
        // Load settings from localStorage
        const savedApiKey = localStorage.getItem("userApiKey") || "";
        const savedLimit = localStorage.getItem("dailyLimit") || "5";
        const savedPresets = localStorage.getItem("sizePresets") || "[]";

        setApiKey(savedApiKey);
        setDailyLimit(parseInt(savedLimit));
        setSizePresets(JSON.parse(savedPresets));
    }, []);

    const saveApiKey = () => {
        localStorage.setItem("userApiKey", apiKey);
        alert("API Key saved successfully!");
    };

    const saveDailyLimit = () => {
        localStorage.setItem("dailyLimit", dailyLimit.toString());
        alert("Daily limit saved successfully!");
    };

    const addPreset = () => {
        if (!newPresetName.trim()) {
            alert("Please enter a preset name");
            return;
        }
        const newPreset = {
            name: newPresetName,
            width: newPresetWidth,
            height: newPresetHeight,
        };
        const updated = [...sizePresets, newPreset];
        setSizePresets(updated);
        localStorage.setItem("sizePresets", JSON.stringify(updated));
        setNewPresetName("");
        setNewPresetWidth(1024);
        setNewPresetHeight(1024);
    };

    const deletePreset = (index: number) => {
        const updated = sizePresets.filter((_, i) => i !== index);
        setSizePresets(updated);
        localStorage.setItem("sizePresets", JSON.stringify(updated));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Control Panel</h2>
                    <button className="btn btn-sm btn-circle" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* API Key Management */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">API Key Management</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="label">
                                <span className="label-text">Your API Key (Optional)</span>
                            </label>
                            <input
                                type="password"
                                className="input input-bordered w-full"
                                placeholder="Enter your Google API key"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                            <button className="btn btn-primary btn-sm mt-2" onClick={saveApiKey}>
                                Save API Key
                            </button>
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">Daily Generation Limit</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered w-full"
                                placeholder="5"
                                value={dailyLimit}
                                onChange={(e) => setDailyLimit(Number(e.target.value))}
                                min={1}
                            />
                            <button className="btn btn-primary btn-sm mt-2" onClick={saveDailyLimit}>
                                Save Limit
                            </button>
                        </div>
                    </div>
                </div>

                {/* Image Size Profiles */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">Image Size Profiles</h3>

                    {/* Existing Presets */}
                    <div className="mb-4">
                        <label className="label">
                            <span className="label-text">Saved Presets</span>
                        </label>
                        <div className="space-y-2">
                            {sizePresets.map((preset, index) => (
                                <div key={index} className="flex items-center gap-2 bg-base-200 p-2 rounded">
                                    <span className="flex-1">
                                        {preset.name} - {preset.width}x{preset.height}px
                                    </span>
                                    <button
                                        className="btn btn-error btn-xs"
                                        onClick={() => deletePreset(index)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                            {sizePresets.length === 0 && (
                                <p className="text-sm text-gray-500">No presets saved yet</p>
                            )}
                        </div>
                    </div>

                    {/* Add New Preset */}
                    <div className="border-t pt-4">
                        <label className="label">
                            <span className="label-text">Add New Preset</span>
                        </label>
                        <div className="space-y-2">
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="Preset name (e.g., Marketing Blog)"
                                value={newPresetName}
                                onChange={(e) => setNewPresetName(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    className="input input-bordered flex-1"
                                    placeholder="Width"
                                    value={newPresetWidth}
                                    onChange={(e) => setNewPresetWidth(Number(e.target.value))}
                                />
                                <input
                                    type="number"
                                    className="input input-bordered flex-1"
                                    placeholder="Height"
                                    value={newPresetHeight}
                                    onChange={(e) => setNewPresetHeight(Number(e.target.value))}
                                />
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={addPreset}>
                                Add Preset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
