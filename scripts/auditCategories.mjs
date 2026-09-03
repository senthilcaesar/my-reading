import { mkdirSync, writeFileSync } from 'node:fs';
import { books } from '../src/data/parsedBooks.js';

const outputDir = 'reports';
const reportPath = `${outputDir}/category-audit.md`;
const jsonPath = `${outputDir}/category-audit.json`;

const categories = [
  'Artificial Intelligence',
  'Biography',
  'Business',
  'Culture',
  'Economics',
  'Education',
  'Fiction',
  'Finance',
  'Health',
  'Historical Fiction',
  'History',
  'Leadership',
  'Memoir',
  'Military History',
  'Neuroscience',
  'Non-fiction',
  'Personal Development',
  'Philosophy',
  'Political History',
  'Politics',
  'Psychology',
  'Science',
  'Self-Help',
  'Social Science',
  'Sociology',
  'Sports',
  'Technology',
  'Travel',
];

const rules = [
  {
    category: 'Historical Fiction',
    confidence: 0.95,
    pattern: /\b(historical novel|historical fiction)\b/,
    reason: 'summary explicitly identifies historical fiction',
  },
  {
    category: 'Fiction',
    confidence: 0.9,
    pattern: /\b(fiction novel|historical novel|literary novel|short story collection)\b/,
    reason: 'summary identifies a fiction work',
  },
  {
    category: 'Memoir',
    confidence: 0.95,
    pattern: /\b(memoir|autobiography|diary|dispatches|personal journey|in (his|her|their) own words|my life|my years|my father|story of race and inheritance)\b/,
    reason: 'summary/title identifies memoir or autobiography',
  },
  {
    category: 'Social Science',
    confidence: 0.88,
    pattern: /\b(social order|social mobility|social fabric|social structures|inequality|labor|workers|housing|immigrant|class|society)\b/,
    reason: 'summary/title centers social structures',
  },
  {
    category: 'Biography',
    confidence: 0.92,
    pattern: /\b(biography|biographical|life and times|life of|odyssey of)\b/,
    reason: 'summary/title identifies biography or life history',
  },
  {
    category: 'Military History',
    confidence: 0.93,
    pattern: /\b(world war|wwii|vietnam war|gulf war|war memoir|military|battle|killing fields|auschwitz|pow|soldier|navy seal|army)\b/,
    reason: 'summary/title centers war or military history',
  },
  {
    category: 'Artificial Intelligence',
    confidence: 0.93,
    pattern: /\b(artificial intelligence| ai |machine learning|gpt-|large language models?|neural network|nvidia|semiconductor|microchip)\b/,
    reason: 'summary/title centers AI or modern computing',
  },
  {
    category: 'Neuroscience',
    confidence: 0.9,
    pattern: /\b(neuroscience|brain|neuroplasticity|neurology|cognitive science)\b/,
    reason: 'summary/title centers brain science',
  },
  {
    category: 'Finance',
    confidence: 0.92,
    pattern: /\b(investing|investor|investment|stock|bank|banker|banking|federal reserve|fed\b|financial crisis|money|dividends|bear stearns|goldman sachs|citibank)\b/,
    reason: 'summary/title centers finance, banking, or investing',
  },
  {
    category: 'Economics',
    confidence: 0.9,
    pattern: /\b(economics?|economist|capitalism|markets?|globalization|poverty|trade|middle class|employment|interest|monetary|income distribution|free market)\b/,
    reason: 'summary/title centers economics or political economy',
  },
  {
    category: 'Business',
    confidence: 0.88,
    pattern: /\b(startup|entrepreneur|company|companies|business|management|manager|organization|strategy|leadership|ceo|corporate|platform|retail|nonprofit|hospitality|sales|customers?)\b/,
    reason: 'summary/title centers business or management',
  },
  {
    category: 'Politics',
    confidence: 0.88,
    pattern: /\b(politics|political|government|democracy|president|prime minister|state|policy|justice|rights|power|surveillance|dissident|marx|socialism|communism|revolution)\b/,
    reason: 'summary/title centers politics or government',
  },
  {
    category: 'History',
    confidence: 0.86,
    pattern: /\b(history|historical|century|empire|china|india|america|europe|revolution|famine|bretton woods|cultural revolution)\b/,
    reason: 'summary/title centers historical events or eras',
  },
  {
    category: 'Sociology',
    confidence: 0.86,
    pattern: /\b(sociology|sociological|community|family)\b/,
    reason: 'summary/title centers social structures',
  },
  {
    category: 'Psychology',
    confidence: 0.86,
    pattern: /\b(psychology|psychological|behavior|behaviour|cognitive|decision making|prediction|forecasting|irrational|choice|habits|mind)\b/,
    reason: 'summary/title centers psychology or cognition',
  },
  {
    category: 'Science',
    confidence: 0.86,
    pattern: /\b(science|scientific|physics|biology|chemistry|mathematics|statistics|data science|climate|ecology|evolution|nutrition)\b/,
    reason: 'summary/title centers science or quantitative inquiry',
  },
  {
    category: 'Health',
    confidence: 0.86,
    pattern: /\b(health|wellness|medicine|medical|nutrition|glucose|addiction|blood sugar|disease)\b/,
    reason: 'summary/title centers health or medicine',
  },
  {
    category: 'Philosophy',
    confidence: 0.86,
    pattern: /\b(philosophy|philosophical|ethics|moral|meaning|liberty|freedom)\b/,
    reason: 'summary/title centers philosophy or ethics',
  },
  {
    category: 'Education',
    confidence: 0.84,
    pattern: /\b(education|school|college|teaching|students|teacher|learning|discipline)\b/,
    reason: 'summary/title centers education',
  },
  {
    category: 'Self-Help',
    confidence: 0.84,
    pattern: /\b(self-help|confidence|habits|personal development|motivation|productivity|career advice|negotiate|negotiation)\b/,
    reason: 'summary/title centers practical self-improvement',
  },
  {
    category: 'Travel',
    confidence: 0.84,
    pattern: /\b(travel|journey|abroad|tibet|foreign country|river town)\b/,
    reason: 'summary/title centers travel or living abroad',
  },
  {
    category: 'Sports',
    confidence: 0.84,
    pattern: /\b(basketball|sports|athlete|lebron)\b/,
    reason: 'summary/title centers sports',
  },
];

