import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

interface AnimatedButtonProps extends HTMLMotionProps<'div'> {
  readonly children: React.ReactNode
  readonly scaleOnHover?: number
  readonly scaleOnTap?: number
}

export const AnimatedButton = forwardRef<HTMLDivElement, AnimatedButtonProps>(
  ({ children, scaleOnHover = 1.02, scaleOnTap = 0.98, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: scaleOnHover }}
        whileTap={{ scale: scaleOnTap }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'
