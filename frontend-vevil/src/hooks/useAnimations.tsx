import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';

// ============================================
// ANIMACIONES REUTILIZABLES
// ============================================

/**
 * Animación de entrada fade-in desde abajo
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { opacity: 0, y: -10 }
};

/**
 * Animación de entrada fade-in desde la izquierda
 */
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

/**
 * Animación de entrada scale-in
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

/**
 * Animación de stagger para listas
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

// ============================================
// COMPONENTES WRAPPER
// ============================================

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Componente con animación fade-in
 */
export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeInUp}
      style={{ transitionDelay: `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </motion.div>
  );
}

interface ListProps {
  children: ReactNode;
  className?: string;
}

/**
 * Componente para listas animadas
 */
export function AnimatedList({ children, className }: ListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

interface ModalProps {
  isOpen: boolean;
  children: ReactNode;
  onClose?: () => void;
}

/**
 * Componente para modales animados
 */
export function AnimatedModal({ isOpen, children, onClose }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1000
            } as React.CSSProperties}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1001
            } as React.CSSProperties}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
