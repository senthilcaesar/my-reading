import { currentlyReading } from '../data/currentlyReading';

// The hanging "What I'm reading" tag is 24px from the left edge, 164px wide and
// swings out ~25px, so anything beside it starts at least this far from the edge.
export const READING_TAG_CLEAR = 232;

// The page content is centred at up to 1280px with 32px padding (24px on
// tablets), so from this width on its own margin already clears the tag.
export const READING_TAG_ROOMY = `(min-width: ${1280 + 2 * (READING_TAG_CLEAR - 32)}px)`;

// Left padding for the search box and filters: their usual padding, or enough to
// keep them clear of the tag on narrower screens. The grid keeps its full width;
// the tag is short enough to end above its first row.
const clearOf = (pad) => `max(${pad}, calc(${READING_TAG_CLEAR}px - max(0px, (100vw - 1280px) / 2)))`;
export const READING_TAG_CONTROLS_PL = currentlyReading.length
  ? { base: 3, sm: 4, md: clearOf('1.5rem'), lg: clearOf('2rem') }
  : { base: 3, sm: 4, md: 6, lg: 8 };
