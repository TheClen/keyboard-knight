interface PromptDisplayProps {
  readonly text: string
  readonly cursor: number
  readonly errorCount: number
  readonly hasError: boolean
}

export function PromptDisplay({
  text,
  cursor,
  errorCount,
  hasError,
}: PromptDisplayProps) {
  return (
    <p
      // Remounting on each error restarts the flash animation.
      key={errorCount}
      className={hasError ? 'prompt prompt--error' : 'prompt'}
    >
      {[...text].map((letter, index) => (
        <span
          key={index}
          className={
            index < cursor
              ? 'prompt-letter prompt-letter--done'
              : index === cursor
                ? 'prompt-letter prompt-letter--current'
                : 'prompt-letter'
          }
        >
          {letter}
        </span>
      ))}
    </p>
  )
}
