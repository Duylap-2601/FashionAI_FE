import React from 'react';
import { motion } from 'motion/react';

interface AnimateInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
}

/* Scroll-triggered fade + slide up */
export function AnimateIn({
  children,
  className,
  delay = 0,
  duration = 0.45,
  y = 20,
  once = true,
}: AnimateInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* Stagger container — wraps a list so children animate in sequence */
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.07,
  delayChildren = 0,
  animateOnMount = false,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
  animateOnMount?: boolean;
}) {
  // whileInView + once:true tháo intersection observer sau lần fire đầu, nên children
  // mount sau đó (đổi trang, đổi filter) không được đẩy sang "visible" và kẹt ở
  // opacity 0. Với list luôn nằm trong khung nhìn, dùng animate để tránh hẳn.
  const trigger = animateOnMount
    ? { animate: 'visible' as const }
    : { whileInView: 'visible' as const, viewport: { once: true, margin: '-60px' } };

  return (
    <motion.div
      className={className}
      initial="hidden"
      {...trigger}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay, delayChildren } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* Child item for StaggerContainer */
export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden:  { opacity: 0, y: 18 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}
