import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Flex,
  Text,
  Button,
  Heading,
  Badge,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, Volume2, VolumeX, Sparkles, ExternalLink, BookOpen, RotateCcw } from "lucide-react";
import { getCategoryStyles } from "../utils/categoryStyles";

const MotionBox = motion(Box);

const WHEEL_COLORS = [
  { bg: "#D97757", text: "#FFFFFF" },
  { bg: "#6A9BCC", text: "#FFFFFF" },
  { bg: "#788C5D", text: "#FFFFFF" },
  { bg: "#E08D3C", text: "#FFFFFF" },
  { bg: "#8C6A9B", text: "#FFFFFF" },
  { bg: "#3D8E86", text: "#FFFFFF" },
  { bg: "#C4627A", text: "#FFFFFF" },
  { bg: "#4A7C59", text: "#FFFFFF" },
  { bg: "#5C6B9E", text: "#FFFFFF" },
  { bg: "#BF5B43", text: "#FFFFFF" },
];

// Synthesized Web Audio sounds (zero external files required)
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playTick(pitchRatio = 1.0) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(800 * pitchRatio, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Ignore audio errors silently
    }
  }

  playWin() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + i * 0.09;
        const dur = 0.4;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.25, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    } catch {
      // Ignore audio errors
    }
  }
}

const sfx = new SoundEffects();

// Deterministic celebratory confetti particles
const CONFETTI_PARTICLES = Array.from({ length: 36 }).map((_, i) => {
  const angle = (i / 36) * 360;
  const distance = 85 + (i % 5) * 28;
  const rad = (angle * Math.PI) / 180;
  return {
    id: i,
    x: Math.cos(rad) * distance,
    y: Math.sin(rad) * distance - 20,
    scale: 0.7 + (i % 4) * 0.2,
    color: ["#d97757", "#6a9bcc", "#788c5d", "#ef9f76", "#8caaee", "#ffd166", "#06d6a0"][i % 7],
    rotation: ((i * 47) % 720) - 360,
  };
});

function ConfettiBurst() {
  return (
    <Box position="absolute" top="40%" left="50%" pointerEvents="none" zIndex={20}>
      {CONFETTI_PARTICLES.map((p) => (
        <MotionBox
          key={p.id}
          position="absolute"
          w="9px"
          h="9px"
          borderRadius={p.id % 2 === 0 ? "full" : "2px"}
          bg={p.color}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [1, 1, 0],
            scale: [0, p.scale, p.scale * 0.5],
            rotate: p.rotation,
          }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      ))}
    </Box>
  );
}

