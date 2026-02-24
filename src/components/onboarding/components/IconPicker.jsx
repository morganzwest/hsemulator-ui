'use client';

import { cn } from '@/lib/utils';

const ICONS = [
  { id: 'briefcase', icon: '💼', label: 'Business' },
  { id: 'building', icon: '🏢', label: 'Office' },
  { id: 'rocket', icon: '🚀', label: 'Startup' },
  { id: 'star', icon: '⭐', label: 'Premium' },
  { id: 'heart', icon: '❤️', label: 'Personal' },
  { id: 'bolt', icon: '⚡', label: 'Fast' },
  { id: 'shield', icon: '🛡️', label: 'Secure' },
  { id: 'code', icon: '💻', label: 'Tech' },
  { id: 'database', icon: '🗄️', label: 'Data' },
  { id: 'cloud', icon: '☁️', label: 'Cloud' },
  { id: 'settings', icon: '⚙️', label: 'System' },
  { id: 'chart', icon: '📊', label: 'Analytics' }
];

export default function IconPicker({ selectedIcon, onIconChange, className }) {
  return (
    <div className={cn("grid grid-cols-4 gap-3", className)}>
      {ICONS.map(({ id, icon, label }) => (
        <button
          key={id}
          onClick={() => onIconChange(id)}
          className={cn(
            "p-4 rounded-lg border-2 transition-all hover:scale-105",
            "flex flex-col items-center justify-center gap-2",
            selectedIcon === id
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50"
          )}
          title={label}
        >
          <span className="text-2xl">{icon}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </button>
      ))}
    </div>
  );
}
