import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Flex,
  Text,
  Icon,
  IconButton,
  Tooltip,
  useClipboard,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react';
import { 
  Zap, 
  Layers, 
  Palette, 
  MousePointer2, 
  Github,
  Component,
  Monitor,
  Braces,
  AudioLines,
  Type,
  Database,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

const techStack = [
  {
    name: 'React 19',
    description: 'Fast, modern, component-driven UI framework.',
    icon: Component,
    color: 'accentSecondary',
    category: 'Frontend',
  },
  {
    name: 'React DOM',
    description: 'Connects the React interface to the browser DOM.',
    icon: Monitor,
    color: 'accentSecondary',
    category: 'Frontend',
  },
  {
    name: 'Chakra UI v2',
    description: 'Accessible, composable components and design tokens.',
    icon: Palette,
    color: 'accentMagenta',
    category: 'UI',
  },
  {
    name: 'Framer Motion',
    description: 'Smooth layout, drawer, filter, and interaction motion.',
    icon: MousePointer2,
    color: 'accentMagenta',
    category: 'UI',
  },
  {
    name: 'Vite 7',
    description: 'Fast development server and production build tooling.',
    icon: Zap,
    color: 'accentPrimary',
    category: 'Tooling',
  },
  {
    name: 'Emotion',
    description: 'Runtime styling engine used by Chakra UI.',
    icon: Braces,
    color: 'accentPrimary',
    category: 'Styling',
  },
  {
    name: 'Lucide React',
    description: 'Consistent icons for controls, actions, and feedback.',
    icon: Layers,
    color: 'accentPrimary',
    category: 'UI',
  },
  {
    name: 'Web Audio API',
    description: 'Synthesized ticker and victory sounds for Roulette.',
    icon: AudioLines,
    color: 'accentMagenta',
    category: 'Browser API',
  },
  {
    name: 'Google Fonts',
    description: 'Poppins, Lora, Pacifico, and Rye typefaces.',
    icon: Type,
    color: 'accentSecondary',
    category: 'Typography',
  },
  {
    name: 'CSV Data Layer',
    description: 'Embedded book catalog parsed into searchable records.',
    icon: Database,
    color: 'accentSecondary',
    category: 'Data',
  },
  {
    name: 'ESLint',
    description: 'Static checks for maintainable JavaScript and JSX.',
    icon: CheckCircle2,
    color: 'accentSecondary',
    category: 'Tooling',
  },
  {
    name: 'GitHub Actions',
    description: 'Build and deployment pipeline for GitHub Pages.',
    icon: Github,
    color: 'textSecondary',
    category: 'Delivery',
  },
];

const formattedTechStackText = `Project Tech Stack:
${techStack.map(t => `• ${t.name}: ${t.description}`).join('\n')}`;

export default function TechStackModal({ isOpen, onClose }) {
  const { hasCopied, onCopy } = useClipboard(formattedTechStackText);
  const toast = useToast();

  const handleCopy = () => {
    onCopy();
    toast({
      title: 'Copied to clipboard!',
      description: 'Tech stack details copied to your clipboard.',
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="4xl" motionPreset="scale">
      <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.600" />
      <ModalContent 
        position="relative"
        borderRadius="3xl"
        shadow="2xl"
        bg="bg"
        borderWidth="1px"
        borderColor="borderPrimary"
        mx={4}
        overflow="hidden"
        maxW="920px"
        maxH="min(720px, calc(100vh - 32px))"
        backdropFilter="blur(22px) saturate(130%)"
      >
        <Box position="absolute" top="-100px" left="18%" w="280px" h="220px" borderRadius="full" bg="accentSecondary" opacity={0.13} filter="blur(65px)" pointerEvents="none" />
        <Box position="absolute" bottom="-120px" right="8%" w="320px" h="240px" borderRadius="full" bg="accentMagenta" opacity={0.11} filter="blur(75px)" pointerEvents="none" />
        <ModalHeader
          position="relative"
          px={{ base: 6, md: 10 }}
          pt={{ base: 6, md: 8 }}
          pb={5}
          pr={16}
        >
          <Flex align="flex-start" justify="space-between" gap={4}>
            <Box>
              <Text color="accentPrimary" fontSize="xs" fontWeight="bold" letterSpacing="0.18em" textTransform="uppercase" mb={2}>
                ✦ A little magic, under the hood
              </Text>
              <Text color="textPrimary" fontSize="2xl" fontWeight="bold" fontFamily="heading" letterSpacing="tight">
                Project Tech Stack
              </Text>
              <Text color="textSecondary" fontSize="sm" mt={2} maxW="520px" fontWeight="normal" lineHeight="tall">
                A constellation of tools working together to make this library feel alive.
              </Text>
            </Box>

            <Flex align="center" gap={2} flexShrink={0}>
              <Tooltip label={hasCopied ? "Copied!" : "Copy all tech stack details"} hasArrow>
                <IconButton
                  size="sm"
                  variant="outline"
                  borderColor={hasCopied ? "accentMagenta" : "borderPrimary"}
                  color={hasCopied ? "accentMagenta" : "textSecondary"}
                  _hover={{
                    bg: "surfaceHover",
                    borderColor: "accentPrimary",
                    color: "accentPrimary",
                  }}
                  borderRadius="xl"
                  aria-label="Copy tech stack details"
                  icon={hasCopied ? <Check size={16} /> : <Copy size={16} />}
                  onClick={handleCopy}
                />
              </Tooltip>
              <ModalCloseButton
                position="static"
                size="sm"
                borderRadius="full"
                color="textSecondary"
              />
            </Flex>
          </Flex>
        </ModalHeader>
        
        <ModalBody position="relative" px={{ base: 6, md: 10 }} pt={0} pb={{ base: 7, md: 10 }} overflowY="auto">
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 4 }}
            autoRows={{ base: 'auto', md: 'minmax(150px, auto)' }}
            gap={3}
          >
            {techStack.map((tech) => (
              <Flex 
                key={tech.name} 
                align="flex-start"
                gap={3}
                p={3.5}
                borderWidth="1px"
                borderColor="borderPrimary"
                borderRadius="2xl"
                bg="surface"
                transition="all 0.25s ease"
                _hover={{ transform: 'translateY(-2px)', borderColor: 'accentPrimary', bg: 'surfaceHover', shadow: 'md' }}
                flexDirection="column"
                position="relative"
                overflow="hidden"
              >
                <Box position="absolute" top={0} left={0} right={0} h="3px" bg={tech.color} opacity={0.8} />
                <Box 
                p={2}
                borderRadius="full"
                bg="surfaceHover"
                  color={tech.color}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Icon as={tech.icon} boxSize={4} />
                </Box>
                <Box minW={0} w="full">
                  <Text fontWeight="semibold" color="textPrimary" fontSize="sm">
                    {tech.name}
                  </Text>
                  <Text color={tech.color} fontSize="9px" fontWeight="bold" letterSpacing="0.1em" textTransform="uppercase" mt={1}>
                    {tech.category}
                  </Text>
                  <Text color="textSecondary" fontSize="xs" mt={1} lineHeight="short">
                    {tech.description}
                  </Text>
                </Box>
              </Flex>
            ))}
          </SimpleGrid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
