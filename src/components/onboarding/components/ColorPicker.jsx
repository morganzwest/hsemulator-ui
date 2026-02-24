'use client';

import { cn } from '@/lib/utils';

const COLORS = [
  { id: 'blue', class: 'bg-blue-500', label: 'Blue' },
  { id: 'green', class: 'bg-green-500', label: 'Green' },
  { id: 'purple', class: 'bg-purple-500', label: 'Purple' },
  { id: 'red', class: 'bg-red-500', label: 'Red' },
  { id: 'orange', class: 'bg-orange-500', label: 'Orange' },
  { id: 'yellow', class: 'bg-yellow-500', label: 'Yellow' },
  { id: 'pink', class: 'bg-pink-500', label: 'Pink' },
  { id: 'gray', class: 'bg-gray-500', label: 'Gray' }
];

export default function ColorPicker({ selectedColor, onColorChange, className }) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {COLORS.map(({ id, class: colorClass, label }) => (
        <button
          key={id}
          onClick={() => onColorChange(id)}
          className={cn(
            "w-12 h-12 rounded-full border-2 transition-all hover:scale-110",
            colorClass,
            selectedColor === id
              ? "border-white ring-2 ring-offset-2 ring-offset-background ring-primary"
              : "border-transparent"
          )}
          title={label}
          aria-label={`Select ${label} color`}
        />
      ))}
    </div>
  );
}