// Helper to pick diverse random books from the catalog
function sampleRandomBooks(booksList, count = 10, excludeTitles = new Set()) {
  if (!booksList || booksList.length === 0) return [];
  const pool = booksList.filter((b) => !excludeTitles.has(b.title));
  const candidatePool = pool.length >= count ? pool : [...booksList];

  // Shuffle array copy
  const shuffled = [...candidatePool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default function BookRouletteModal({
  isOpen,
  onClose,
  books = [],
  onBookSelect,
}) {
  const [candidates, setCandidates] = useState(() => sampleRandomBooks(books, 10));
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningBook, setWinningBook] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showWinnerCard, setShowWinnerCard] = useState(false);
  const [needleBump, setNeedleBump] = useState(0);

  const wheelRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastSectorRef = useRef(0);
  const rotationRef = useRef(0);
  const seenTitlesRef = useRef(new Set());

  // Keep rotationRef in sync
  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  // Pick fresh random candidates from entire catalog
  const pickCandidates = useCallback(() => {
    const fresh = sampleRandomBooks(books, 10);
    setCandidates(fresh);
    setWinningBook(null);
    setShowWinnerCard(false);
  }, [books]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sfx.muted = next;
  };

  const handleSpin = () => {
    if (isSpinning || !books || books.length === 0) return;

    sfx.init();
    setIsSpinning(true);
    setShowWinnerCard(false);

    // 1. Pick a truly random winning book from the entire collection (filtering out recently seen books)
    let availablePool = books.filter((b) => !seenTitlesRef.current.has(b.title));
    if (availablePool.length === 0) {
      seenTitlesRef.current.clear();
      availablePool = [...books];
    }

    const chosenWinner =
      availablePool[Math.floor(Math.random() * availablePool.length)];
    seenTitlesRef.current.add(chosenWinner.title);

    // 2. Select 7-9 other distinct candidate books from the entire collection to form the visual wheel slices
    const otherCandidates = sampleRandomBooks(
      books,
      Math.min(9, Math.max(books.length - 1, 1)),
      new Set([chosenWinner.title]),
    );

    // 3. Assemble and shuffle the slices containing the winning book
    const newWheelSlices = [chosenWinner, ...otherCandidates];
    for (let i = newWheelSlices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newWheelSlices[i], newWheelSlices[j]] = [newWheelSlices[j], newWheelSlices[i]];
    }

    setCandidates(newWheelSlices);

    // 4. Find the slice index of the winning book on the new wheel
    const winnerIdx = newWheelSlices.findIndex(
      (b) => b.title === chosenWinner.title,
    );

    const sliceAngle = 360 / newWheelSlices.length;

    // Center angle of winner slice on the wheel
    const sliceCenterAngle = winnerIdx * sliceAngle + sliceAngle / 2;
    // To land slice center under the top pointer needle (270 deg):
    const targetRemainder = (270 - sliceCenterAngle + 3600) % 360;

    const currentRot = rotationRef.current;
    const currentNorm = ((currentRot % 360) + 360) % 360;

    let deltaAngle = (targetRemainder - currentNorm + 360) % 360;
    if (deltaAngle < 180) {
      deltaAngle += 360;
    }

    // 5 to 7 extra full rotations
    const fullSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    const finalAngle = currentRot + deltaAngle + fullSpins;

    const startTime = performance.now();
    const duration = 4600; // ms
    const initialRot = currentRot;
    const totalDelta = finalAngle - initialRot;

    const easeOutDecel = (t) => 1 - Math.pow(1 - t, 3.5);

    const updateSpin = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const progress = easeOutDecel(t);
      const currentVal = initialRot + totalDelta * progress;

      setRotation(currentVal);

      const currentNormAngle = ((currentVal % 360) + 360) % 360;
      const currentSector = Math.floor(currentNormAngle / sliceAngle);

      if (currentSector !== lastSectorRef.current) {
        lastSectorRef.current = currentSector;
        setNeedleBump((prev) => prev + 1);
        sfx.playTick(0.9 + Math.random() * 0.2);
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(updateSpin);
      } else {
        setIsSpinning(false);
        setWinningBook(chosenWinner);
        setShowWinnerCard(true);
        sfx.playWin();
      }
    };

    animFrameRef.current = requestAnimationFrame(updateSpin);
  };

  const activeCandidates = candidates.length > 0 ? candidates : books.slice(0, 10);
  const sliceAngle = activeCandidates.length > 0 ? 360 / activeCandidates.length : 360;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSpinning) onClose();
      }}
      size={{ base: "full", sm: "lg", md: "xl" }}
      isCentered
      closeOnOverlayClick={!isSpinning}
    >
      <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.700" />
      <ModalContent
        bg="bg"
        color="textPrimary"
        borderRadius={{ base: 0, sm: "2xl" }}
        borderWidth="1px"
        borderColor="borderPrimary"
        shadow="2xl"
        overflow="hidden"
        my={{ base: 0, sm: 6 }}
        maxW={{ base: "100vw", sm: "520px", md: "620px" }}
      >
        <Box h="4px" bgGradient="linear(to-r, accentPrimary, accentSecondary)" />

        <ModalHeader display="flex" alignItems="center" justifyContent="space-between" pb={2} pt={4}>
          <Flex alignItems="center" gap={2.5}>
            <Box
              p={2}
              borderRadius="xl"
              bg="accentPrimary"
              color="bg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              shadow="md"
            >
              <Dices size={20} />
            </Box>
            <Box>
              <Heading size="md" fontFamily="heading">
                Book Roulette
              </Heading>
              <Text fontSize="xs" color="textSecondary" fontWeight="normal">
                Spinning from {books.length} {books.length === 1 ? "book" : "books in catalog"}
              </Text>
            </Box>
          </Flex>

          <Flex alignItems="center" gap={1} pr={8}>
            <Tooltip label={isMuted ? "Unmute Sound" : "Mute Sound"} hasArrow>
              <IconButton
                size="sm"
                variant="ghost"
                borderRadius="full"
                aria-label="Toggle sound"
                icon={isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                onClick={toggleMute}
                color="textSecondary"
                _hover={{ bg: "surfaceHover", color: "textPrimary" }}
              />
            </Tooltip>
          </Flex>
          <ModalCloseButton isDisabled={isSpinning} top={4} right={4} borderRadius="full" />
        </ModalHeader>

        <ModalBody pb={6} px={{ base: 4, sm: 6 }}>
          {books.length === 0 ? (
            <Flex direction="column" align="center" justify="center" py={12} textAlign="center" gap={4}>
              <Text color="textSecondary">No books match your current filters to spin!</Text>
              <Button onClick={onClose} variant="outline" borderColor="borderPrimary">
                Close
              </Button>
            </Flex>
          ) : (
            <Flex direction="column" align="center" position="relative">
              {/* Confetti Celebration on Win */}
              <AnimatePresence>{showWinnerCard && <ConfettiBurst />}</AnimatePresence>

              {/* Roulette Wheel Container */}
              <Box
                position="relative"
                w={{ base: "280px", sm: "340px", md: "370px" }}
                h={{ base: "280px", sm: "340px", md: "370px" }}
                my={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {/* Pointer Needle (Top Center) */}
                <MotionBox
                  position="absolute"
                  top="-12px"
                  left="50%"
                  transform="translateX(-50%)"
                  zIndex={15}
                  animate={{
                    rotate: needleBump % 2 === 0 ? [0, -14, 0] : [0, 14, 0],
                  }}
                  transition={{ duration: 0.1 }}
                  filter="drop-shadow(0 3px 6px rgba(0,0,0,0.4))"
                >
                  <svg width="34" height="42" viewBox="0 0 34 42" fill="none">
                    <path
                      d="M17 42L4 12C2.5 8.5 5 4 9 4H25C29 4 31.5 8.5 30 12L17 42Z"
                      fill="#EF4444"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <circle cx="17" cy="12" r="4.5" fill="#FFFFFF" />
                  </svg>
                </MotionBox>

                {/* Outer Rim Ring */}
                <Box
                  position="absolute"
                  inset="-8px"
                  borderRadius="full"
                  border="6px solid"
                  borderColor="borderPrimary"
                  boxShadow="inset 0 0 20px rgba(0,0,0,0.3), 0 8px 30px rgba(0,0,0,0.25)"
                  pointerEvents="none"
                  zIndex={5}
                />

                {/* Rotating SVG Wheel */}
                <Box
                  ref={wheelRef}
                  as="svg"
                  viewBox="0 0 400 400"
                  w="100%"
                  h="100%"
                  borderRadius="full"
                  overflow="hidden"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                  }}
                >
                  <defs>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.4" />
                    </filter>
                  </defs>

                  {/* Wheel Sectors */}
                  {activeCandidates.map((book, idx) => {
                    const startAngle = idx * sliceAngle;
                    const endAngle = startAngle + sliceAngle;
                    const colorPair = WHEEL_COLORS[idx % WHEEL_COLORS.length];

                    // Center = 200, 200, radius = 195
                    const radius = 195;
                    const cx = 200;
                    const cy = 200;

                    const radStart = (startAngle * Math.PI) / 180;
                    const radEnd = (endAngle * Math.PI) / 180;

                    const x1 = cx + radius * Math.cos(radStart);
                    const y1 = cy + radius * Math.sin(radStart);
                    const x2 = cx + radius * Math.cos(radEnd);
                    const y2 = cy + radius * Math.sin(radEnd);

                    const largeArc = sliceAngle > 180 ? 1 : 0;
                    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    // Text position & rotation along the slice mid-angle
                    const midAngle = startAngle + sliceAngle / 2;
                    const textRad = (midAngle * Math.PI) / 180;
                    const textDistance = radius * 0.62;
                    const tx = cx + textDistance * Math.cos(textRad);
                    const ty = cy + textDistance * Math.sin(textRad);

                    // Truncate title for clean fit on slice
                    const shortTitle =
                      book.title.length > 16
                        ? book.title.substring(0, 15) + "…"
                        : book.title;

                    return (
                      <g key={`${book.title}-${idx}`}>
                        <path
                          d={pathData}
                          fill={colorPair.bg}
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                          strokeOpacity="0.6"
                        />
                        {/* Peg on border */}
                        <circle
                          cx={cx + (radius - 8) * Math.cos(radStart)}
                          cy={cy + (radius - 8) * Math.sin(radStart)}
                          r="3"
                          fill="#FFFFFF"
                          opacity="0.9"
                        />
                        {/* Title text along sector */}
                        <g transform={`translate(${tx}, ${ty}) rotate(${midAngle})`}>
                          <text
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={colorPair.text}
                            fontSize={activeCandidates.length > 8 ? "10.5" : "12"}
                            fontWeight="bold"
                            fontFamily="sans-serif"
                            letterSpacing="0.3px"
                            filter="url(#shadow)"
                          >
                            {shortTitle}
                          </text>
                        </g>
                      </g>
                    );
                  })}

                  {/* Outer edge decorative ring */}
                  <circle
                    cx="200"
                    cy="200"
                    r="194"
                    fill="none"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="3"
                  />
                </Box>

                {/* Center Wheel Hub / Spin Trigger */}
                <Box
                  position="absolute"
                  zIndex={10}
                  w="74px"
                  h="74px"
                  borderRadius="full"
                  bg="bg"
                  borderWidth="4px"
                  borderColor="accentPrimary"
                  shadow="dark-lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor={isSpinning ? "not-allowed" : "pointer"}
                  onClick={handleSpin}
                  _hover={!isSpinning ? { transform: "scale(1.06)", borderColor: "accentSecondary" } : {}}
                  transition="all 0.2s"
                >
                  <Flex direction="column" align="center" justify="center">
                    <Sparkles size={18} color="var(--chakra-colors-accentPrimary)" />
                    <Text
                      fontSize="9px"
                      fontWeight="extrabold"
                      letterSpacing="wider"
                      textTransform="uppercase"
                      color="accentPrimary"
                      mt={0.5}
                    >
                      {isSpinning ? "SPINNING" : "SPIN"}
                    </Text>
                  </Flex>
                </Box>
              </Box>

              {/* Action Bar / Controls */}
              <Flex gap={3} mt={4} w="full" justify="center" align="center">
                <Button
                  leftIcon={<Sparkles size={18} />}
                  size="lg"
                  bg="accentPrimary"
                  color="bg"
                  fontWeight="bold"
                  borderRadius="xl"
                  px={8}
                  shadow="lg"
                  isLoading={isSpinning}
                  loadingText="Spinning the wheel..."
                  onClick={handleSpin}
                  _hover={{ bg: "accentSecondary", transform: "translateY(-1px)" }}
                >
                  {winningBook ? "Spin Again" : "Spin the Wheel!"}
                </Button>

                <Tooltip label="Reshuffle candidate books from pool" hasArrow>
                  <IconButton
                    icon={<RotateCcw size={18} />}
                    aria-label="Reshuffle candidate pool"
                    variant="outline"
                    borderColor="borderPrimary"
                    borderRadius="xl"
                    size="lg"
                    isDisabled={isSpinning}
                    onClick={pickCandidates}
                    _hover={{ bg: "surfaceHover" }}
                  />
                </Tooltip>
              </Flex>

              {/* Winner Reveal Card */}
              <AnimatePresence>
                {showWinnerCard && winningBook && (
                  <MotionBox
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    w="full"
                    mt={5}
                    p={4}
                    bg="surfaceHover"
                    borderRadius="2xl"
                    borderWidth="1.5px"
                    borderColor="accentPrimary"
                    shadow="xl"
                  >
                    <Flex justify="space-between" align="flex-start" gap={2} mb={2}>
                      <Badge
                        colorScheme={getCategoryStyles(winningBook.category).colorScheme}
                        variant="subtle"
                        px={2.5}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="bold"
                        display="inline-flex"
                        alignItems="center"
                        gap={1}
                      >
                        <Text as="span">{getCategoryStyles(winningBook.category).icon}</Text>
                        <Text as="span">{winningBook.category}</Text>
                      </Badge>
                      <Badge colorScheme="green" variant="solid" borderRadius="full" px={2} py={0.5} fontSize="2xs">
                        WINNER!
                      </Badge>
                    </Flex>

                    <Heading size="md" fontFamily="heading" color="textPrimary" lineHeight="short">
                      {winningBook.title}
                    </Heading>
                    <Text fontSize="sm" color="textSecondary" fontStyle="italic" mt={0.5}>
                      by {winningBook.author}
                    </Text>

                    {winningBook.recommender && (
                      <Text fontSize="xs" fontWeight="semibold" color="accentPrimary" mt={1}>
                        ★ Recommended by {winningBook.recommender}
                      </Text>
                    )}

                    <Text
                      fontSize="xs"
                      color="textSecondary"
                      mt={2}
                      noOfLines={3}
                      lineHeight="tall"
                    >
                      {winningBook.summary}
                    </Text>

                    <Flex gap={2} mt={4} pt={2} borderTopWidth="1px" borderColor="borderPrimary">
                      <Button
                        leftIcon={<BookOpen size={16} />}
                        size="sm"
                        flex="1"
                        borderRadius="xl"
                        bg="accentPrimary"
                        color="bg"
                        fontWeight="bold"
                        _hover={{ bg: "accentSecondary" }}
                        onClick={() => {
                          onClose();
                          if (onBookSelect) onBookSelect(winningBook);
                        }}
                      >
                        View Full Details
                      </Button>

                      {winningBook.link && (
                        <Button
                          as="a"
                          href={winningBook.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          rightIcon={<ExternalLink size={14} />}
                          size="sm"
                          variant="outline"
                          borderColor="borderPrimary"
                          color="textPrimary"
                          borderRadius="xl"
                          _hover={{ bg: "surface" }}
                        >
                          Visit Link
                        </Button>
                      )}
                    </Flex>
                  </MotionBox>
                )}
              </AnimatePresence>
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
