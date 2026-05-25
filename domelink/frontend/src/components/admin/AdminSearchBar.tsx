import { Input } from "@/components/ui/input";
import { useState } from "react";

interface AdminSearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
}

export function AdminSearchBar({ placeholder = "Search...", onSearch }: AdminSearchBarProps) {
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSearch(value.trim());
      }}
      className="flex gap-2 items-center mb-4"
    >
      <Input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="max-w-xs"
        autoFocus
      />
      <button type="submit" className="dome-button-outline px-4 py-2">
        Search
      </button>
      {value && (
        <button
          type="button"
          className="dome-button-outline px-2 py-2"
          onClick={() => {
            setValue("");
            onSearch("");
          }}
        >
          Clear
        </button>
      )}
    </form>
  );
}
