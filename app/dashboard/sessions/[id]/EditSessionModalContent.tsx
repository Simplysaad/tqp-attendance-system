"use client";

import React, { useState, useMemo } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import { QURAN_SURAHS } from "@/lib/surah";
import { IMemorizationRange } from "@/models/session.model";

interface EditSessionModalContentProps {
  initialNewMem?: IMemorizationRange;
  initialRev?: IMemorizationRange;
  onSave: (newMem: IMemorizationRange, rev: IMemorizationRange) => void;
  onClose: () => void;
}

export default function EditSessionModalContent({
  initialNewMem,
  initialRev,
  onSave,
  onClose,
}: EditSessionModalContentProps) {
  // New Memorization State
  const [startSurah, setStartSurah] = useState(initialNewMem?.start?.surah || "");
  const [startAayah, setStartAayah] = useState<number | "">(initialNewMem?.start?.aayah || "");
  const [endSurah, setEndSurah] = useState(initialNewMem?.end?.surah || "");
  const [endAayah, setEndAayah] = useState<number | "">(initialNewMem?.end?.aayah || "");

  const surahOptions = useMemo(
    () => QURAN_SURAHS.map((s) => ({ label: `${s.number}. ${s.name}`, value: s.name })),
    []
  );

  const getMaxAyahs = (surahName: string) => {
    const found = QURAN_SURAHS.find((s) => s.name.toLowerCase() === surahName.toLowerCase());
    return found ? found.totalAayahs : 286;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedNewMem: IMemorizationRange = {
      start: { surah: startSurah, aayah: startAayah ? Number(startAayah) : undefined },
      end: { surah: endSurah, aayah: endAayah ? Number(endAayah) : undefined },
    };

    onSave(updatedNewMem, initialRev || {});
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <p className="text-xs text-gray-500">Correct any mistakes in the student's submitted memorization log.</p>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-700 uppercase">New Memorization Range</h4>

        {/* Start Position */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Surah</label>
            <SearchableSelect options={surahOptions} value={startSurah} onChange={setStartSurah} placeholder="Start Surah" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Aayah</label>
            <input
              type="number"
              min={1}
              max={getMaxAyahs(startSurah)}
              value={startAayah}
              onChange={(e) => setStartAayah(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* End Position */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">End Surah</label>
            <SearchableSelect options={surahOptions} value={endSurah} onChange={setEndSurah} placeholder="End Surah" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">End Aayah</label>
            <input
              type="number"
              min={1}
              max={getMaxAyahs(endSurah)}
              value={endAayah}
              onChange={(e) => setEndAayah(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          Apply Changes
        </button>
      </div>
    </form>
  );
}