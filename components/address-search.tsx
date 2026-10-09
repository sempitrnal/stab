"use client";

import { useState } from "react";

export interface ParsedAddress {
  street: string;
  city: string;
  province: string;
  postal: string;
  country: string;
}

interface NomResult {
  place_id: number;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    region?: string;
    county?: string;
    postcode?: string;
    country?: string;
  };
}

function parse(r: NomResult): ParsedAddress {
  const a = r.address;
  return {
    street: [a.house_number, a.road ?? a.suburb ?? a.neighbourhood]
      .filter(Boolean)
      .join(" "),
    city: a.city ?? a.town ?? a.village ?? a.municipality ?? "",
    province: a.state ?? a.region ?? a.county ?? "",
    postal: a.postcode ?? "",
    country: a.country ?? "",
  };
}

const inputCls =
  "w-full rounded-md bg-paper px-3 h-10 text-xs placeholder:text-faded focus:outline-none";

export default function AddressSearch({
  onSelect,
}: {
  onSelect: (a: ParsedAddress) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NomResult[] | null>(null);
  const [searching, setSearching] = useState(false);

  async function search() {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(q)}`,
      );
      setResults(await res.json());
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
          }}
          placeholder="Search your address"
          className={inputCls}
        />
        <button
          type="button"
          onClick={search}
          disabled={searching}
          className="shrink-0 rounded-md bg-ink text-paper px-4 tag hover:bg-accent transition-colors disabled:opacity-50"
        >
          {searching ? "…" : "Find"}
        </button>
      </div>
      {results !== null && (
        <ul className="rounded-md bg-paper overflow-hidden">
          {results.map((r) => (
            <li key={r.place_id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(parse(r));
                  setResults(null);
                }}
                className="w-full text-left px-3 py-2.5 text-[10px] tracking-wider uppercase hover:bg-bone transition-colors"
              >
                {r.display_name}
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-3 py-2.5 tag text-faded">
              No matches, type it manually below
            </li>
          )}
        </ul>
      )}
      <p className="tag text-faded">
        Pick a result to autofill, or type it manually
      </p>
    </div>
  );
}
