import { Separator } from '@/components/ui/separator'
import {
  ScrollArea,
  ScrollBar,
} from '@/components/ui/scroll-area'

export function SettingsPage({ title, description, children }) {
  return (
    <div className="flex h-full flex-col px-8 py-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>

        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <Separator className="my-4" />

      {/* Scrollable content */}
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-6">
          {children}
        </div>

        {/* Optional explicit scrollbar for consistent visibility */}
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  )
}
