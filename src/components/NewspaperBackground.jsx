import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

export default function NewspaperBackground() {
  // Authentic newspaper ink colors — subtle and deeply integrated into the page
  const headlineColor = useColorModeValue(
    'rgba(20, 16, 12, 0.22)',
    'rgba(220, 226, 250, 0.14)',
  );

  const bannerHeadlineColor = useColorModeValue(
    'rgba(16, 12, 8, 0.25)',
    'rgba(230, 235, 255, 0.16)',
  );

  const bodyTextColor = useColorModeValue(
    'rgba(32, 26, 18, 0.16)',
    'rgba(200, 208, 238, 0.105)',
  );

  const subtextColor = useColorModeValue(
    'rgba(50, 42, 30, 0.14)',
    'rgba(180, 190, 225, 0.09)',
  );

  const ruleColor = useColorModeValue(
    'rgba(24, 18, 12, 0.16)',
    'rgba(215, 222, 248, 0.10)',
  );

  // Soft atmospheric vignette that keeps readability crisp without obscuring the broadsheet prose
  const vignetteOverlay = useColorModeValue(
    'radial-gradient(ellipse at 50% 50%, rgba(250, 249, 245, 0.02) 0%, rgba(250, 249, 245, 0.18) 70%, rgba(242, 239, 228, 0.35) 100%)',
    'radial-gradient(ellipse at 50% 50%, rgba(48, 52, 70, 0.02) 0%, rgba(48, 52, 70, 0.18) 70%, rgba(32, 35, 48, 0.35) 100%)',
  );

  return (
    <Box
      position='fixed'
      top={0}
      left={0}
      right={0}
      bottom={0}
      pointerEvents='none'
      zIndex={0}
      overflow='hidden'
      aria-hidden='true'
      transition='background-color 0.6s ease'
    >
      {/* Pure Vector Broadsheet Front Page — 100% News Typography, Zero Ad Boxes */}
      <Box position='absolute' top={0} left={0} w='100%' h='100%'>
        <svg width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern
              id='authentic-frontpage-broadsheet'
              width='1320'
              height='1060'
              patternUnits='userSpaceOnUse'
            >
              {/* ========================================================= */}
              {/* TOP FOLIO & WEATHER EARS                                 */}
              {/* ========================================================= */}
              <line
                x1='20'
                y1='18'
                x2='1300'
                y2='18'
                stroke={ruleColor}
                strokeWidth='1'
              />

              {/* Weather Ear (Top Left) */}
              <text
                x='24'
                y='13'
                fill={subtextColor}
                fontSize='8'
                fontFamily="'Lora', Georgia, serif"
              >
                THE WEATHER: Fair and colder tonight; tomorrow partly cloudy.
                High 68, Low 48.
              </text>

              {/* Edition Ear (Top Right) */}
              <text
                x='1296'
                y='13'
                fill={subtextColor}
                fontSize='8.5'
                fontFamily="'Lora', Georgia, serif"
                textAnchor='end'
                fontWeight='600'
              >
                LATE CITY EDITION • VOL. CLXXIV NO. 60,142 • THREE CENTS
              </text>

              {/* ========================================================= */}
              {/* FRONT PAGE MASTHEAD                                       */}
              {/* ========================================================= */}
              <text
                x='660'
                y='60'
                fill={bannerHeadlineColor}
                fontSize='46'
                fontFamily="'Lora', Georgia, serif"
                letterSpacing='8px'
                textAnchor='middle'
                fontWeight='800'
              >
                THE PAPER
              </text>

              <text
                x='660'
                y='78'
                fill={subtextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
                letterSpacing='3.5px'
                textAnchor='middle'
                fontStyle='italic'
              >
                “All the News That’s Fit to Print” • An International Record of
                World Events &amp; Science
              </text>

              {/* Masthead Dividing Hairlines & Date Line */}
              <line
                x1='20'
                y1='88'
                x2='1300'
                y2='88'
                stroke={ruleColor}
                strokeWidth='0.75'
              />
              <text
                x='660'
                y='100'
                fill={subtextColor}
                fontSize='8.5'
                fontFamily="'Poppins', sans-serif"
                letterSpacing='2.5px'
                textAnchor='middle'
                fontWeight='bold'
              >
                NEW YORK, WEDNESDAY, SEPTEMBER 18 • SIXTY-FOUR PAGES •
                INTERNATIONAL WIRE DISPATCHES
              </text>
              <line
                x1='20'
                y1='106'
                x2='1300'
                y2='106'
                stroke={ruleColor}
                strokeWidth='1.5'
              />
              <line
                x1='20'
                y1='110'
                x2='1300'
                y2='110'
                stroke={ruleColor}
                strokeWidth='0.75'
              />

              {/* ========================================================= */}
              {/* VERTICAL COLUMN HAIRLINE RULES (4 UNIFORM COLUMNS)        */}
              {/* ========================================================= */}
              <line
                x1='330'
                y1='114'
                x2='330'
                y2='1040'
                stroke={ruleColor}
                strokeWidth='0.75'
              />
              <line
                x1='650'
                y1='114'
                x2='650'
                y2='1040'
                stroke={ruleColor}
                strokeWidth='0.75'
              />
              <line
                x1='970'
                y1='114'
                x2='970'
                y2='1040'
                stroke={ruleColor}
                strokeWidth='0.75'
              />

              {/* ========================================================= */}
              {/* COLUMN 1: LEAD WAR REPORT                                 */}
              {/* ========================================================= */}
              <text
                x='25'
                y='136'
                fill={subtextColor}
                fontSize='8.5'
                fontFamily="'Poppins', sans-serif"
                fontWeight='bold'
                letterSpacing='1px'
              >
                SPECIAL WIRE CORRESPONDENT
              </text>
              <line
                x1='25'
                y1='142'
                x2='150'
                y2='142'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              <text
                x='25'
                y='162'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Allied Forces Advance
              </text>
              <text
                x='25'
                y='180'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Across Western Frontier
              </text>
              <text
                x='25'
                y='198'
                fill={subtextColor}
                fontSize='9'
                fontFamily="'Lora', Georgia, serif"
                fontStyle='italic'
              >
                Armored Units Secure Key Crossings as Front Lines Move
              </text>

              <text
                x='25'
                y='220'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                SUPREME HEADQUARTERS, ALLIED EXPEDITIONARY
              </text>
              <text
                x='25'
                y='234'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                FORCES — Powerful armored columns and motorized infantry
              </text>
              <text
                x='25'
                y='274'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                have driven forty miles through fortified frontier positions
              </text>
              <text
                x='25'
                y='288'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                in the greatest coordinated offensive of the campaign.
              </text>
              <text
                x='25'
                y='302'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Preceded by a thunderous three-hour bombardment from three
              </text>
              <text
                x='25'
                y='316'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                thousand heavy artillery batteries, Allied divisions bridged the
              </text>
              <text
                x='25'
                y='330'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                main river line before dawn, taking opposing commanders by
              </text>
              <text
                x='25'
                y='344'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                complete tactical surprise.
              </text>

              {/* Paragraph 2 with traditional newspaper indent */}
              <text
                x='40'
                y='366'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Eyewitness dispatches from advanced observation posts
              </text>
              <text
                x='25'
                y='380'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                report enemy rear-guard units burning command depots and
              </text>
              <text
                x='25'
                y='394'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                retreating eastward along every available highway. Allied
              </text>
              <text
                x='25'
                y='408'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                fighter-bombers, operating in continuous tactical waves, have
              </text>
              <text
                x='25'
                y='422'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                demolished railway chokepoints and severed all communication
              </text>
              <text
                x='25'
                y='436'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                between opposing field headquarters.
              </text>

              {/* Paragraph 3 */}
              <text
                x='40'
                y='458'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                More than eight thousand prisoners were processed at forward
              </text>
              <text
                x='25'
                y='472'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                enclosures during the first eighteen hours of fighting. Naval
              </text>
              <text
                x='25'
                y='486'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                bombardment groups, operating close inshore along the northern
              </text>
              <text
                x='25'
                y='500'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                flank, pulverized coastal artillery emplacements with
                fifteen-inch
              </text>
              <text
                x='25'
                y='514'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                shells, allowing amphibious reconnaissance units to advance
              </text>
              <text
                x='25'
                y='528'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                completely unopposed along the beaches.
              </text>

              <line
                x1='60'
                y1='548'
                x2='295'
                y2='548'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              {/* Secondary Story in Column 1 */}
              <text
                x='25'
                y='572'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Civilian Populations Greet
              </text>
              <text
                x='25'
                y='590'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Advancing Allied Armor
              </text>
              <text
                x='25'
                y='608'
                fill={subtextColor}
                fontSize='9'
                fontFamily="'Lora', Georgia, serif"
                fontStyle='italic'
              >
                Towns Liberated Along Western Frontier as Troops Push Forward
              </text>

              <text
                x='40'
                y='628'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                WITH THE ALLIED FIRST ARMY — Thousands of citizens lined
              </text>
              <text
                x='25'
                y='642'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                the streets of liberated provincial capitals this afternoon,
              </text>
              <text
                x='25'
                y='656'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                waving national banners and offering food to tank crews as
              </text>
              <text
                x='25'
                y='670'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Sherman tanks rolled past municipal squares. Public utilities
              </text>
              <text
                x='25'
                y='684'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                and hospital facilities were secured intact by underground
              </text>
              <text
                x='25'
                y='698'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                resistance units hours before the armored vanguard arrived.
              </text>

              <text
                x='40'
                y='720'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Municipal councils have already resumed administrative
              </text>
              <text
                x='25'
                y='734'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                functions under civil affairs guidance, distributing food
                rations
              </text>
              <text
                x='25'
                y='748'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                and medical supplies delivered by long convoys of transport
              </text>
              <text
                x='25'
                y='762'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                trucks following immediately behind combat echelons.
              </text>

              <text
                x='40'
                y='784'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                The Supreme Commander, in a special communiqué released
              </text>
              <text
                x='25'
                y='798'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                at midnight, commended all forces for their extraordinary
              </text>
              <text
                x='25'
                y='812'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                discipline and speed, asserting that the momentum of the drive
              </text>
              <text
                x='25'
                y='826'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                would be sustained without pause until final objectives are met.
              </text>

              <text
                x='40'
                y='848'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Military attachés in neutral capitals view today’s operations
              </text>
              <text
                x='25'
                y='862'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                as the decisive turning point of the European conflict, noting
              </text>
              <text
                x='25'
                y='876'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                that the Axis command structure has suffered irreversible
              </text>
              <text
                x='25'
                y='890'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                attrition across both its armored reserves and supply networks.
              </text>

              <text
                x='40'
                y='912'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Air transport commands report that forward airstrips are
              </text>
              <text
                x='25'
                y='926'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                already operational within twenty miles of the front, allowing
              </text>
              <text
                x='25'
                y='940'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                immediate aerial resupply and rapid medical evacuation for
              </text>
              <text
                x='25'
                y='954'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                wounded personnel directly to base hospitals in the rear.
              </text>

              <text
                x='40'
                y='976'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Further official bulletins from operational headquarters are
              </text>
              <text
                x='25'
                y='990'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                scheduled for release at six o’clock tomorrow morning.
              </text>

              {/* ========================================================= */}
              {/* COLUMN 2: ARTIFICIAL INTELLIGENCE, GENOMICS & MENTAL HEALTH*/}
              {/* ========================================================= */}
              {/* COLUMN 2: BAKING, TOURISM/TRAVEL & ENTREPRENEURSHIP       */}
              {/* ========================================================= */}
              <text
                x='345'
                y='136'
                fill={subtextColor}
                fontSize='8.5'
                fontFamily="'Poppins', sans-serif"
                fontWeight='bold'
                letterSpacing='1px'
              >
                CULINARY ARTS &amp; FERMENTATION
              </text>
              <line
                x1='345'
                y1='142'
                x2='520'
                y2='142'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              <text
                x='345'
                y='162'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Artisan Bakers Revive Ancient
              </text>
              <text
                x='345'
                y='180'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Fermentation Traditions
              </text>
              <text
                x='345'
                y='198'
                fill={subtextColor}
                fontSize='9'
                fontFamily="'Lora', Georgia, serif"
                fontStyle='italic'
              >
                Wild Sourdough Cultures and Heritage Grains Transform Baking
              </text>

              <text
                x='360'
                y='220'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                PARIS &amp; COPENHAGEN — Across European academies and craft
              </text>
              <text
                x='345'
                y='234'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                bakeries, a renaissance in ancient grain milling and spontaneous
              </text>
              <text
                x='345'
                y='248'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                fermentation is reshaping modern culinary craft. Master bakers
              </text>
              <text
                x='345'
                y='262'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                are abandoning commercial yeast additives in favor of biodynamic
              </text>
              <text
                x='345'
                y='276'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                heritage wheats, including emmer, einkorn, and stone-ground
                spelt.
              </text>

              <text
                x='360'
                y='298'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Laboratory assays indicate that slow, forty-eight-hour
                fermentation
              </text>
              <text
                x='345'
                y='312'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                cycles dramatically lower glycemic impact while cultivating
                complex
              </text>
              <text
                x='345'
                y='326'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                organic acids that lend unmatched depth of flavor and crisp
                aeration
              </text>
              <text
                x='345'
                y='340'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                to crusty hearth boules. Guilds report record apprentice
                enrollment
              </text>
              <text
                x='345'
                y='354'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                as consumers seek unhurried, authentic craftsmanship.
              </text>

              {/* Dividing Hairline */}
              <line
                x1='365'
                y1='378'
                x2='625'
                y2='378'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              {/* Story 2: Tourism / Travel */}
              <text
                x='345'
                y='402'
                fill={subtextColor}
                fontSize='8.5'
                fontFamily="'Poppins', sans-serif"
                fontWeight='bold'
                letterSpacing='1px'
              >
                GLOBAL TOURISM &amp; EXPEDITIONS
              </text>
              <line
                x1='345'
                y1='408'
                x2='515'
                y2='408'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              <text
                x='345'
                y='428'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Alpine Rail Journeys Lead
              </text>
              <text
                x='345'
                y='446'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Sustainable Tourism Surge
              </text>
              <text
                x='345'
                y='464'
                fill={subtextColor}
                fontSize='9'
                fontFamily="'Lora', Georgia, serif"
                fontStyle='italic'
              >
                Scenic Cross-Continental Sleeper Routes Modernize Overland
                Travel
              </text>

              <text
                x='360'
                y='486'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                VIENNA &amp; OSLO — A sweeping revival of international sleeper
              </text>
              <text
                x='345'
                y='500'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                rail and slow travel itineraries has drawn record numbers of
                global
              </text>
              <text
                x='345'
                y='514'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                voyages away from crowded flight corridors. Restored panoramic
              </text>
              <text
                x='345'
                y='528'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                expresses winding through Alpine passes and Nordic fjords offer
              </text>
              <text
                x='345'
                y='542'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                travelers low-emission passage paired with unrivaled vistas.
              </text>

              <text
                x='360'
                y='564'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Municipal tourism boards in historic mountain hamlets note that
              </text>
              <text
                x='345'
                y='578'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                extended-stay rail visitors patronize independent lodgings and
                local
              </text>
              <text
                x='345'
                y='592'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                artisans, dispersing economic vitality beyond congested capital
                centers.
              </text>
              <text
                x='345'
                y='606'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Rail operators are investing billions into modernized luxury
                carriages
              </text>
              <text
                x='345'
                y='620'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                featuring observation cars and regional farm-to-table dining.
              </text>

              <text
                x='360'
                y='642'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Cultural heritage foundations praise the shift, citing reduced
                carbon
              </text>
              <text
                x='345'
                y='656'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                footprints and deeper cultural immersion for conscious
                explorers.
              </text>

              {/* Dividing Hairline */}
              <line
                x1='365'
                y1='680'
                x2='625'
                y2='680'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              {/* Story 3: Entrepreneurship */}
              <text
                x='345'
                y='704'
                fill={subtextColor}
                fontSize='8.5'
                fontFamily="'Poppins', sans-serif"
                fontWeight='bold'
                letterSpacing='1px'
              >
                COMMERCE &amp; VENTURE
              </text>
              <line
                x1='345'
                y1='710'
                x2='470'
                y2='710'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              <text
                x='345'
                y='730'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Independent Founders Forge
              </text>
              <text
                x='345'
                y='748'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Era of Bootstrapped Enterprise
              </text>
              <text
                x='345'
                y='766'
                fill={subtextColor}
                fontSize='9'
                fontFamily="'Lora', Georgia, serif"
                fontStyle='italic'
              >
                Capital Efficiency and Craftsmanship Define Next Wave of Growth
              </text>

              <text
                x='360'
                y='788'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                AUSTIN &amp; LONDON — In a decisive departure from speculative
                venture
              </text>
              <text
                x='345'
                y='802'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                cycles, a growing vanguard of technology and lifestyle founders
                are
              </text>
              <text
                x='345'
                y='816'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                building profitable, highly resilient companies financed
                entirely from
              </text>
              <text
                x='345'
                y='830'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                customer revenues. Lean software stacks enable teams to scale
                globally.
              </text>

              <text
                x='360'
                y='852'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Economists tracking business formation report that
                capital-efficient
              </text>
              <text
                x='345'
                y='866'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                firms achieve higher decade-long survival rates and retain
                complete
              </text>
              <text
                x='345'
                y='880'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                creative autonomy. The movement has inspired a generation of
                makers
              </text>
              <text
                x='345'
                y='894'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                focused on durable customer value and long-term sustainable
                enterprise.
              </text>

              <text
                x='360'
                y='916'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Founders emphasize that healthy profit margins and direct
                customer
              </text>
              <text
                x='345'
                y='930'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                relationships foster genuine innovation, reshaping commercial
                philosophy.
              </text>

              {/* ========================================================= */}
              {/* ========================================================= */}
              {/* COLUMN 3: CULINARY ARTS, TRAVEL & INDEPENDENT ENTERPRISE   */}
              {/* ========================================================= */}
              <text
                x='665'
                y='136'
                fill={subtextColor}
                fontSize='8.5'
                fontFamily="'Poppins', sans-serif"
                fontWeight='bold'
                letterSpacing='1px'
              >
                HERITAGE GASTRONOMY
              </text>
              <line
                x1='665'
                y1='142'
                x2='820'
                y2='142'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              <text
                x='665'
                y='162'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Master Pâtissiers Revive
              </text>
              <text
                x='665'
                y='180'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Traditional Hearth Baking
              </text>
              <text
                x='665'
                y='198'
                fill={subtextColor}
                fontSize='9'
                fontFamily="'Lora', Georgia, serif"
                fontStyle='italic'
              >
                Centuries-Old Parisian Techniques Meet Sustainable Agriculture
              </text>

              <text
                x='680'
                y='220'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                LYON &amp; KYOTO — Culinary academies in France and Japan are
              </text>
              <text
                x='665'
                y='234'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                forging historic partnerships to preserve traditional lamination
              </text>
              <text
                x='665'
                y='248'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                and wood-fired baking methods. Using cultured pasture butter and
              </text>
              <text
                x='665'
                y='262'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                naturally aged sourdough leavens, artisans produce delicate
              </text>
              <text
                x='665'
                y='276'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                viennoiserie prized for honeycomb structure and layered
                flakiness.
              </text>

              <text
                x='680'
                y='298'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Confectionery guilds emphasize that slow temperature retardation
              </text>
              <text
                x='665'
                y='312'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                unlocks nutty, caramelized aromas that factory methods cannot
              </text>
              <text
                x='665'
                y='326'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                replicate. Regional cooperatives ensure smallholder grain
                farmers
              </text>
              <text
                x='665'
                y='340'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                receive fair premiums for single-origin heritage crops.
              </text>

              {/* Dividing Hairline */}
              <line
                x1='685'
                y1='364'
                x2='945'
                y2='364'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              {/* Story 2: Tourism / Travel */}
              <text
                x='665'
                y='388'
                fill={subtextColor}
                fontSize='8.5'
                fontFamily="'Poppins', sans-serif"
                fontWeight='bold'
                letterSpacing='1px'
              >
                MARITIME &amp; HERITAGE TRAVEL
              </text>
              <line
                x1='665'
                y1='394'
                x2='840'
                y2='394'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              <text
                x='665'
                y='414'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Coastal Sailing Expeditions
              </text>
              <text
                x='665'
                y='432'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Chart Era of Slow Voyaging
              </text>
              <text
                x='665'
                y='450'
                fill={subtextColor}
                fontSize='9'
                fontFamily="'Lora', Georgia, serif"
                fontStyle='italic'
              >
                Wind-Powered Vessels and Ancient Wayfinding Draw Global
                Travelers
              </text>

              <text
                x='680'
                y='472'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                ATHENS &amp; REYKJAVIK — A quiet revolution in maritime leisure
              </text>
              <text
                x='665'
                y='486'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                is steering globetrotters toward classic wooden tall ships and
              </text>
              <text
                x='665'
                y='500'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                electric sailing catamarans. Cruising pristine archipelagos from
                the
              </text>
              <text
                x='665'
                y='514'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Cyclades to the Lofoten Islands, travelers embrace celestial
              </text>
              <text
                x='665'
                y='528'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                navigation, secluded cove anchorages, and quiet stewardship.
              </text>

              <text
                x='680'
                y='550'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Conservationists note that slow oceanic itineraries eliminate
                diesel
              </text>
              <text
                x='665'
                y='564'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                emissions while supporting fragile coastal ecology. Shore
                excursions
              </text>
              <text
                x='665'
                y='578'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                are guided by local marine biologists and maritime historians,
              </text>
              <text
                x='665'
                y='592'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                enriching voyagers with living oral traditions and reef
                research.
              </text>

              {/* Dividing Hairline */}
              <line
                x1='685'
                y1='616'
                x2='945'
                y2='616'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              {/* Story 3: Entrepreneurship */}
              <text
                x='665'
                y='640'
                fill={subtextColor}
                fontSize='8.5'
                fontFamily="'Poppins', sans-serif"
                fontWeight='bold'
                letterSpacing='1px'
              >
                INDEPENDENT ENTERPRISE &amp; CRAFT
              </text>
              <line
                x1='665'
                y1='646'
                x2='860'
                y2='646'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              <text
                x='665'
                y='666'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Micro-Manufactories Lead
              </text>
              <text
                x='665'
                y='684'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Precision Industrial Boom
              </text>
              <text
                x='665'
                y='702'
                fill={subtextColor}
                fontSize='9'
                fontFamily="'Lora', Georgia, serif"
                fontStyle='italic'
              >
                Local Workshops and Direct Commerce Prove Vitality of Niche
                Goods
              </text>

              <text
                x='680'
                y='724'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                SHEFFIELD &amp; PORTLAND — Independent engineering workshops
              </text>
              <text
                x='665'
                y='738'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                are spearheading a global resurgence in precision hardware and
              </text>
              <text
                x='665'
                y='752'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                specialized tools. Using computerized desktop lathes and
                zero-waste
              </text>
              <text
                x='665'
                y='766'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                subtractive machining, small founder-led outfits produce bespoke
              </text>
              <text
                x='665'
                y='780'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                timepieces, acoustic equipment, and hand-tuned optical
                instruments.
              </text>

              <text
                x='680'
                y='802'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Industry analysts report these micro-enterprises achieve
                profitability
              </text>
              <text
                x='665'
                y='816'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                within months by selling directly to passionate global
                enthusiast
              </text>
              <text
                x='665'
                y='830'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                communities, proving that artisanal dedication outlasts mass
                production.
              </text>

              <text
                x='680'
                y='852'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Founders credit community patronage and open-source schematics
              </text>
              <text
                x='665'
                y='866'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                for enabling small-scale builders to compete with industrial
                giants,
              </text>
              <text
                x='665'
                y='880'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                revitalizing historic manufacturing districts across the globe.
              </text>

              <text
                x='680'
                y='902'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                The movement reflects a fundamental cultural reassessment of
                value,
              </text>
              <text
                x='665'
                y='916'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                where longevity, repairability, and creator integrity take
                precedence
              </text>
              <text
                x='665'
                y='930'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                over planned obsolescence in modern consumer markets.
              </text>

              {/* ========================================================= */}
              {/* COLUMN 4: AI, GENOMICS & MENTAL HEALTH                    */}
              {/* ========================================================= */}
              <text
                x='985'
                y='136'
                fill={subtextColor}
                fontSize='8.5'
                fontFamily="'Poppins', sans-serif"
                fontWeight='bold'
                letterSpacing='1px'
              >
                FRONTIER ARTIFICIAL INTELLIGENCE
              </text>
              <line
                x1='985'
                y1='142'
                x2='1140'
                y2='142'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              <text
                x='985'
                y='162'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Artificial Intelligence
              </text>
              <text
                x='985'
                y='180'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Achieves Reasoning Feat
              </text>
              <text
                x='985'
                y='198'
                fill={subtextColor}
                fontSize='9'
                fontFamily="'Lora', Georgia, serif"
                fontStyle='italic'
              >
                Autonomous Neural Models Solve Complex Symbolic Proofs
              </text>

              <text
                x='1000'
                y='220'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                GENEVA &amp; SAN FRANCISCO — Leading research laboratories
              </text>
              <text
                x='985'
                y='234'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                announced a historic milestone in artificial intelligence as new
              </text>
              <text
                x='985'
                y='248'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                foundation architectures demonstrated verified multi-step
              </text>
              <text
                x='985'
                y='262'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                reasoning across formal logic and software engineering.
              </text>
              <text
                x='985'
                y='276'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                By integrating test-time verification with iterative chain-of-
              </text>
              <text
                x='985'
                y='290'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                thought deliberation, the models autonomously formulate
              </text>
              <text
                x='985'
                y='304'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                hypotheses and debug algorithmic errors without supervision.
              </text>

              <text
                x='1000'
                y='326'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                International safety institutes certified the findings,
              </text>
              <text
                x='985'
                y='340'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                noting that automated reasoning marks a transition from
              </text>
              <text
                x='985'
                y='354'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                passive statistical pattern-matching to active scientific
              </text>
              <text
                x='985'
                y='368'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                discovery, accelerating development across all technical fields.
              </text>

              {/* Dividing Hairline */}
              <line
                x1='1005'
                y1='392'
                x2='1275'
                y2='392'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              {/* Story 2: Genome Sequencing */}
              <text
                x='985'
                y='416'
                fill={subtextColor}
                fontSize='8.5'
                fontFamily="'Poppins', sans-serif"
                fontWeight='bold'
                letterSpacing='1px'
              >
                GENOMIC MEDICINE &amp; SEQUENCING
              </text>
              <line
                x1='985'
                y1='422'
                x2='1140'
                y2='422'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              <text
                x='985'
                y='442'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Rapid Genome Sequencing
              </text>
              <text
                x='985'
                y='460'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Transforms Clinical Care
              </text>
              <text
                x='985'
                y='478'
                fill={subtextColor}
                fontSize='9'
                fontFamily="'Lora', Georgia, serif"
                fontStyle='italic'
              >
                Ultra-High Throughput Platforms Map Entire Chromosomes in
                Minutes
              </text>

              <text
                x='1000'
                y='500'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                CAMBRIDGE &amp; BETHESDA — Biomedical consortia unveiled
              </text>
              <text
                x='985'
                y='514'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                next-generation long-read sequencing technology capable of
              </text>
              <text
                x='985'
                y='528'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                mapping a complete, telomere-to-telomere human genome in
              </text>
              <text
                x='985'
                y='542'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                under thirty minutes at negligible per-sample operational cost.
              </text>
              <text
                x='985'
                y='556'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                The advance allows neonatal and intensive-care clinics to
              </text>
              <text
                x='985'
                y='570'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                diagnose rare genetic mutations within hours of patient intake.
              </text>

              <text
                x='1000'
                y='592'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Clinicians report unprecedented success in tailoring targeted
              </text>
              <text
                x='985'
                y='606'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                CRISPR gene therapies and personalized oncology vaccines
              </text>
              <text
                x='985'
                y='620'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                based on real-time genomic profiling. Public health agencies
              </text>
              <text
                x='985'
                y='634'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                have launched nationwide initiatives to make comprehensive
              </text>
              <text
                x='985'
                y='648'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                genomic sequencing standard for preventative family medicine.
              </text>

              {/* Dividing Hairline */}
              <line
                x1='1005'
                y1='672'
                x2='1275'
                y2='672'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              {/* Story 3: Mental Health */}
              <text
                x='985'
                y='696'
                fill={subtextColor}
                fontSize='8.5'
                fontFamily="'Poppins', sans-serif"
                fontWeight='bold'
                letterSpacing='1px'
              >
                NEUROSCIENCE &amp; MENTAL HEALTH
              </text>
              <line
                x1='985'
                y1='702'
                x2='1140'
                y2='702'
                stroke={ruleColor}
                strokeWidth='0.5'
              />

              <text
                x='985'
                y='722'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Global Initiative Prioritizes
              </text>
              <text
                x='985'
                y='740'
                fill={headlineColor}
                fontSize='15'
                fontFamily="'Lora', Georgia, serif"
                fontWeight='bold'
              >
                Modern Mental Health
              </text>
              <text
                x='985'
                y='758'
                fill={subtextColor}
                fontSize='9'
                fontFamily="'Lora', Georgia, serif"
                fontStyle='italic'
              >
                Clinical Trials Validate New Therapies in Neuroplasticity &amp;
                Care
              </text>

              <text
                x='1000'
                y='780'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                LONDON &amp; STOCKHOLM — An international medical commission
              </text>
              <text
                x='985'
                y='794'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                published landmark multi-center clinical findings establishing
              </text>
              <text
                x='985'
                y='808'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                new therapeutic benchmarks for cognitive well-being. Combining
              </text>
              <text
                x='985'
                y='822'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                non-invasive neural stimulation, biomarker sleep tracking, and
              </text>
              <text
                x='985'
                y='836'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                evidence-based cognitive therapy, the protocols achieved
              </text>
              <text
                x='985'
                y='850'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                sustained remission rates for chronic anxiety and mood
                disorders.
              </text>

              <text
                x='1000'
                y='872'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                The World Health Assembly unanimously adopted resolutions
              </text>
              <text
                x='985'
                y='886'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                integrating mental healthcare into universal healthcare
                mandates,
              </text>
              <text
                x='985'
                y='900'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                recommending workplace wellness standards and accessible
              </text>
              <text
                x='985'
                y='914'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                community-based psychological support across member states.
              </text>

              <text
                x='1000'
                y='936'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                Researchers emphasize that viewing neuroplasticity as a lifelong
              </text>
              <text
                x='985'
                y='950'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                dynamic capacity removes historical stigmas, elevating mental
              </text>
              <text
                x='985'
                y='964'
                fill={bodyTextColor}
                fontSize='10'
                fontFamily="'Lora', Georgia, serif"
              >
                wellness to a primary pillar of lifelong human health.
              </text>

              {/* ========================================================= */}
              {/* AUTHENTIC BROADSHEET FOOTER RULE & PAGE FOLIO            */}
              {/* ========================================================= */}
              <line
                x1='20'
                y1='1040'
                x2='1300'
                y2='1040'
                stroke={ruleColor}
                strokeWidth='1'
              />
              <text
                x='660'
                y='1052'
                fill={subtextColor}
                fontSize='8'
                fontFamily="'Lora', Georgia, serif"
                letterSpacing='2.5px'
                textAnchor='middle'
              >
                — THE PAPER • PAGE ONE • ALL RIGHTS RESERVED • PRINTED
                CONTINUOUSLY ON BROAD-SHEET PRESSES —
              </text>
            </pattern>
          </defs>

          {/* Full viewport pattern fill */}
          <rect
            x='0'
            y='0'
            width='100%'
            height='100%'
            fill='url(#authentic-frontpage-broadsheet)'
          />
        </svg>
      </Box>

      {/* Subtle atmospheric vignette layer that preserves readability while keeping broadsheet prose visible */}
      <Box
        position='absolute'
        top={0}
        left={0}
        right={0}
        bottom={0}
        background={vignetteOverlay}
        transition='background 0.6s ease'
      />
    </Box>
  );
}
