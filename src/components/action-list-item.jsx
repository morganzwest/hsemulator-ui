import { IoLogoJavascript, IoLogoPython } from 'react-icons/io5'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ActionListItem({ action, active }) {
  const isJs = action.type === 'JavaScript'

  return (
    <Tooltip>
    <TooltipTrigger>
        <button
      type="button"
      aria-current={active ? 'true' : undefined}
      className={`
        group relative w-full rounded-md px-4 py-2.5 text-left
        transition-colors
        hover:bg-muted
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-primary
        ${active ? 'bg-muted' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Language Icon */}
        <div
          className={`
            mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center
            ${isJs ? 'text-yellow-400' : 'text-blue-400'}
            ${!active ? 'opacity-80 group-hover:opacity-100' : ''}
          `}
          title={isJs ? 'JavaScript action' : 'Python action'}
        >
          {isJs ? (
            <IoLogoJavascript className="h-5 w-5" />
          ) : (
            <IoLogoPython className="h-5 w-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* Title */}
          <span className="truncate text-sm font-medium leading-tight">
            {action.title}
          </span>

          {/* Description */}
          <span className="line-clamp-2 text-xs text-muted-foreground">
            {action.description}
          </span>

          {/* Meta */}
          <span className="text-[10px] text-muted-foreground">
            Updated {action.updatedAt}
          </span>
        </div>
      </div>

      {/* Active indicator */}
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-2 h-[calc(100%-16px)] w-0.5 rounded-r bg-primary"
        />
      )}
    </button>
    </TooltipTrigger>
    <TooltipContent>
        <p>Add to library</p>
    </TooltipContent>
    </Tooltip>
  )
}
