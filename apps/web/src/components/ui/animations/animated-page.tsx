import { motion, type HTMLMotionProps } from 'framer-motion'

interface AnimatedPageProps extends HTMLMotionProps<'div'> {
  readonly children: React.ReactNode
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const pageTransition = {
  duration: 0.3,
  ease: 'easeInOut',
}

export function AnimatedPage({ children, className, ...props }: AnimatedPageProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
