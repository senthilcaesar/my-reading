import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
  Flex,
  Text,
  Heading,
  VStack,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  Zap, 
  Layers, 
  Palette, 
  MousePointer2, 
  Cpu, 
  Github,
  Component
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

export default function TechStackModal({ isOpen, onClose }) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const overlayBlur = 'blur(4px)';

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay backdropFilter={overlayBlur} />
      <ModalContent 
        borderRadius="2xl" 
        shadow="2xl" 
        bg={bgColor}
        mx={4}
      >
        <ModalHeader borderBottomWidth="1px" borderColor="borderPrimary" py={4}>
          <Heading size="md" color="textPrimary">Project Tech Stack</Heading>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={6}>
          <Text mb={6} color="textSecondary" fontSize="sm">
            This app is built using the following technologies:
          </Text>
          
          <VStack spacing={4} align="stretch">
            {techStack.map((tech) => (
              <Flex key={tech.name} align="center" gap={4}>
                <Box 
                  p={2} 
                  borderRadius="lg" 
                  bg={`${tech.color}10`}
                  color={tech.color}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth="1px"
                  borderColor={`${tech.color}20`}
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
