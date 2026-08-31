import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Grid,
  GridItem,
  Box,
  Flex,
  Text,
  Button,
  Icon,
  useClipboard,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  Atom,
  Zap,
  Palette,
  Waves,
  Braces,
  Shapes,
  AudioLines,
  Type,
  Database,
  ShieldCheck,
  Github,
  Monitor,
  X,
  Check,
  Copy,
} from 'lucide-react';

const MotionGridItem = motion(GridItem);

/* Bento tiles — `col`/`row` are the md-and-up grid spans (4-column grid). */
const techStack = [
  {
    name: 'React 19',
    category: 'Framework',
    short: 'The whole UI, as a function of state',
    description:
      'Every card, drawer, and filter on this page is derived state. No manual DOM, no sync bugs.',
    icon: Atom,
    accent: 'accentSecondary',
    col: 2,
    row: 2,
    hero: true,
  },
  {
    name: 'Vite 7',
    category: 'Build',
    short: 'Cold start in milliseconds',
    description: 'Native ES modules in dev, a rolled-up bundle in production.',
    icon: Zap,
    accent: 'accentPrimary',
    col: 2,
    row: 1,
    feature: true,
  },
  {
    name: 'Chakra UI v2',
    category: 'Components',
    short: 'Accessible primitives + semantic tokens',
    description: 'Light and dark mode swap without a single hardcoded hex.',
    icon: Palette,
    accent: 'accentMagenta',
    col: 2,
    row: 1,
  },
  {
    name: 'Framer Motion',
    category: 'Motion',
    short: 'Layout animation for grid, drawer, shuffle',
    description: 'Exits stay under 200ms so filtering never feels sluggish.',
    icon: Waves,
    accent: 'accentMagenta',
    col: 2,
    row: 1,
    feature: true,
  },
  {
    name: 'CSV Data Layer',
    category: 'Data',
    short: 'The full catalogue, parsed at load',
    description: 'No network, no database, no waiting.',
    icon: Database,
    accent: 'accentSecondary',
    col: 2,
    row: 1,
  },
  { name: 'Emotion',       category: 'Styling',    short: 'CSS-in-JS under Chakra',     icon: Braces,      accent: 'accentPrimary',   col: 1, row: 1 },
  { name: 'Lucide React',  category: 'Icons',      short: 'One stroke-consistent set',  icon: Shapes,      accent: 'accentPrimary',   col: 1, row: 1 },
  { name: 'React DOM',     category: 'Renderer',   short: 'Tree → DOM, minimally',      icon: Monitor,     accent: 'accentSecondary', col: 1, row: 1 },
  { name: 'Web Audio API', category: 'Browser',    short: 'Synthesised, no audio files',icon: AudioLines,  accent: 'accentMagenta',   col: 1, row: 1 },
  { name: 'Google Fonts',  category: 'Typography', short: 'Poppins · Lora · Rye',       icon: Type,        accent: 'accentSecondary', col: 2, row: 1 },
  { name: 'ESLint',        category: 'Quality',    short: 'Static checks on every file',icon: ShieldCheck, accent: 'accentPrimary',   col: 1, row: 1 },
  { name: 'GitHub Actions',category: 'Delivery',   short: 'Push to main, ships itself', icon: Github,      accent: 'textSecondary',   col: 1, row: 1 },
];

const formattedTechStackText = `Project Tech Stack:
${techStack.map((t) => `• ${t.name} (${t.category}): ${t.description || t.short}`).join('\n')}`;

