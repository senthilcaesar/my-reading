import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Box, Flex, Image, Text, useBreakpointValue, useMediaQuery } from '@chakra-ui/react';
import { animate, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { books } from '../data/parsedBooks';
import { currentlyReading } from '../data/currentlyReading';
import { READING_TAG_ROOMY } from './readingTagLayout';

const MotionBox = motion(Box);
const MotionG = motion.g;

const readingBooks = currentlyReading
  .map((title) => books.find((book) => book.title.toLowerCase() === title.toLowerCase()))
  .filter(Boolean)
  .slice(0, 3);

// The string starts at the very top of the viewport, behind the sticky header,
// so the tag seems to hang from it.
// The tag is sized to end above the first row of book cards, which keep their
// full width even where the search box and filters are narrowed beside it.
const STRING = 78;
const CHAMFER = 22; // clipped top corners, like a luggage or library tag
const SIZES = {
  base: { w: 132, h: 196, title: '24px', stowedBottom: 74 },
  md: { w: 164, h: 204, title: '30px', stowedBottom: 84 },
};
const SWAY_PERIOD = 3500; // ms for one full back-and-forth
const SWAY_AMPLITUDE = 1.6; // degrees
const SWAY_HOVER_AMPLITUDE = 5; // degrees, while the pointer is over the tag
const SWAY_EASE = 500; // ms for the swing size to (mostly) reach a new amplitude
const token = (name) => `var(--chakra-colors-${name})`;

// A small stack of books in the site's three accents.
function BookStack({ width, lifted }) {
  return (
    <svg viewBox="0 0 100 58" width={width} aria-hidden="true">
      <rect x="8" y="44" width="84" height="12" rx="2" fill={token('accentSecondary')} />
      <rect x="15" y="46.5" width="2" height="7" fill={token('tagBg')} opacity="0.55" />
      <rect x="83" y="46.5" width="2" height="7" fill={token('tagBg')} opacity="0.55" />
      <rect x="14" y="32" width="72" height="12" rx="2" fill={token('accentMagenta')} />
      <rect x="21" y="34.5" width="2" height="7" fill={token('tagBg')} opacity="0.55" />
      <rect x="77" y="34.5" width="2" height="7" fill={token('tagBg')} opacity="0.55" />
      <MotionG
        initial={false}
        animate={{ y: lifted ? -5 : 0, rotate: lifted ? -4 : 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
        style={{ transformOrigin: '50px 26px' }}
      >
        <rect x="20" y="20" width="60" height="12" rx="2" fill={token('accentPrimary')} />
        <rect x="27" y="22.5" width="2" height="7" fill={token('tagBg')} opacity="0.55" />
        <rect x="71" y="22.5" width="2" height="7" fill={token('tagBg')} opacity="0.55" />
        {/* ribbon bookmark */}
        <path d="M62 32 v10 l3 -2.5 l3 2.5 v-10 z" fill={token('accentSecondary')} />
      </MotionG>
    </svg>
  );
}

// Thin double rule, as around "LIBRARY" in the header badge.
function DoubleRule() {
  return (
    <Box w="full" borderTop="1px solid" borderBottom="1px solid" borderColor="borderPrimary" h="3px" opacity={0.8} />
  );
}

function Face({ back, hidden, children, ...rest }) {
  const clip = `polygon(${CHAMFER}px 0, calc(100% - ${CHAMFER}px) 0, 100% ${CHAMFER}px, 100% 100%, 0 100%, 0 ${CHAMFER}px)`;
  return (
    <Box
      position="absolute"
      inset={0}
      transform={back ? 'rotateY(180deg)' : undefined}
      // drop-shadow (not box-shadow) so the shadow follows the clipped corners
      filter="drop-shadow(0 14px 22px rgba(0,0,0,0.22)) drop-shadow(0 2px 3px rgba(0,0,0,0.12))"
      sx={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
      inert={hidden}
      {...rest}
    >
      <Box position="absolute" inset={0} bg="borderPrimary" sx={{ clipPath: clip }}>
        <Box position="absolute" inset="1px" bg="tagBg" color="textPrimary" sx={{ clipPath: clip }}>
          {/* stitched inner edge */}
          <Box
            position="absolute"
            inset="6px"
            border="1px dashed"
            borderColor="borderPrimary"
            opacity={0.55}
            sx={{ clipPath: clip }}
            pointerEvents="none"
          />
          {/* eyelet: a reinforced hole showing the page behind */}
          <Box
            position="absolute"
            top="13px"
            left="50%"
            transform="translateX(-50%)"
            w="16px"
            h="16px"
            borderRadius="full"
            bg="bg"
            border="3px solid"
            borderColor="accentPrimary"
            boxShadow="inset 0 1px 2px rgba(0,0,0,0.25)"
          />
          {children}
        </Box>
      </Box>
    </Box>
  );
}

function NowReadingTag({ onBookSelect }) {
  const reduceMotion = useReducedMotion();
  const isWide = useBreakpointValue({ base: false, md: true }, { ssr: false });
  const size = isWide ? SIZES.md : SIZES.base;
  const [roomy] = useMediaQuery(READING_TAG_ROOMY, { ssr: false });

  const [flipped, setFlipped] = useState(false);
  const [scrolledAway, setScrolledAway] = useState(false);
  // Tapping the stowed tag drops it down until the reader scrolls on a fair way.
  const [dropped, setDropped] = useState(null); // scrollY when dropped, or null
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolledAway(y > 120);
      setDropped((prev) => (prev !== null && Math.abs(y - prev) > 320 ? null : prev));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // On phones it would cover the search box, so it starts tucked under the header.
  const stowed = dropped === null && (scrolledAway || !isWide);
  const showBack = flipped && !stowed;

  // Swing: a slow idle sway, the reader can grab and swing it, and it settles
  // back like a pendulum when let go.
  const rotate = useMotionValue(0);
  const swayRef = useRef(null);
  // Hovering the tag makes it swing wider; the swing size eases towards this target.
  const swayTarget = useRef(SWAY_AMPLITUDE);
  useEffect(() => {
    swayTarget.current = hovered && !stowed ? SWAY_HOVER_AMPLITUDE : SWAY_AMPLITUDE;
  }, [hovered, stowed]);

  // The idle sway is a sine wave, so it only slows at the ends of each swing
  // (eased keyframes stop dead at every keyframe, including mid-swing). From the
  // centre it starts at zero size; from the end of a swing (`from`) a quarter-turn
  // on, at that size. Either way it picks up the tag's current position with no
  // jump in speed, and the size then eases towards the target.
  const startSway = useCallback((from = 0) => {
    swayRef.current?.stop();
    if (reduceMotion) return;
    const phaseOffset = (Math.sign(from) * Math.PI) / 2;
    let amplitude = Math.abs(from);
    let phase = 0;
    let last = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const dt = Math.min(now - last, 100); // don't leap after a background tab
      last = now;
      phase += (2 * Math.PI * dt) / SWAY_PERIOD;
      amplitude += (swayTarget.current - amplitude) * (1 - Math.exp(-dt / SWAY_EASE));
      rotate.set(amplitude * Math.sin(phase + phaseOffset));
      frame = requestAnimationFrame(step);
    });
    swayRef.current = { stop: () => cancelAnimationFrame(frame) };
  }, [reduceMotion, rotate]);
  useEffect(() => {
    startSway();
    return () => swayRef.current?.stop();
  }, [startSway]);

  const wrapperRef = useRef(null);
  const drag = useRef(null);
  const suppressClick = useRef(false);

  const pointerAngle = (e) => {
    const el = wrapperRef.current;
    const pivotX = el.offsetLeft + el.offsetWidth / 2;
    return (Math.atan2(e.clientX - pivotX, Math.max(e.clientY, 1)) * 180) / Math.PI;
  };

  const handlePointerDown = (e) => {
    if (stowed || e.button !== 0) return;
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      angle: pointerAngle(e),
      rotate: rotate.get(),
      active: false,
    };
  };

  const handlePointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.active) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return;
      // Only capture once it's clearly a drag, so taps still reach the book buttons.
      d.active = true;
      swayRef.current?.stop();
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const next = d.rotate - (pointerAngle(e) - d.angle);
    rotate.set(Math.max(-55, Math.min(55, next)));
  };

  const handlePointerUp = (e) => {
    const d = drag.current;
    drag.current = null;
    if (!d?.active) return;
    suppressClick.current = true;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    // Hand over to the idle sway at the end of a swing (where the tag is momentarily
    // still anyway) once the swings are idle-sized, rather than letting the spring
    // come to rest in the middle first.
    let prev = rotate.get();
    let direction = 0;
    swayRef.current = animate(rotate, 0, {
      type: 'spring',
      stiffness: 110,
      damping: reduceMotion ? 28 : 4.5,
      velocity: rotate.getVelocity(),
      onUpdate: (latest) => {
        const next = Math.sign(latest - prev);
        if (next !== 0 && direction !== 0 && next !== direction && Math.abs(latest) <= swayTarget.current) {
          startSway(latest);
          return;
        }
        if (next !== 0) direction = next;
        prev = latest;
      },
      onComplete: () => startSway(),
    });
  };

  const handleClickCapture = (e) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleTagClick = () => {
    if (stowed) {
      setDropped(window.scrollY);
      return;
    }
    setFlipped((f) => !f);
  };

  if (readingBooks.length === 0 || isWide === undefined) return null;

  const restingTop = STRING;
  const stowedOffset = size.stowedBottom - (restingTop + size.h);

  return (
    <MotionBox
      ref={wrapperRef}
      position="fixed"
      top={0}
      left={{ base: 3, md: 6 }}
      zIndex={99} // just under the sticky header, so it tucks away beneath the glass
      w={`${size.w}px`}
      style={{ rotate, originX: 0.5, originY: 0 }}
      initial={false}
      animate={{ y: stowed ? stowedOffset + (hovered ? 10 : 0) : 0 }}
      transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 140, damping: 18 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={handleClickCapture}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{ touchAction: 'pan-y', userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Twine, ending in the eyelet */}
      <Box
        position="absolute"
        top={0}
        left="50%"
        transform="translateX(-50%)"
        w="2px"
        h={`${restingTop + 21}px`}
        bg="tagTwine"
        borderRadius="full"
        zIndex={3}
        pointerEvents="none"
      />

      <Box h={`${restingTop}px`} />

      <Box position="relative" w={`${size.w}px`} h={`${size.h}px`} sx={{ perspective: '900px' }}>
        <MotionBox
          position="relative"
          w="full"
          h="full"
          sx={{ transformStyle: 'preserve-3d' }}
          initial={false}
          animate={{ rotateY: showBack ? 180 : 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 14 }}
        >
          {/* Front */}
          <Face
            hidden={showBack}
            as="button"
            type="button"
            cursor={stowed ? 's-resize' : 'pointer'}
            aria-label={stowed ? 'Show what I’m reading' : 'What I’m reading — flip to see the books'}
            aria-expanded={showBack}
            onClick={handleTagClick}
            _focusVisible={{ outline: '2px solid', outlineColor: 'accentPrimary', outlineOffset: '3px' }}
          >
            <Flex
              direction="column"
              align="center"
              h="full"
              pt={isWide ? '40px' : '36px'}
              px={isWide ? 4 : 3}
              textAlign="center"
            >
              <Text
                mt={isWide ? 2 : 1.5}
                fontFamily="'Lora', Georgia, serif"
                fontStyle="italic"
                fontWeight="500"
                fontSize={isWide ? '18px' : '15px'}
                lineHeight={1.1}
                color="textPrimary"
              >
                What I’m
              </Text>
              <Text
                fontFamily="'Rye', serif"
                fontSize={size.title}
                lineHeight={1.15}
                color="accentPrimary"
                whiteSpace="nowrap"
                mb={isWide ? 2 : 1.5}
              >
                reading.
              </Text>
              <DoubleRule />

              <Box mt="auto" mb={isWide ? 1 : 0.5}>
                <BookStack width={isWide ? 96 : 76} lifted={hovered && !stowed && !reduceMotion} />
              </Box>
              <Text
                mb={isWide ? '16px' : '12px'}
                fontFamily="'Lora', Georgia, serif"
                fontSize={isWide ? '10px' : '9px'}
                letterSpacing="0.12em"
                color="textSecondary"
              >
                — {new Date().getFullYear()} —
              </Text>
            </Flex>
          </Face>

          {/* Back: a ruled library card */}
          <Face back hidden={!showBack} onClick={handleTagClick} cursor="pointer">
            <Flex direction="column" h="full" pt={isWide ? '35px' : '32px'} px={isWide ? 3 : 2.5}>
              <Text
                fontFamily="'Pacifico', cursive"
                fontSize={isWide ? '15px' : '12.5px'}
                color="accentMagenta"
                textAlign="center"
                lineHeight={1.3}
                mb={1}
              >
                On my nightstand
              </Text>
              <Box h="2px" bg="accentPrimary" opacity={0.7} mb={1} />

              <Flex as="ul" direction="column" listStyleType="none">
                {readingBooks.map((book) => (
                  <Box as="li" key={book.title} borderBottom="1px dashed" borderColor="borderPrimary">
                    <Flex
                      as="button"
                      type="button"
                      w="full"
                      align="center"
                      gap={2}
                      px={1}
                      py={isWide ? 0.5 : 1}
                      textAlign="left"
                      transition="background-color 0.15s ease"
                      _hover={{ bg: 'surfaceHover' }}
                      _focusVisible={{ outline: '2px solid', outlineColor: 'accentPrimary' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookSelect(book);
                      }}
                    >
                      {book.coverUrl ? (
                        <Image
                          src={book.coverUrl}
                          alt=""
                          w={isWide ? '22px' : '20px'}
                          h={isWide ? '33px' : '30px'}
                          objectFit="cover"
                          borderRadius="2px"
                          flexShrink={0}
                          boxShadow="0 1px 4px rgba(0,0,0,0.3)"
                          draggable={false}
                          onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                        />
                      ) : (
                        <Box w={isWide ? '22px' : '20px'} h={isWide ? '33px' : '30px'} bg="surface" borderRadius="2px" flexShrink={0} />
                      )}
                      <Box minW={0}>
                        <Text
                          fontFamily="'Poppins', sans-serif"
                          fontWeight="600"
                          fontSize={isWide ? '10.5px' : '9px'}
                          lineHeight={1.2}
                          color="textPrimary"
                          noOfLines={2}
                        >
                          {book.title.split(':')[0]}
                        </Text>
                        <Text
                          fontStyle="italic"
                          fontSize={isWide ? '9.5px' : '8px'}
                          color="textSecondary"
                          noOfLines={1}
                          mt="1px"
                        >
                          {book.author}
                        </Text>
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </Flex>

              <Flex
                mt="auto"
                mb={isWide ? '10px' : '11px'}
                justify="center"
                align="center"
                gap={1}
                color="textSecondary"
                fontFamily="'Poppins', sans-serif"
                fontSize="8px"
                letterSpacing="0.2em"
              >
                <RotateCcw size={9} />
                <Text as="span">FLIP</Text>
              </Flex>
            </Flex>
          </Face>
        </MotionBox>
      </Box>

      {isWide && roomy && (
        <Text
          mt={3}
          textAlign="center"
          whiteSpace="nowrap"
          mx="-40px"
          fontFamily="'Lora', Georgia, serif"
          fontStyle="italic"
          fontSize="11px"
          color="textSecondary"
          opacity={hovered && !stowed ? 0.9 : 0}
          transition="opacity 0.2s ease"
          pointerEvents="none"
          aria-hidden="true"
        >
          tap to flip · drag to swing
        </Text>
      )}
    </MotionBox>
  );
}

export default memo(NowReadingTag);
