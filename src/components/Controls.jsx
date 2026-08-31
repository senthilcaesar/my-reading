import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Button,
  Box,
} from '@chakra-ui/react';
import { Search, X, Shuffle, Dices } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const MotionBox = motion(Box);

export default function Controls({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedRecommender,
  setSelectedRecommender,
  categories,
  recommenders,
  onShuffle,
  onRoulette,
}) {
  const [isShuffling, setIsShuffling] = useState(false);
  const bg = 'surfaceHover';
  const borderColor = 'borderPrimary';
  const focusBorderColor = 'accentPrimary';
  const iconColor = 'textSecondary';

  return (
    <Flex
      direction='column'
      maxW='7xl'
      mx='auto'
      px={{ base: 3, sm: 4, md: 6, lg: 8 }}
      mb={{ base: 4, sm: 6, md: 8 }}
      gap={{ base: 2.5, sm: 3, md: 4 }}
    >
      <InputGroup size={{ base: 'md', md: 'lg' }}>
        <InputLeftElement pointerEvents='none'>
          <Search size={20} color={iconColor} />
        </InputLeftElement>
        <Input
          backdropFilter='blur(4px)'
          bg={bg}
          borderColor={borderColor}
          transition='background-color 0.35s ease, border-color 0.35s ease, color 0.35s ease'
          focusBorderColor={focusBorderColor}
          borderRadius='full'
          shadow='lg'
          pl={12}
          placeholder='Search by title, author, category, or recommender...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <InputRightElement width='4.5rem'>
            <Button
              h='1.75rem'
              size='sm'
              onClick={() => setSearchQuery('')}
              variant='ghost'
              borderRadius='full'
            >
              <X size={16} />
            </Button>
          </InputRightElement>
        )}
      </InputGroup>

      <Flex
        gap={{ base: 2, sm: 3 }}
        direction={{ base: 'column', sm: 'row' }}
        flexWrap='wrap'
      >
        <Select
          backdropFilter='blur(4px)'
          bg={bg}
          borderColor={borderColor}
          transition='background-color 0.35s ease, border-color 0.35s ease, color 0.35s ease'
          focusBorderColor={focusBorderColor}
          borderRadius='xl'
          shadow='sm'
          size={{ base: 'md', md: 'lg' }}
          fontWeight='medium'
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          flex='1'
          minW={{ base: 'full', sm: '180px' }}
        >
          <option value=''>All Categories</option>
          {Array.from(categories)
            .sort()
            .map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
        </Select>

        <Select
          backdropFilter='blur(4px)'
          bg={bg}
          borderColor={selectedRecommender ? 'accentPrimary' : borderColor}
          transition='background-color 0.35s ease, border-color 0.35s ease, color 0.35s ease'
          focusBorderColor={focusBorderColor}
          borderRadius='xl'
          shadow='sm'
          size={{ base: 'md', md: 'lg' }}
          fontWeight='medium'
          value={selectedRecommender}
          onChange={(e) => setSelectedRecommender(e.target.value)}
          flex='1'
          minW={{ base: 'full', sm: '200px' }}
        >
          <option value=''>People's Picks</option>
          {Array.from(recommenders)
            .sort()
            .map((rec) => (
              <option key={rec} value={rec}>
                {rec}
              </option>
            ))}
        </Select>

        <Button
          leftIcon={
            <MotionBox
              display="flex"
              animate={isShuffling ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
            >
              <Shuffle size={18} />
            </MotionBox>
          }
          size={{ base: 'md', md: 'lg' }}
          borderRadius='xl'
          shadow='sm'
          fontWeight='bold'
          bg='accentPrimary'
          color='bg'
          _hover={{ bg: 'accentSecondary', transform: 'translateY(-1px)' }}
          onClick={() => {
            setIsShuffling(true);
            onShuffle();
            window.setTimeout(() => setIsShuffling(false), 500);
          }}
          w={{ base: 'full', sm: 'auto' }}
          minW={{ base: 'unset', sm: '130px' }}
        >
          Shuffle
        </Button>

        <Button
          leftIcon={<Dices size={18} />}
          size={{ base: 'md', md: 'lg' }}
          borderRadius='xl'
          shadow='sm'
          fontWeight='bold'
          variant='outline'
          borderColor='accentPrimary'
          color='accentPrimary'
          _hover={{ bg: 'surfaceHover', transform: 'translateY(-1px)' }}
          onClick={onRoulette}
          w={{ base: 'full', sm: 'auto' }}
          minW={{ base: 'unset', sm: '150px' }}
        >
          Roulette
        </Button>
      </Flex>
    </Flex>
  );
}
