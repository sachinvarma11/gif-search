import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function SearchInput({ onChange, placeholder }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
      <Input
        className="pl-10 h-12 text-lg"
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
}
