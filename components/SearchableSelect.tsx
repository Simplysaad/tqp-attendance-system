"use client";

import { useState, useRef, useEffect, useMemo } from "react";

export interface SearchableOption {
    label: string;
    value: string;
}

interface SearchableSelectProps {
    options: (string | SearchableOption)[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    name?: string; // For native form submissions
    required?: boolean;
    className?: string;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Select an option...",
    name,
    required = false,
    className = "",
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedValue, setSelectedValue] = useState(value || "");
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync state with incoming value prop changes
    useEffect(() => {
        if (value !== undefined) {
            setSelectedValue(value);
        }
    }, [value]);

    // Normalize input options array into uniform { label, value } objects
    const normalizedOptions: SearchableOption[] = useMemo(() => {
        return options.map((opt) =>
            typeof opt === "string" ? { label: opt, value: opt } : opt
        );
    }, [options]);

    // Filter options based on search input
    const filteredOptions = useMemo(() => {
        if (!search.trim()) return normalizedOptions;
        return normalizedOptions.filter((opt) =>
            opt.label.toLowerCase().includes(search.toLowerCase())
        );
    }, [normalizedOptions, search]);

    // Active option label for display
    const selectedOption = normalizedOptions.find(
        (opt) => opt.value === selectedValue
    );

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        setSelectedValue(optionValue);
        if (onChange) onChange(optionValue);
        setIsOpen(false);
        setSearch("");
    };

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            {/* Hidden Input for standard FormData submission */}
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={selectedValue}
                    required={required}
                />
            )}

            {/* Main Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between border border-emerald-900/20 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800 text-left"
            >
                <span className={selectedOption ? "text-emerald-950 font-medium" : "text-gray-400"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="text-gray-400 text-xs ml-2">▼</span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-emerald-900/15 bg-white shadow-lg overflow-hidden">
                    {/* Search Input Box */}
                    <div className="p-2 border-b border-emerald-900/10 bg-emerald-50/30">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            autoFocus
                            className="w-full border border-emerald-900/20 p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                        />
                    </div>

                    {/* Options List */}
                    <ul className="max-h-56 overflow-y-auto py-1 text-sm">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => {
                                const isSelected = opt.value === selectedValue;
                                return (
                                    <li
                                        key={opt.value}
                                        onClick={() => handleSelect(opt.value)}
                                        className={`px-3 py-2 cursor-pointer transition flex items-center justify-between ${isSelected
                                            ? "bg-emerald-100/70 text-emerald-950 font-medium"
                                            : "text-gray-700 hover:bg-emerald-50"
                                            }`}
                                    >
                                        <span>{opt.label}</span>
                                        {isSelected && (
                                            <span className="text-emerald-800 font-bold text-xs">✓</span>
                                        )}
                                    </li>
                                );
                            })
                        ) : (
                            <li className="px-3 py-3 text-xs text-gray-500 text-center">
                                No matching options found
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}