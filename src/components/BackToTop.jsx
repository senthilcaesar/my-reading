import { IconButton, Tooltip } from '@chakra-ui/react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const MotionIconButton = motion(IconButton);

/** Floating button shown once the reader has scrolled past the search and filters. */
export default function BackToTop({ visible }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <Tooltip label="Back to top" placement="left" openDelay={400}>
          <MotionIconButton
            aria-label="Back to top"
            icon={<ArrowUp size={22} />}
            position="fixed"
            right={{ base: 4, md: 8 }}
            bottom={{ base: 4, md: 8 }}
            zIndex={90}
            w={{ base: 12, md: 14 }}
            h={{ base: 12, md: 14 }}
            minW="auto"
            borderRadius="full"
            bg="accentPrimary"
            color="bg"
            shadow="xl"
            _hover={{ bg: 'accentPrimary', filter: 'brightness(0.92)' }}
            _active={{ bg: 'accentPrimary', filter: 'brightness(0.85)' }}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
            onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}
          />
        </Tooltip>
      )}
    </AnimatePresence>
  );
}
