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
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { ExternalLink } from "lucide-react";
import { getCategoryStyles } from "./BookCard";
import { bookTags } from "../data/bookTags";

export default function BookDetailDrawer({ book, isOpen, onClose }) {
  if (!book) return null;

  const categoryStyles = getCategoryStyles(book.category);
  const tags = bookTags[book.title] || [];

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

        <DrawerHeader pt={8} pb={2}>
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
        </DrawerHeader>

        <DrawerBody>
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
