import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const server = process.env.UI_TEST_BASE_URL
  ? null
  : await createServer({ server: { host: '127.0.0.1', port: 0 } });
if (server) await server.listen();
const baseUrl = process.env.UI_TEST_BASE_URL || server.resolvedUrls.local[0];
let browser;
const pageErrors = [];
const routes = [
  '/character',
  '/user/ondam',
  '/user/aistore/store',
  '/user/aistore/store/report',
  '/user/aistore/mytools',
  '/user/aistore/register',
  '/user/aistore/guide',
  '/user/aistore/library/downloads',
  '/user/aistore/library/favorites',
  '/admin/dashboard',
  '/admin/discover/url-analysis',
  '/admin/discover/intelligence',
  ...[
    'usage',
    'models',
    'prompts',
    'classification',
    'policies',
    'limits',
    'credit-history',
    'history',
  ].map(path => `/admin/control/internal/${path}`),
  ...['dashboard', 'monitoring', 'users', 'policies', 'domains', 'support'].map(
    path => `/admin/control/external/${path}`
  ),
  '/admin/control/external/policies?view=privacySettings',
  '/admin/control/external/policies?view=fileUploadSettings',
  ...['apps', 'security', 'approvals', 'catalog', 'policies'].map(path => `/admin/manage/${path}`),
  '/admin/users',
  '/admin/departments',
  '/admin/roles',
  ...['modules', 'jobs', 'audit', 'settings'].map(path => `/admin/system/${path}`),
  '/download',
];
async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(entry =>
        entry.isDirectory()
          ? sourceFiles(`${directory}/${entry.name}`)
          : [`${directory}/${entry.name}`]
      )
    )
  ).flat();
}
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  page.setDefaultTimeout(10_000);
  page.on('pageerror', error => pageErrors.push(`${page.url()}: ${error.message}`));
  const goto = async route => {
    await page.goto(new URL(route, baseUrl).href);
    await page.locator('#root > *').first().waitFor();
  };
  for (const route of routes) {
    await goto(route);
    assert((await page.locator('#root').innerText()).trim().length > 0, `빈 화면: ${route}`);
  }
  console.log(`PASS: ${routes.length}개 화면/설정 뷰 렌더링`);

  // CSS variables referenced by charts and SVG must survive Tailwind's build-time pruning.
  const files = (await sourceFiles('src')).filter(file => /\.(jsx?|css)$/.test(file));
  const texts = await Promise.all(files.map(file => readFile(file, 'utf8')));
  const colorVariables = [
    ...new Set(
      texts.flatMap(text => [...text.matchAll(/var\((--color-[\w-]+)/g)].map(match => match[1]))
    ),
  ];
  const missingColors = await page.evaluate(names => {
    const style = getComputedStyle(document.documentElement);
    return names.filter(name => !style.getPropertyValue(name).trim());
  }, colorVariables);
  assert.deepEqual(missingColors, [], '정의되지 않은 색상 토큰');
  console.log(`PASS: ${colorVariables.length}개 CSS/SVG/차트 색상 토큰`);

  await goto('/admin/control/internal/models');
  const trigger = page.getByRole('button', { name: '제공자 등록', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  assert(await dialog.getAttribute('aria-labelledby'));
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  assert(await dialog.evaluate(element => element.contains(document.activeElement)));
  const buttons = dialog.locator('button');
  await buttons.last().focus();
  await page.keyboard.press('Tab');
  assert(await buttons.first().evaluate(element => element === document.activeElement));
  await page.keyboard.press('Shift+Tab');
  assert(await buttons.last().evaluate(element => element === document.activeElement));
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  assert(await trigger.evaluate(element => element === document.activeElement));
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  await trigger.click();
  await dialog.waitFor();
  await page.mouse.click(5, 5);
  await dialog.waitFor({ state: 'detached' });
  console.log('PASS: 관리자 모달 이름·Tab 순환·Escape·포커스 복원·배경 클릭');

  for (const [route, name] of [
    ['/admin/manage/apps', '보고서 작성 도우미 상세 관리'],
    ['/user/aistore/mytools', '보고서 작성 도우미 상세 정보 보기'],
    ['/admin/control/external/support', '수정하기'],
    ['/admin/control/internal/limits', '지급 기준 등록'],
  ]) {
    await goto(route);
    await page.getByRole('button', { name, exact: true }).click();
    await page.getByRole('dialog').waitFor();
    assert(
      await page.getByRole('dialog').evaluate(element => element.contains(document.activeElement))
    );
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'detached' });
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  }
  console.log('PASS: 사용자 상세·관리 Drawer·배포 설정·지급 기준 모달');

  await goto('/admin/control/external/policies?view=privacySettings');
  const firstRow = page.locator('main table tbody tr').first();
  await firstRow.waitFor();
  await firstRow.click();
  const detail = page.getByRole('dialog', { name: '개인정보 분류 상세 설정', exact: true });
  await detail.waitFor();
  const category = detail.getByRole('textbox', { name: /^분류/ });
  const originalCategory = await category.inputValue();
  await category.fill(`${originalCategory} 수정 확인`);
  await detail.getByRole('button', { name: '삭제', exact: true }).click();
  await page.getByRole('dialog', { name: '개인정보 분류 삭제', exact: true }).waitFor();
  assert.equal(await page.getByRole('dialog').count(), 2);
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 1);
  assert.equal(await category.inputValue(), `${originalCategory} 수정 확인`);
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  await page.keyboard.press('Escape');
  await detail.waitFor({ state: 'detached' });
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  console.log('PASS: 중첩 모달·최상위 Escape·초안 보존·스크롤 잠금');

  await goto('/admin/control/external/policies?view=fileUploadSettings');
  const toggle = page.getByRole('switch').first();
  await toggle.waitFor();
  assert(await toggle.getAttribute('aria-label'));
  const before = await toggle.getAttribute('aria-checked');
  await toggle.click();
  await page.waitForFunction(
    expected =>
      document.querySelector('main [role="switch"]')?.getAttribute('aria-checked') === expected,
    before === 'true' ? 'false' : 'true'
  );
  console.log('PASS: 공통 토글 접근성 이름·설정 변경과 쿼리 갱신');

  for (const route of ['/admin/control/internal/models', '/user/aistore/store', '/user/ondam']) {
    await goto(route);
    await page.getByRole('button', { name: '사이드바 닫기', exact: true }).click();
    await page.reload();
    assert.equal(await page.locator('.ui-sidebar-frame').getAttribute('data-open'), 'false');
    await page.getByRole('button', { name: '사이드바 열기', exact: true }).click();
  }
  console.log('PASS: 관리자·스토어·채팅 사이드바 상태 저장');

  await page.setViewportSize({ width: 390, height: 844 });
  for (const [route, name] of [
    ['/admin/control/internal/models', '제공자 등록'],
    ['/user/aistore/mytools', '보고서 작성 도우미 상세 정보 보기'],
  ]) {
    await goto(route);
    await page.getByRole('button', { name, exact: true }).click();
    const mobileDialog = page.getByRole('dialog');
    const box = await mobileDialog.boundingBox();
    assert(
      box && box.x >= 0 && box.x + box.width <= 391 && box.y >= 0 && box.y + box.height <= 845,
      '모바일 화면을 벗어난 모달'
    );
    await page.keyboard.press('Escape');
  }
  console.log('PASS: 390px 화면에서 사용자·관리자 모달 크기');
  assert.deepEqual(pageErrors, [], '브라우저 실행 오류');
} finally {
  await browser?.close();
  await server?.close();
}
