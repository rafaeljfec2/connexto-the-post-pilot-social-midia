import { motion, type HTMLMotionProps } from 'framer-motion'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate'> {
  readonly children: React.ReactNode
  readonly delay?: number
  readonly duration?: number
  readonly direction?: Direction
  readonly distance?: number
}

const getDirectionOffset = (direction: Direction, distance: number) => {
  const offsets: Record<Direction, { x?: number; y?: number }> = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  }
  return offsets[direction]
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  direction = 'up',
  distance = 20,
  className,
  ...props
}: FadeInProps) {
  const offset = getDirectionOffset(direction, distance)

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
