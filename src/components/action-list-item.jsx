import { IoLogoJavascript, IoLogoPython } from 'react-icons/io5';
import { ActionMenu } from '@/components/action-menu';

/**
 * Tweak these until it feels right.
 * Keep them low-ish for narrow sidebars.
 */
const TITLE_MAX_CHARS = 29;
const DESC_MAX_CHARS = 29;

function clampChars(value, max) {
  const s = (value ?? '').toString().trim();
  if (!s) return '';
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1))}…`;
}

export function ActionListItem({ action, active, onClick }) {
  const isJs = action.type === 'JavaScript';

  const titleRaw = action?.title ?? '';
  const descRaw = action?.description ?? '';

  const title = clampChars(titleRaw, TITLE_MAX_CHARS);
  const description = clampChars(descRaw, DESC_MAX_CHARS);

  return (
    <div
      role='button'
      aria-current={active ? 'true' : undefined}
      onClick={() => onClick?.()}
      className={[
        'group/action flex w-full items-center gap-3 rounded-md px-3 py-2',
        'cursor-pointer transition-colors',
        'hover:bg-muted/50 focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-primary',
        active ? 'bg-muted' : '',
      ].join(' ')}
    >
      {/* Icon / Menu slot (fixed width) */}
      <div className='relative flex h-9 w-8 shrink-0 items-center justify-center'>
        {/* Language icon */}
        <div className='absolute inset-0 flex items-center justify-center opacity-70 transition-opacity duration-150 group-hover/action:opacity-0'>
          {isJs ? (
            <IoLogoJavascript className='h-6 w-6 text-yellow-400' />
          ) : (
            <IoLogoPython className='h-6 w-6 text-blue-400' />
          )}
        </div>

        {/* Action menu */}
        <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover/action:opacity-100'>
          <ActionMenu action={action} />
        </div>
      </div>

      {/* Text */}
      <div className='flex-1 min-w-0 leading-tight'>
        <div className='text-xs font-medium' title={titleRaw}>
          {title}
        </div>

        <div className='text-[11px] text-muted-foreground' title={descRaw}>
          {description}
        </div>
      </div>
    </div>
  );
}
