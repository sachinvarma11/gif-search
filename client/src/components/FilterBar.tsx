import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  rating: string;
  onRatingChange: (value: string) => void;
  className?: string;
}

export default function FilterBar({ rating, onRatingChange, className = "" }: FilterBarProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rating:</span>
        <Select value={rating} onValueChange={onRatingChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="g">G</SelectItem>
            <SelectItem value="pg">PG</SelectItem>
            <SelectItem value="pg-13">PG-13</SelectItem>
            <SelectItem value="r">R</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
