import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/my-reading/', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  
  // Take a screenshot
  await page.screenshot({ path: './tag-verification.png' });
  
  // Check if badges with tags are present
  const badges = await page.locator('svg[role="img"], [role="status"]').count();
  const textContent = await page.locator('body').textContent();
  
  // Look for tag-like content (small text, common tags)
  const hasLeadership = textContent.includes('Leadership');
  const hasManagement = textContent.includes('Management');
  const hasAI = textContent.includes('AI');
  
  console.log('✅ App loaded successfully');
  console.log('Screenshot saved to: ./tag-verification.png');
  console.log('Tags found on page:');
  console.log(`  - Leadership: ${hasLeadership ? '✅' : '❌'}`);
  console.log(`  - Management: ${hasManagement ? '✅' : '❌'}`);
  console.log(`  - AI: ${hasAI ? '✅' : '❌'}`);
  
  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
