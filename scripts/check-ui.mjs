import { readdir, readFile } from 'node:fs/promises';

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(entry =>
      entry.isDirectory() ? filesIn(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]
    )
  );
  return nested.flat();
}
const files = (await filesIn('src')).filter(file => /\.(jsx?|css)$/.test(file));
const failures = [];
for (const file of files) {
  if (
    file.startsWith('src/assets/') ||
    file === 'src/styles/tokens.css' ||
    file === 'src/styles/artworkTokens.js' ||
    file === 'src/styles/artwork-tokens.css' ||
    file === 'src/styles/layout-tokens.css'
  )
    continue;
  const text = await readFile(file, 'utf8');
  const rules = [
    [
      '직접 지정한 색상',
      /(?:#[\da-f]{6}(?![\da-f])|(?:bg|text|border|ring)-\[#[\da-f]+\]|rgba?\(\s*\d)/i,
    ],
    [
      '직접 지정한 글자 크기',
      /text-\[(?:\d|clamp\()|fontSize:\s*(?:\d|['"]\d)|font-size:\s*(?:\d|clamp\()/,
    ],
    [
      '페이지에 의존하는 공통 UI',
      file.startsWith('src/components/ui/') || file.startsWith('src/components/layout/')
        ? /from\s*['"][^'"]*pages\//
        : /(?!)/,
    ],
  ];
  for (const [label, pattern] of rules) {
    const match = pattern.exec(text);
    if (match) failures.push(`${file}:${text.slice(0, match.index).split('\n').length}: ${label}`);
  }
  if (text.includes('role="dialog"') && !/DialogLayer|<Modal\b/.test(text))
    failures.push(`${file}: 공통 DialogLayer 없이 구현한 모달`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`UI 규칙 검사 통과 (${files.length}개 파일, 토큰 정의·원본 이미지 제외)`);
}
