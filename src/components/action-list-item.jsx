import { IoLogoJavascript, IoLogoPython } from 'react-icons/io5'

export function ActionListItem({ action, active }) {
  const isJs = action.type === 'JavaScript'

  return (
    <button
      className={`
        group relative w-full px-4 py-2.5 text-left
        transition-colors
        hover:bg-muted
        ${active ? 'bg-muted' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Language Icon */}
        <div
          className={`
            mt-0.5 flex h-6 w-6 items-center justify-center rounded
            ${
              isJs
                ? 'text-yellow-400'
                : 'text-blue-400'
            }
          `}
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
          <span className="truncate text-sm font-medium">
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
        <span className="absolute left-0 top-2 h-[calc(100%-16px)] w-0.5 rounded-r bg-primary" />
      )}
    </button>
  )
}