export default function TechStackModal({ isOpen, onClose }) {
  const { hasCopied, onCopy } = useClipboard(formattedTechStackText);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="4xl" motionPreset="slideInBottom" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.600" />
      <ModalContent
        bg="bg"
        borderWidth="1px"
        borderColor="borderPrimary"
        borderRadius="2xl"
        shadow="2xl"
        mx={4}
        maxW="940px"
        maxH="min(720px, calc(100vh - 40px))"
        overflow="hidden"
      >
        {/* ── Bar ─────────────────────────────────── */}
        <Flex
          align="center"
          justify="space-between"
          px={{ base: 5, md: 7 }}
          py={4}
          flexShrink={0}
        >
          <Flex align="baseline" gap={3} minW={0}>
            <Text
              fontFamily="heading"
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight="600"
              color="textPrimary"
              letterSpacing="-0.01em"
              noOfLines={1}
            >
              Project Tech Stack
            </Text>
            <Text
              fontSize="10px"
              letterSpacing="0.18em"
              textTransform="uppercase"
              color="textSecondary"
              display={{ base: 'none', sm: 'block' }}
            >
              {techStack.length} tools
            </Text>
          </Flex>

          <Flex align="center" gap={1}>
            <Button
              onClick={onCopy}
              size="xs"
              variant="ghost"
              color={hasCopied ? 'accentPrimary' : 'textSecondary'}
              fontWeight="500"
              fontSize="11px"
              borderRadius="lg"
              leftIcon={hasCopied ? <Check size={12} /> : <Copy size={12} />}
              _hover={{ bg: 'surfaceHover', color: 'accentPrimary' }}
            >
              {hasCopied ? 'Copied' : 'Copy'}
            </Button>
            <Box
              as="button"
              aria-label="Close"
              onClick={onClose}
              p={1.5}
              borderRadius="lg"
              color="textSecondary"
              transition="all 0.2s"
              _hover={{ bg: 'surfaceHover', color: 'textPrimary' }}
            >
              <X size={16} />
            </Box>
          </Flex>
        </Flex>

        {/* ── Bento grid ──────────────────────────── */}
        <ModalBody
          px={{ base: 4, md: 7 }}
          pt={0}
          pb={{ base: 5, md: 7 }}
          overflowY="auto"
          sx={{
            '&::-webkit-scrollbar': { width: '5px' },
            '&::-webkit-scrollbar-thumb': { background: 'var(--chakra-colors-borderPrimary)', borderRadius: '5px' },
          }}
        >
          <Grid
            templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
            autoRows={{ base: '110px', md: '104px' }}
            autoFlow="row dense"
            gap={{ base: 2.5, md: 3 }}
          >
            {techStack.map((tech, idx) => (
              <MotionGridItem
                key={tech.name}
                colSpan={{ base: tech.hero ? 2 : tech.col > 1 ? 2 : 1, md: tech.col }}
                rowSpan={{ base: tech.hero ? 2 : 1, md: tech.row }}
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.32, delay: Math.min(idx, 10) * 0.028, ease: [0.22, 1, 0.36, 1] }}
              >
                <Flex
                  h="full"
                  direction="column"
                  justify="space-between"
                  position="relative"
                  overflow="hidden"
                  p={{ base: 3.5, md: 4 }}
                  borderRadius="20px"
                  borderWidth="1px"
                  borderColor="borderPrimary"
                  bg="surface"
                  role="group"
                  transition="transform 0.25s cubic-bezier(0.22,1,0.36,1), border-color 0.25s, background 0.25s, box-shadow 0.25s"
                  _hover={{
                    transform: 'translateY(-3px)',
                    borderColor: tech.accent,
                    bg: 'surfaceHover',
                    shadow: 'lg',
                  }}
                >
                  {/* corner wash */}
                  <Box
                    position="absolute"
                    top="-40%"
                    right="-25%"
                    w="70%"
                    h="140%"
                    bg={tech.accent}
                    opacity={tech.hero ? 0.14 : tech.feature ? 0.09 : 0.05}
                    filter="blur(38px)"
                    pointerEvents="none"
                    transition="opacity 0.3s"
                    _groupHover={{ opacity: tech.hero ? 0.22 : 0.16 }}
                  />

                  {/* oversized watermark icon — hero only */}
                  {tech.hero && (
                    <Icon
                      as={tech.icon}
                      position="absolute"
                      bottom="-18px"
                      right="-14px"
                      boxSize="128px"
                      color={tech.accent}
                      opacity={0.1}
                      strokeWidth={1}
                      pointerEvents="none"
                    />
                  )}

                  <Flex align="center" justify="space-between" position="relative" gap={2}>
                    <Flex
                      align="center"
                      justify="center"
                      boxSize={tech.hero ? 9 : 7}
                      borderRadius={tech.hero ? 'xl' : 'lg'}
                      bg="bg"
                      borderWidth="1px"
                      borderColor="borderPrimary"
                      color={tech.accent}
                      flexShrink={0}
                    >
                      <Icon as={tech.icon} boxSize={tech.hero ? 5 : 3.5} strokeWidth={1.75} />
                    </Flex>
                    <Text
                      fontSize="9px"
                      letterSpacing="0.16em"
                      textTransform="uppercase"
                      color="textSecondary"
                      opacity={0.7}
                      noOfLines={1}
                    >
                      {tech.category}
                    </Text>
                  </Flex>

                  <Box position="relative" minW={0}>
                    <Text
                      fontFamily="heading"
                      fontSize={tech.hero ? { base: 'xl', md: '2xl' } : tech.col > 1 ? 'sm' : 'xs'}
                      fontWeight="600"
                      color="textPrimary"
                      letterSpacing="-0.01em"
                      lineHeight="1.2"
                      noOfLines={1}
                    >
                      {tech.name}
                    </Text>
                    <Text
                      fontSize={tech.hero ? 'sm' : '11px'}
                      color="textSecondary"
                      lineHeight="1.45"
                      mt={1}
                      noOfLines={tech.hero ? 3 : 2}
                    >
                      {tech.hero ? tech.description : tech.short}
                    </Text>
                  </Box>
                </Flex>
              </MotionGridItem>
            ))}
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
