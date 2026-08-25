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
  Heading,
  VStack,
  Icon,
  IconButton,
  Tooltip,
  useClipboard,
  useToast,
} from '@chakra-ui/react';
import { 
  Zap, 
  Layers, 
  Palette, 
  MousePointer2, 
  Github,
  Component,
  Copy,
  Check
} from 'lucide-react';

const techStack = [
  {
    name: 'React 19',
    description: 'Fast, modern, component-driven UI framework.',
    icon: Component,
    color: 'blue.400'
  },
  {
    name: 'Vite 7',
    description: 'Next generation frontend tooling for lightning fast builds.',
    icon: Zap,
    color: 'yellow.400'
  },
  {
    name: 'Chakra UI',
    description: 'Simple, modular and accessible component library.',
    icon: Palette,
    color: 'teal.400'
  },
  {
    name: 'Framer Motion',
    description: 'Production-ready motion library for React animations.',
    icon: MousePointer2,
    color: 'pink.400'
  },
  {
    name: 'Lucide React',
    description: 'Beautiful & consistent icon toolkit for the web.',
    icon: Layers,
    color: 'orange.400'
  },
  {
    name: 'GitHub Actions',
    description: 'CI/CD pipeline for automated testing and deployment.',
    icon: Github,
    color: 'gray.400'
  }
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.600" />
      <ModalContent 
        borderRadius="2xl" 
        shadow="2xl" 
        bg="bg"
        borderWidth="1px"
        borderColor="borderPrimary"
        mx={4}
        overflow="hidden"
      >
        <Box h="4px" bgGradient="linear(to-r, blue.400, orange.400)" />

        <ModalHeader 
          borderBottomWidth="1px" 
          borderColor="borderPrimary" 
          py={4}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          pr={12}
        >
          <Heading size="md" color="textPrimary" fontFamily="heading">
            Project Tech Stack
          </Heading>

          <Tooltip label={hasCopied ? "Copied!" : "Copy all tech stack details"} hasArrow>
            <IconButton
              size="sm"
              variant="outline"
              borderColor={hasCopied ? "green.400" : "borderPrimary"}
              color={hasCopied ? "green.400" : "textSecondary"}
              _hover={{ 
                bg: "surfaceHover", 
                borderColor: hasCopied ? "green.400" : "accentPrimary",
                color: hasCopied ? "green.400" : "accentPrimary" 
              }}
              borderRadius="xl"
              aria-label="Copy tech stack details"
              icon={hasCopied ? <Check size={16} /> : <Copy size={16} />}
              onClick={handleCopy}
            />
          </Tooltip>
        </ModalHeader>
        <ModalCloseButton top={3.5} right={3.5} borderRadius="full" color="textSecondary" />
        
        <ModalBody py={6}>
          <Text mb={6} color="textSecondary" fontSize="sm">
            This app is built using the following technologies:
          </Text>
          
          <VStack spacing={4} align="stretch">
            {techStack.map((tech) => (
              <Flex 
                key={tech.name} 
                align="center" 
                gap={4}
                p={2}
                borderRadius="xl"
                transition="background 0.2s"
                _hover={{ bg: "surfaceHover" }}
              >
                <Box 
                  p={2.5} 
                  borderRadius="lg" 
                  bg={`${tech.color}15`}
                  color={tech.color}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth="1px"
                  borderColor={`${tech.color}30`}
                  flexShrink={0}
                >
                  <Icon as={tech.icon} size={20} />
                </Box>
                <Box>
                  <Text fontWeight="bold" color="textPrimary" fontSize="sm">
                    {tech.name}
                  </Text>
                  <Text color="textSecondary" fontSize="xs">
                    {tech.description}
                  </Text>
                </Box>
              </Flex>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
