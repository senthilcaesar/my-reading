import { Box, Flex, Heading, Text, useColorMode, Button, useDisclosure, Icon } from '@chakra-ui/react';
import { Moon, Sun, BookMarked, Code } from 'lucide-react';
import TechStackModal from './TechStackModal';

export default function Header({ bookCount }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  return (
    <Box position="relative" textAlign="center" pt={6} pb={6} px={4} bg="surfaceHover" borderBottom="none">
      <Flex 
        position="absolute" top={3} left={4} 
        align="center" gap={2} px={3} py={2} 
        bg="surface"
        backdropFilter="blur(4px)" 
        borderWidth="1px" borderColor="borderPrimary"
        borderRadius="full" shadow="md"
        fontSize="sm" fontWeight="medium" color="textSecondary"
      >
        <BookMarked size={16} /> 
        <Text>{bookCount} Books</Text>
      </Flex>
      
      <Flex 
        position="absolute" top={3} right={4} 
        align="center" gap={2}
      >
        <Button
          onClick={onOpen}
          leftIcon={<Icon as={Code} size={16} />}
          variant="ghost"
          size="sm"
          borderRadius="full"
          bg="surface"
          borderWidth="1px"
          borderColor="borderPrimary"
          shadow="md"
          color="textSecondary"
          fontSize="xs"
          fontWeight="medium"
          px={3}
          _hover={{ shadow: 'lg', transform: 'translateY(-2px)', borderColor: 'accentPrimary', bg: 'surface' }}
          transition="all 0.3s"
          display={{ base: 'none', md: 'flex' }}
        >
          Tech Stack
        </Button>

        <Flex 
          as="button"
          align="center" justify="center" gap={2} px={3} py={2}
          bg="surface"
          backdropFilter="blur(var(--chakra-space-4))"
          borderWidth="1px" borderColor="borderPrimary"
          borderRadius="full" shadow="md"
          _hover={{ shadow: 'lg', transform: 'translateY(-2px)', borderColor: 'accentPrimary' }}
          transition="all 0.3s"
          fontSize="sm" fontWeight="medium" color="textSecondary"
          onClick={toggleColorMode}
        >
          {colorMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <Text display={{ base: 'none', sm: 'inline' }}>
            {colorMode === 'dark' ? 'Light' : 'Dark'}
          </Text>
        </Flex>
      </Flex>

      <TechStackModal isOpen={isOpen} onClose={onClose} />

      <Heading 
        as="h1" 
        fontFamily="heading" fontSize={{ base: '2xl', sm: '3xl', md: '2xl' }} 
        fontWeight="bold" color="textPrimary"
        letterSpacing="tight" mt={-2}
      >
        Book Collection
      </Heading>
    </Box>
  );
}
