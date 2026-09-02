import { Box, Flex, Text, useColorMode, Tooltip } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const MotionBox = motion(Box);
const MotionG = motion.g;

export default function OpenLibraryBadge({ bookCount }) {
  const { colorMode } = useColorMode();
  const [isHovered, setIsHovered] = useState(false);

  // Colors adapted for light and dark modes
  const signBlue = colorMode === 'dark' ? '#5a86bc' : '#5684be';
  const wireColor = colorMode === 'dark' ? 'rgba(198, 208, 245, 0.65)' : 'rgba(61, 48, 33, 0.65)';
  const pinColor = colorMode === 'dark' ? '#c6d0f5' : '#2b241c';
  const lineColor = colorMode === 'dark' ? 'rgba(198, 208, 245, 0.25)' : 'rgba(61, 48, 33, 0.28)';

  return (
    <Tooltip
      label={`${bookCount.toLocaleString()} books currently in catalog`}
      placement="bottom-start"
      hasArrow
      fontSize="xs"
      bg={colorMode === 'dark' ? 'gray.700' : 'gray.800'}
      color="white"
      borderRadius="md"
      px={2.5}
      py={1}
    >
      <Flex
        as="div"
        align="center"
        gap={{ base: 1, sm: 2 }}
        py={0}
        px={{ base: 1, sm: 1.5 }}
        borderRadius="md"
        cursor="default"
        userSelect="none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        transition="all 0.2s ease"
        role="group"
        flexShrink={0}
      >
        {/* Hanging "OPEN" Sign — Compact vertical footprint */}
        <Box
          position="relative"
          w={{ base: '48px', sm: '56px' }}
          h={{ base: '26px', sm: '30px' }}
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <svg
            viewBox="0 0 56 30"
            width="100%"
            height="100%"
            style={{ overflow: 'visible' }}
          >
            {/* Hanging Pin / Nail */}
            <circle cx="28" cy="2.5" r="2.2" fill={pinColor} />

            {/* Left suspension string */}
            <line
              x1="28"
              y1="2.5"
              x2="8.5"
              y2="10"
              stroke={wireColor}
              strokeWidth="1.3"
              strokeLinecap="round"
            />

            {/* Right suspension string */}
            <line
              x1="28"
              y1="2.5"
              x2="47.5"
              y2="10"
              stroke={wireColor}
              strokeWidth="1.3"
              strokeLinecap="round"
            />

            {/* Sign board with swinging animation */}
            <MotionG
              transformOrigin="28px 2.5px"
              animate={
                isHovered
                  ? {
                      rotate: [-4.5, 3, -6, 2, -4.5],
                      transition: { duration: 1.2, ease: 'easeInOut' },
                    }
                  : { rotate: -4.5 }
              }
              style={{ transformOrigin: '28px 2.5px' }}
            >
              {/* Subtle drop shadow for depth */}
              <rect
                x="5.5"
                y="10"
                width="45"
                height="19"
                rx="4.5"
                fill="rgba(0, 0, 0, 0.14)"
              />

              {/* Main Blue Pill Signboard */}
              <rect
                x="5"
                y="9"
                width="45"
                height="19"
                rx="4.5"
                fill={signBlue}
              />

              {/* Inner subtle rim highlight */}
              <rect
                x="6.2"
                y="10.2"
                width="42.6"
                height="16.6"
                rx="3.5"
                fill="none"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="0.8"
              />

              {/* "OPEN" text */}
              <text
                x="27.5"
                y="23"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="13"
                fontWeight="900"
                fontFamily="'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                letterSpacing="0.08em"
                style={{ filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.18))' }}
              >
                OPEN
              </text>
            </MotionG>
          </svg>
        </Box>

        {/* Serif "LIBRARY" with Top & Bottom Rules and Book Count */}
        <Flex
          direction="column"
          justify="center"
          position="relative"
          py="1px"
        >
          {/* Top Line */}
          <Box
            w="full"
            h="1px"
            bg={lineColor}
            transition="background-color 0.2s"
          />

          {/* Text and Count Row */}
          <Flex
            align="center"
            gap={{ base: 1.5, sm: 2 }}
            px={1}
            py={{ base: '2px', sm: '3px' }}
          >
            <Text
              as="span"
              fontFamily="'Lora', Georgia, serif"
              fontSize={{ base: 'xs', sm: 'sm' }}
              fontWeight="600"
              letterSpacing={{ base: '0.12em', sm: '0.16em' }}
              color="textPrimary"
              lineHeight="none"
            >
              LIBRARY
            </Text>

            <Text
              as="span"
              color="textSecondary"
              fontSize={{ base: 'xs', sm: 'sm' }}
              opacity={0.5}
              lineHeight="none"
              userSelect="none"
            >
              •
            </Text>

            <Flex
              align="center"
              bg={
                colorMode === 'dark'
                  ? 'rgba(140, 170, 238, 0.18)'
                  : 'rgba(92, 139, 192, 0.15)'
              }
              color={colorMode === 'dark' ? '#8caaee' : '#4973a6'}
              px={{ base: 1.5, sm: 2 }}
              py={{ base: '1px', sm: '2px' }}
              borderRadius="md"
              fontSize={{ base: 'sm', sm: 'md' }}
              fontWeight="800"
              fontFamily="'Poppins', sans-serif"
              letterSpacing="0.02em"
              lineHeight="none"
            >
              {bookCount}
            </Flex>
          </Flex>

          {/* Bottom Line */}
          <Box
            w="full"
            h="1px"
            bg={lineColor}
            transition="background-color 0.2s"
          />
        </Flex>
      </Flex>
    </Tooltip>
  );
}