function inferCategory(book) {
  const text = `${book.title} ${book.author} ${book.summary}`.toLowerCase();
  const match = rules.find((rule) => rule.pattern.test(text));
  if (match) return match;
  if (categories.includes(book.category)) {
    return {
      category: book.category,
      confidence: 0.55,
      reason: 'no strong signal; current normalized category retained',
    };
  }
  return {
    category: 'Non-fiction',
    confidence: 0.45,
    reason: 'no strong signal found',
  };
}

const categoryGroups = {
  'Artificial Intelligence': 'science-tech',
  Biography: 'life-writing',
  Business: 'markets-orgs',
  Culture: 'society',
  Economics: 'markets-orgs',
  Education: 'personal-learning',
  Fiction: 'fiction',
  Finance: 'markets-orgs',
  Health: 'science-tech',
  'Historical Fiction': 'fiction',
  History: 'history-politics',
  Leadership: 'markets-orgs',
  Memoir: 'life-writing',
  'Military History': 'history-politics',
  Neuroscience: 'science-tech',
  'Non-fiction': 'general',
  'Personal Development': 'personal-learning',
  Philosophy: 'ideas',
  'Political History': 'history-politics',
  Politics: 'history-politics',
  Psychology: 'personal-learning',
  Science: 'science-tech',
  'Self-Help': 'personal-learning',
  'Social Science': 'society',
  Sociology: 'society',
  Sports: 'sports',
  Technology: 'science-tech',
  Travel: 'society',
};

const strongAutoCorrectionCategories = new Set([
  'Artificial Intelligence',
  'Biography',
  'Finance',
  'Health',
  'Historical Fiction',
  'Memoir',
  'Military History',
  'Neuroscience',
  'Science',
]);

function hasStrongAutoCorrectionEvidence(book, inferredCategory) {
  const text = `${book.title} ${book.author} ${book.summary}`;
  if (!strongAutoCorrectionCategories.has(inferredCategory)) return false;

  if (inferredCategory === 'Memoir' && /\b(business memoir|part memoir)\b/i.test(text)) {
    return false;
  }

  if (inferredCategory === 'Biography') {
    return /\b(biography|biographical|life and times|life of|autobiography)\b/i.test(text);
  }

  if (inferredCategory === 'Finance') {
    return /\b(finance|bank|banking|investing|investment|stock|financial|portfolio|federal reserve|fed\b)\b/i.test(text);
  }

  if (inferredCategory === 'Military History') {
    return /\b(war|wwii|world war|vietnam|gulf war|military|battle|killing fields|auschwitz|pow|soldier|navy seal|army)\b/i.test(book.title);
  }

  if (inferredCategory === 'Science') {
    return /\b(science|scientific|statistics|mathematics|data science|nutrition|evolution|physics|biology)\b/i.test(text);
  }

  return true;
}

