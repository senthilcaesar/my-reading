import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Badge,
  Box,
  Button,
  Heading,
  Text,
  Image,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { ExternalLink, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { getCategoryStyles } from "../utils/categoryStyles";

const MotionBox = motion(Box);

// Name the destination so readers know where the button goes.
function linkLabel(link) {
  try {
    const host = new URL(link).hostname.replace(/^www\./, "");
    if (host.startsWith("amazon.")) return "View on Amazon";
  } catch {
    // not a valid URL; fall through
  }
  return "Open book page";
}

export default function BookDetailDrawer({ book, isOpen, onClose }) {
  if (!book) return null;

  const categoryStyles = getCategoryStyles(book.category);
  const tags = book.tags;
  const noteText = book.recommendationNote || (book.recommender ? `Recommended by ${book.recommender}` : null);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
      <DrawerOverlay backdropFilter="blur(6px)" />
      <DrawerContent bg="bg" borderLeftWidth="1px" borderColor="borderPrimary">
        <Box
          h="4px"
          bgGradient="linear(to-r, blue.400, orange.400)"
          flexShrink={0}
        />
        <DrawerCloseButton color="textSecondary" borderRadius="full" mt={3} />

        <MotionBox
          as={DrawerHeader}
          key={book.id}
          pt={8}
          pb={5}
          pr={12}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Badge
            colorScheme={categoryStyles.colorScheme}
            variant="subtle"
            px={2.5}
            py={1}
            borderRadius="full"
            display="inline-flex"
            alignItems="center"
            gap={1}
          >
            <Text as="span">{categoryStyles.icon}</Text>
            <Text as="span" fontWeight="bold" letterSpacing="wider">
              {book.category}
            </Text>
          </Badge>
          <Heading
            as="h2"
            fontFamily="heading"
            size="lg"
            color="textPrimary"
            lineHeight="short"
            mt={2.5}
          >
            {book.title}
          </Heading>
          <Text color="textSecondary" fontSize="md" fontStyle="italic" mt={1}>
            by {book.author}
          </Text>

          {book.link && (
            <Button
              as="a"
              href={book.link}
              target="_blank"
              rel="noopener noreferrer"
              rightIcon={<ExternalLink size={16} />}
              mt={4}
              bg="accentPrimary"
              color="bg"
              borderRadius="xl"
              fontFamily="heading"
              fontWeight="bold"
              _hover={{ bg: "accentPrimary", filter: "brightness(0.92)", transform: "translateY(-1px)" }}
              _active={{ bg: "accentPrimary", filter: "brightness(0.85)" }}
            >
              {linkLabel(book.link)}
            </Button>
          )}
        </MotionBox>

        <DrawerBody pt={5} pb={8} borderTopWidth="1px" borderColor="borderPrimary">
          {noteText && (
            <Box
              bg="rgba(176,141,87,0.12)"
              borderWidth="1px"
              borderColor="rgba(176,141,87,0.3)"
              _dark={{ bg: "rgba(0,242,255,0.12)", borderColor: "rgba(0,242,255,0.3)" }}
              borderRadius="xl"
              p={3.5}
              mb={4}
              display="flex"
              alignItems="center"
              gap={3}
            >
              <Box
                p={2}
                borderRadius="full"
                bg="accentPrimary"
                color="bg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Sparkles size={18} />
              </Box>
              <Box>
                <Text
                  fontSize="xs"
                  textTransform="uppercase"
                  fontWeight="bold"
                  letterSpacing="wider"
                  color="textSecondary"
                >
                  Curated Recommendation
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                  {noteText}
                </Text>
              </Box>
            </Box>
          )}

          {tags.length > 0 && (
            <Wrap gap={1.5} mb={4}>
              {tags.map((tag) => (
                <WrapItem key={tag}>
                  <Badge
                    colorScheme="gray"
                    variant="subtle"
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                    fontSize="xs"
                    fontWeight="medium"
                    color="textSecondary"
                    bg="surfaceHover"
                    _dark={{ bg: "rgba(255,255,255,0.05)" }}
                  >
                    {tag}
                  </Badge>
                </WrapItem>
              ))}
            </Wrap>
          )}

          <Text color="textSecondary" fontSize="md" lineHeight="tall">
            {book.summary}
          </Text>

          {book.coverUrl && (
            <Image
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              w="220px"
              h="320px"
              maxW="full"
              objectFit="cover"
              borderRadius="lg"
              mt={6}
              mx="auto"
              shadow="lg"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          )}

        </DrawerBody>

      </DrawerContent>
    </Drawer>
  );
}
