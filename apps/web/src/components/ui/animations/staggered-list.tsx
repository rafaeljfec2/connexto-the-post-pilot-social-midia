import { motion, type HTMLMotionProps } from 'framer-motion'

interface StaggeredListProps extends HTMLMotionProps<'div'> {
  readonly children: React.ReactNode
  readonly staggerDelay?: number
}

export function StaggeredList({
  children,
  staggerDelay = 0.1,
  className,
  ...props
}: StaggeredListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

export function StaggeredItem({
  children,
  className,
  ...props
}: HTMLMotionProps<'div'> & { readonly children: React.ReactNode }) {
  return (
    <motion.div variants={staggerItemVariants} className={className} {...props}>
      {children}
    </motion.div>
  )
}
