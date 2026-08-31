import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
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
import { getCategoryStyles } from "./BookCard";
import { bookTags } from "../data/bookTags";

const MotionBox = motion(Box);

export default function BookDetailDrawer({ book, isOpen, onClose }) {
  if (!book) return null;

  const categoryStyles = getCategoryStyles(book.category);
  const tags = bookTags[book.title] || [];
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
          pb={2}
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
            mt={3}
          >
            {book.title}
          </Heading>
          <Text color="textSecondary" fontSize="md" fontStyle="italic" mt={1}>
            by {book.author}
          </Text>
        </MotionBox>

        <DrawerBody>
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

        <DrawerFooter borderTopWidth="1px" borderColor="borderPrimary" gap={3}>
          <Button
            variant="ghost"
            color="textSecondary"
            borderRadius="xl"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            as="a"
            href={book.link}
            target="_blank"
            rel="noopener noreferrer"
            rightIcon={<ExternalLink size={16} />}
            bg="accentPrimary"
            color="bg"
            borderRadius="xl"
            fontWeight="bold"
            _hover={{ bg: "accentSecondary", transform: "translateY(-1px)" }}
            isDisabled={!book.link}
          >
            Visit Link
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
