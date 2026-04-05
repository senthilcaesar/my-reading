import { Flex, Input, InputGroup, InputLeftElement, InputRightElement, Select, Button } from '@chakra-ui/react';
import { Search, X, Shuffle } from 'lucide-react';

export default function Controls({
  searchQuery, setSearchQuery,
  selectedCategory, setSelectedCategory,
  categories,
  onShuffle
}) {
  const bg = "surfaceHover";
  const borderColor = "borderPrimary";
  const focusBorderColor = "accentPrimary";
  const iconColor = "textSecondary";
  
  return (
    <Flex direction="column" maxW="7xl" mx="auto" px={{ base: 3, sm: 4, md: 6, lg: 8 }} mb={{ base: 4, sm: 6, md: 8 }} gap={{ base: 2.5, sm: 3, md: 4 }}>
      <InputGroup size={{ base: 'md', md: 'lg' }}>
        <InputLeftElement pointerEvents="none">
          <Search size={20} color={iconColor} />
        </InputLeftElement>
        <Input 
          backdropFilter="blur(4px)" bg={bg}
          borderColor={borderColor} focusBorderColor={focusBorderColor}
          borderRadius="full" shadow="lg" pl={12}
          placeholder="Search by title, author, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={() => setSearchQuery('')} variant="ghost" borderRadius="full">
              <X size={16} />
            </Button>
          </InputRightElement>
        )}
      </InputGroup>

      <Flex gap={{ base: 2, sm: 3 }} direction={{ base: 'column', sm: 'row' }}>
        <Select 
          backdropFilter="blur(4px)" bg={bg} borderColor={borderColor} focusBorderColor={focusBorderColor}
          borderRadius="xl" shadow="sm" size={{ base: 'md', md: 'lg' }} fontWeight="medium"
          value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {Array.from(categories).sort().map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>

        <Button 
          leftIcon={<Shuffle size={18} />}
          size={{ base: 'md', md: 'lg' }} borderRadius="xl" shadow="sm" fontWeight="bold"
          bg="accentPrimary" color="bg"
          _hover={{ bg: 'accentSecondary', transform: 'translateY(-1px)' }}
          onClick={onShuffle}
          w={{ base: 'full', sm: 'auto' }} minW={{ base: 'unset', sm: '140px' }}
        >
          Shuffle
        </Button>
      </Flex>
    </Flex>
  );
}
