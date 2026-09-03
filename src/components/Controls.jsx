import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  Box,
  Circle,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
} from '@chakra-ui/react';
import {
  Check,
  ChevronDown,
  Dices,
  LibraryBig,
  Search,
  Shuffle,
  UsersRound,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

const MotionBox = motion(Box);
const MotionInputGroup = motion(InputGroup);

function FilterMenu({
  icon,
  label,
  placeholder,
  options,
  value,
  onChange,
  activeBorderColor = 'accentPrimary',
}) {
  const IconComponent = icon;
  const selectedLabel = value || placeholder;
  const isActive = Boolean(value);

  return (
    <Menu matchWidth isLazy>
      {({ isOpen }) => (
        <Box flex='1' minW={{ base: 'full', sm: '200px' }}>
          <MenuButton
            as={Button}
            w='full'
            h={{ base: '40px', md: '48px' }}
            px={{ base: 3, md: 4 }}
            bg='surfaceHover'
            border='1px solid'
            borderColor={isActive ? activeBorderColor : 'borderPrimary'}
            borderRadius='xl'
            boxShadow={isActive ? 'md' : 'sm'}
            color='textPrimary'
            fontWeight='semibold'
            justifyContent='flex-start'
            textAlign='left'
            _hover={{ bg: 'surface', transform: 'translateY(-1px)' }}
            _active={{ bg: 'surface' }}
            _expanded={{ borderColor: activeBorderColor, boxShadow: 'lg' }}
            transition='background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease'
          >
            <Flex align='center' gap={3} minW={0} w='full'>
              <Box
                display='grid'
                placeItems='center'
                flex='0 0 auto'
                w={{ base: 7, md: 8 }}
                h={{ base: 7, md: 8 }}
                borderRadius='lg'
                bg={isActive ? 'accentPrimary' : 'surface'}
                color={isActive ? 'bg' : 'accentPrimary'}
              >
                <IconComponent size={16} />
              </Box>
              <Box minW={0} flex='1'>
                <Text
                  as='span'
                  display='block'
                  color='textSecondary'
                  fontSize='xs'
                  lineHeight='1'
                >
                  {label}
                </Text>
                <Text
                  as='span'
                  display='block'
                  mt={1}
                  color={isActive ? 'accentPrimary' : 'textPrimary'}
                  fontSize={{ base: 'sm', md: 'md' }}
                  lineHeight='1.1'
                  noOfLines={1}
                >
                  {selectedLabel}
                </Text>
              </Box>
              <MotionBox
                display='flex'
                flex='0 0 auto'
                color='textSecondary'
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.18 }}
              >
                <ChevronDown size={18} />
              </MotionBox>
            </Flex>
          </MenuButton>

          <Portal>
            <MenuList
              zIndex='popover'
              maxH={{ base: '320px', md: '380px' }}
              overflowY='auto'
              p={2}
              bg='surface'
              border='1px solid'
              borderColor='borderPrimary'
              borderRadius='xl'
              boxShadow='2xl'
            >
              <MenuItem
                minH='40px'
                borderRadius='lg'
                bg={!value ? 'surfaceHover' : 'transparent'}
                color={!value ? 'accentPrimary' : 'textPrimary'}
                fontWeight={!value ? 'bold' : 'medium'}
                _focus={{ bg: 'surfaceHover' }}
                _hover={{ bg: 'surfaceHover' }}
                onClick={() => onChange('')}
              >
                <HStack w='full' justify='space-between' spacing={3}>
                  <Text noOfLines={1}>{placeholder}</Text>
                  {!value && <Check size={16} />}
                </HStack>
              </MenuItem>

              {options.map((option) => {
                const selected = option === value;
                return (
                  <MenuItem
                    key={option}
                    minH='40px'
                    borderRadius='lg'
                    bg={selected ? 'surfaceHover' : 'transparent'}
                    color={selected ? 'accentPrimary' : 'textPrimary'}
                    fontWeight={selected ? 'bold' : 'medium'}
                    _focus={{ bg: 'surfaceHover' }}
                    _hover={{ bg: 'surfaceHover' }}
                    onClick={() => onChange(option)}
                  >
                    <HStack w='full' justify='space-between' spacing={3}>
                      <Text noOfLines={1}>{option}</Text>
                      {selected && <Check size={16} />}
                    </HStack>
                  </MenuItem>
                );
              })}
            </MenuList>
          </Portal>
        </Box>
      )}
    </Menu>
  );
}