function getStatus(book, inferredCategory, confidence) {
  const currentCategory = book.category;
  if (currentCategory === inferredCategory) return 'match';
  if (currentCategory === 'Non-fiction' && confidence >= 0.84) return 'refinement';
  if (confidence < 0.86) return 'review';

  const currentGroup = categoryGroups[currentCategory];
  const inferredGroup = categoryGroups[inferredCategory];
  if (currentGroup && inferredGroup && currentGroup === inferredGroup) {
    return 'adjacent';
  }
  return hasStrongAutoCorrectionEvidence(book, inferredCategory) ? 'mismatch' : 'review';
}

const rows = books.map((book) => {
  const inferred = inferCategory(book);
  const status = getStatus(book, inferred.category, inferred.confidence);
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    currentCategory: book.category,
    inferredCategory: inferred.category,
    confidence: inferred.confidence,
    status,
    reason: inferred.reason,
  };
});

const counts = rows.reduce((acc, row) => {
  acc[row.status] = (acc[row.status] || 0) + 1;
  return acc;
}, {});

const mismatches = rows.filter((row) => row.status === 'mismatch');
const refinements = rows.filter((row) => row.status === 'refinement');
const adjacent = rows.filter((row) => row.status === 'adjacent');
const reviews = rows.filter((row) => row.status === 'review');

const markdown = [
  '# Category Audit',
  '',
  'This is an inferred taxonomy audit generated from each book title, author, current category, and local summary. It is useful for finding likely mislabels, but it is not a substitute for publisher/library metadata for every row.',
  '',
  `Total books checked: ${rows.length}`,
  `Matches: ${counts.match || 0}`,
  `Likely mismatches: ${counts.mismatch || 0}`,
  `More specific category possible: ${counts.refinement || 0}`,
  `Adjacent/debatable category: ${counts.adjacent || 0}`,
  `Needs review: ${counts.review || 0}`,
  '',
  '## Likely Mismatches',
  '',
  '| Title | Author | Current | Suggested | Confidence | Reason |',
  '| --- | --- | --- | --- | ---: | --- |',
  ...mismatches.map((row) => `| ${escapeTable(row.title)} | ${escapeTable(row.author)} | ${row.currentCategory} | ${row.inferredCategory} | ${row.confidence.toFixed(2)} | ${row.reason} |`),
  '',
  '## More Specific Category Possible',
  '',
  'These are broad `Non-fiction` labels where the local metadata points to a narrower category. They are not necessarily wrong.',
  '',
  '| Title | Author | Current | Suggested | Confidence | Reason |',
  '| --- | --- | --- | --- | ---: | --- |',
  ...refinements.map((row) => `| ${escapeTable(row.title)} | ${escapeTable(row.author)} | ${row.currentCategory} | ${row.inferredCategory} | ${row.confidence.toFixed(2)} | ${row.reason} |`),
  '',
  '## Adjacent Or Debatable',
  '',
  'These are within the same broad family, such as Business/Finance/Economics or Biography/Memoir.',
  '',
  '| Title | Author | Current | Suggested | Confidence | Reason |',
  '| --- | --- | --- | --- | ---: | --- |',
  ...adjacent.map((row) => `| ${escapeTable(row.title)} | ${escapeTable(row.author)} | ${row.currentCategory} | ${row.inferredCategory} | ${row.confidence.toFixed(2)} | ${row.reason} |`),
  '',
  '## Needs Review',
  '',
  '| Title | Author | Current | Suggested | Confidence | Reason |',
  '| --- | --- | --- | --- | ---: | --- |',
  ...reviews.map((row) => `| ${escapeTable(row.title)} | ${escapeTable(row.author)} | ${row.currentCategory} | ${row.inferredCategory} | ${row.confidence.toFixed(2)} | ${row.reason} |`),
  '',
].join('\n');

mkdirSync(outputDir, { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(rows, null, 2)}\n`);
writeFileSync(reportPath, markdown);

console.log(`Wrote ${reportPath}`);
console.log(`Wrote ${jsonPath}`);
console.log(JSON.stringify(counts, null, 2));

function escapeTable(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}
