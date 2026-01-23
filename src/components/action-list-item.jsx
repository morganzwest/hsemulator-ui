import { IoLogoJavascript, IoLogoPython } from 'react-icons/io5'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ActionMenu } from "@/components/action-menu"


export function ActionListItem({ action, active, onClick }) {
  const isJs = action.type === 'JavaScript'

  function handleClick() {
    onClick?.()
  }

  return (
    <div
      role="button"
      aria-current={active ? 'true' : undefined}
      className={`
        group/action relative w-full rounded-md px-4 py-2.5 text-left
        transition-colors
        hover:bg-muted/50
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-primary
        cursor-pointer
        ${active ? 'bg-muted' : ''}
      `}
      onClick={handleClick}
    >
      <ActionMenu action={action} />

      <div className="flex items-start gap-3">
        <div
          className={`
            mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center
            ${isJs ? 'text-yellow-400' : 'text-blue-400'}
            ${!active ? 'opacity-80 group-hover/action:opacity-100' : ''}
          `}
        >
          {isJs ? (
            <IoLogoJavascript className="h-5 w-5" />
          ) : (
            <IoLogoPython className="h-5 w-5" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-sm font-medium leading-tight">
            {action.title}
          </span>

          <span className="line-clamp-2 max-w-[85%] text-xs text-muted-foreground">
            {action.description}
          </span>
        </div>
      </div>
    </div>
  )
}
