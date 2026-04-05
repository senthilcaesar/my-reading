import { Box, Flex, Heading, Text, useColorMode, Button, useDisclosure, Icon, IconButton } from '@chakra-ui/react';
import { Moon, Sun, BookMarked, Code } from 'lucide-react';
import { useEffect, useState } from 'react';
import TechStackModal from './TechStackModal';

export default function Header({ bookCount }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const glassLight = 'rgba(252, 248, 232, 0.82)';
  const glassDark  = 'rgba(5, 5, 7, 0.82)';
  const glassBg    = colorMode === 'dark' ? glassDark : glassLight;
  const pillBg     = colorMode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(67,52,34,0.06)';

  return (
    <>
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={100}
        w="full"
        bg={glassBg}
        backdropFilter="blur(16px) saturate(180%)"
        sx={{ WebkitBackdropFilter: 'blur(16px) saturate(180%)' }}
        borderBottom="1px solid"
        borderColor={colorMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(67,52,34,0.12)'}
        transition="padding 0.35s ease, box-shadow 0.35s ease"
        pt={{ base: scrolled ? 2 : 3, md: scrolled ? 3 : 5 }}
        pb={{ base: scrolled ? 2 : 3, md: scrolled ? 3 : 5 }}
        px={{ base: 3, sm: 4, md: 5 }}
        boxShadow={scrolled
          ? colorMode === 'dark'
            ? '0 4px 32px rgba(0,242,255,0.06)'
            : '0 4px 32px rgba(176,141,87,0.12)'
          : 'none'}
      >
        <Flex align="center" justify="space-between" maxW="1400px" mx="auto" gap={2}>

          {/* Left — Book Count Badge */}
          <Flex
            align="center" gap={1.5}
            px={{ base: 2, sm: 3 }} py={1.5}
            bg={pillBg}
            borderWidth="1px" borderColor="borderPrimary"
            borderRadius="full" shadow="sm"
            fontSize={{ base: 'xs', sm: 'sm' }} fontWeight="medium" color="textSecondary"
            transition="all 0.3s"
            _hover={{ borderColor: 'accentPrimary', shadow: 'md' }}
            flexShrink={0}
          >
            <BookMarked size={14} />
            <Text display={{ base: 'none', sm: 'inline' }}>{bookCount} Books</Text>
            <Text display={{ base: 'inline', sm: 'none' }}>{bookCount}</Text>
          </Flex>

          {/* Center — Title */}
          <Heading
            as="h1"
            fontFamily="heading"
            fontSize={scrolled
              ? { base: 'md', sm: 'lg', md: '2xl' }
              : { base: 'lg', sm: 'xl', md: '3xl' }
            }
            fontWeight="normal"
            color="textPrimary"
            letterSpacing={{ base: '0.01em', md: '0.04em' }}
            transition="font-size 0.35s ease, color 0.2s ease"
            userSelect="none"
            cursor="pointer"
            textAlign="center"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            _hover={{ color: 'accentPrimary' }}
            noOfLines={1}
            flex={1}
          >
            Book Collection
          </Heading>

          {/* Right — Controls */}
          <Flex align="center" gap={{ base: 1.5, sm: 2 }} flexShrink={0}>
            {/* Tech Stack — text label on md+, icon-only on sm, hidden on base */}
            <Button
              onClick={onOpen}
              leftIcon={<Icon as={Code} boxSize={{ base: 3.5, sm: 4 }} />}
              variant="ghost"
              size="sm"
              borderRadius="full"
              bg={pillBg}
              borderWidth="1px"
              borderColor="borderPrimary"
              color="textSecondary"
              fontSize="xs"
              fontWeight="medium"
              px={{ base: 2, sm: 3 }}
              transition="all 0.3s"
              _hover={{
                shadow: 'lg',
                transform: 'translateY(-1px)',
                borderColor: 'accentPrimary',
                color: 'accentPrimary',
                bg: colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(176,141,87,0.08)',
              }}
              display={{ base: 'none', sm: 'flex' }}
            >
              <Text display={{ base: 'none', md: 'inline' }}>Tech Stack</Text>
            </Button>

            {/* Theme Toggle */}
            <Flex
              as="button"
              align="center" justify="center" gap={1.5}
              px={{ base: 2, sm: 3 }} py={1.5}
              bg={pillBg}
              backdropFilter="blur(4px)"
              borderWidth="1px" borderColor="borderPrimary"
              borderRadius="full" shadow="sm"
              transition="all 0.3s"
              _hover={{ shadow: 'lg', transform: 'translateY(-1px)', borderColor: 'accentPrimary', color: 'accentPrimary' }}
              fontSize="sm" fontWeight="medium" color="textSecondary"
              onClick={toggleColorMode}
              minW={{ base: '32px', sm: 'auto' }}
            >
              {colorMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <Text display={{ base: 'none', sm: 'inline' }} fontSize="xs">
                {colorMode === 'dark' ? 'Light' : 'Dark'}
              </Text>
            </Flex>
          </Flex>
        </Flex>

        {/* Animated amber accent line */}
        <Box
          position="absolute" bottom={0} left="50%"
          transform="translateX(-50%)"
          h="2px"
          w={scrolled ? '100%' : '60%'}
          bgGradient="linear(to-r, transparent, accentPrimary, transparent)"
          opacity={scrolled ? 0.7 : 0.35}
          transition="width 0.5s ease, opacity 0.4s ease"
          borderRadius="full" pointerEvents="none"
        />
      </Box>

      <TechStackModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}
