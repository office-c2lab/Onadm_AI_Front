import { readdir, readFile, writeFile } from 'node:fs/promises';
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(entry =>
      entry.isDirectory() ? filesIn(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]
    )
  );
  return nested.flat();
}
const files = (await filesIn('src')).filter(file => /\.(jsx|css)$/.test(file)).sort();
const lines = [
  '# UI 파일 인벤토리',
  '',
  '`npm run audit:ui`로 재생성합니다. 정적 소스 집계이며 조건부 화면/모달의 브라우저 실행 검증과는 구분합니다.',
  '',
  '| 파일 | 분류 | 컴포넌트 선언 | 테이블 | 모달 계층 |',
  '| --- | --- | --- | ---: | ---: |',
];
for (const file of files) {
  const text = await readFile(file, 'utf8');
  const role = file.endsWith('.css')
    ? '스타일'
    : /(?:Page|Route)\.jsx$/.test(file)
      ? '페이지/라우트'
      : /Layout\.jsx$/.test(file) || file.includes('/layout')
        ? '레이아웃'
        : '컴포넌트';
  const names = [...text.matchAll(/(?:export\s+(?:default\s+)?)?function\s+([A-Z]\w*)\s*\(/g)].map(
    match => match[1]
  );
  const tables = [...text.matchAll(/<(?:table|DataTable)\b/g)].length;
  const dialogs = [...text.matchAll(/<(?:DialogLayer|Modal|Drawer|ToolInfoModalShell)\b/g)].length;
  lines.push(
    `| [${file}](../${file}) | ${role} | ${names.join(', ') || '—'} | ${tables} | ${dialogs} |`
  );
}
lines.push(
  '',
  `전체 ${files.length}개 JSX/CSS 파일. SVG/PNG 원본, 데이터·쿼리·훅 JS는 이 표에서 제외됩니다.`,
  ''
);
await writeFile('docs/ui-inventory.md', lines.join('\n'));
console.log(`docs/ui-inventory.md 갱신: ${files.length}개 파일`);