export default function Controls({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedRecommender,
  setSelectedRecommender,
  categories,
  recommenders,
  resultCount,
  totalCount,
  isSearchSettling,
  onShuffle,
  onRoulette,
}) {
  const [isShuffling, setIsShuffling] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const bg = 'surfaceHover';
  const borderColor = 'borderPrimary';
  const focusBorderColor = 'accentPrimary';
  const iconColor = 'textSecondary';
  const categoryOptions = useMemo(() => Array.from(categories).sort(), [categories]);
  const recommenderOptions = useMemo(
    () => Array.from(recommenders).sort(),
    [recommenders],
  );

  return (
    <Flex
      direction='column'
      maxW='7xl'
      mx='auto'
      px={{ base: 3, sm: 4, md: 6, lg: 8 }}
      mb={{ base: 4, sm: 6, md: 8 }}
      gap={{ base: 2.5, sm: 3, md: 4 }}
    >
      <MotionInputGroup
        size={{ base: 'md', md: 'lg' }}
        animate={{
          scale: isSearchFocused ? 1.01 : 1,
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <InputLeftElement pointerEvents='none' h='full'>
          <Box color={searchQuery || isSearchFocused ? 'accentPrimary' : iconColor}>
            <Search size={20} />
          </Box>
        </InputLeftElement>
        <Input
          backdropFilter='blur(10px)'
          bg={bg}
          border='1px solid'
          borderColor={searchQuery ? 'accentPrimary' : borderColor}
          transition='background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, color 0.25s ease'
          focusBorderColor={focusBorderColor}
          borderRadius='full'
          shadow={isSearchFocused || searchQuery ? 'xl' : 'lg'}
          pl={12}
          pr={{ base: searchQuery ? 28 : 4, sm: searchQuery ? 36 : 4 }}
          placeholder='Search by title, author, category, or recommender...'
          value={searchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onChange={(e) => setSearchQuery(e.target.value)}
          _placeholder={{ color: 'textSecondary' }}
          _focusVisible={{
            boxShadow: '0 0 0 1px var(--chakra-colors-accentPrimary), 0 18px 42px rgba(0,0,0,0.18)',
          }}
        />
        {searchQuery && (
          <InputRightElement
            width={{ base: '7rem', sm: '9rem' }}
            h='full'
            pointerEvents='none'
          >
            <HStack spacing={2} pointerEvents='auto'>
              <HStack
                spacing={1.5}
                display={{ base: 'none', sm: 'flex' }}
                px={2.5}
                py={1}
                borderRadius='full'
                bg='surface'
                color='textSecondary'
                fontSize='xs'
                fontWeight='bold'
                lineHeight='1'
                whiteSpace='nowrap'
              >
                {isSearchSettling && (
                  <Circle
                    size='6px'
                    bg='accentPrimary'
                    as={motion.span}
                    animate={{ opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  />
                )}
                <Text as='span'>{resultCount}/{totalCount}</Text>
              </HStack>
              <MotionBox
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  h='1.9rem'
                  w='1.9rem'
                  minW='1.9rem'
                  size='sm'
                  onClick={() => setSearchQuery('')}
                  variant='ghost'
                  borderRadius='full'
                  color='textSecondary'
                  _hover={{ bg: 'surface', color: 'accentPrimary' }}
                  aria-label='Clear search'
                >
                  <X size={16} />
                </Button>
              </MotionBox>
            </HStack>
          </InputRightElement>
        )}
        {searchQuery && (
          <Box
            position='absolute'
            inset={0}
            borderRadius='full'
            pointerEvents='none'
            border='1px solid'
            borderColor='accentPrimary'
            opacity={0.35}
          />
        )}
      </MotionInputGroup>

      {searchQuery && (
        <MotionBox
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          <HStack
            justify='space-between'
            px={{ base: 1, md: 2 }}
            color='textSecondary'
            fontSize='sm'
            minH='20px'
          >
            <HStack spacing={2} minW={0}>
              <Circle
                size='7px'
                bg={isSearchSettling ? 'accentPrimary' : 'accentSecondary'}
                as={motion.span}
                animate={isSearchSettling ? { opacity: [0.35, 1, 0.35] } : { opacity: 1 }}
                transition={{ duration: 0.9, repeat: isSearchSettling ? Infinity : 0 }}
              />
              <Text noOfLines={1}>
                {isSearchSettling
                  ? 'Searching...'
                  : `${resultCount} ${resultCount === 1 ? 'result' : 'results'}`}
              </Text>
            </HStack>
            <Text
              display={{ base: 'none', sm: 'block' }}
              color='textSecondary'
              noOfLines={1}
            >
              {searchQuery}
            </Text>
          </HStack>
        </MotionBox>
      )}

      <Flex
        gap={{ base: 2, sm: 3 }}
        direction={{ base: 'column', sm: 'row' }}
        flexWrap='wrap'
      >
        <FilterMenu
          icon={LibraryBig}
          label='Category'
          placeholder='All Categories'
          options={categoryOptions}
          value={selectedCategory}
          onChange={setSelectedCategory}
        />

        <FilterMenu
          icon={UsersRound}
          label='People'
          placeholder="People's Picks"
          options={recommenderOptions}
          value={selectedRecommender}
          onChange={setSelectedRecommender}
        />

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
