const fs = require('fs');
const glob = require('glob');
const path = require('path');
const { execSync } = require('child_process');

execSync('git checkout src/pages/__tests__');

const files = glob.sync('src/pages/__tests__/**/*.test.tsx');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Add TestRouter import
  content = content.replace(
    /import \{.*?MemoryRouter.*?\} from ['"](?:react-router-dom|@tanstack\/react-router)['"];/,
    "import { TestRouter } from '@/lib/test-router';"
  );
  
  content = content.replace(
    /import \{.*?(Route, Routes).*?\} from ['"](?:react-router-dom|@tanstack\/react-router)['"];/,
    ""
  );

  content = content.replace(
    /import \{.*?(Routes, Route).*?\} from ['"](?:react-router-dom|@tanstack\/react-router)['"];/,
    ""
  );
  
  // Clean up empty tanstack imports
  content = content.replace(
    /import \{\s*\} from ['"](?:react-router-dom|@tanstack\/react-router)['"];\r?\n/g,
    ""
  );

  // Replace <MemoryRouter initialEntries={[path]}> <Routes> <Route path="foo" element={<Component />} /> </Routes> </MemoryRouter>
  content = content.replace(
    /<MemoryRouter initialEntries=\{([^}]+)\}>[\s\S]*?<Route path="([^"]+)" element=\{([^}]+)\} \/>[\s\S]*?<\/MemoryRouter>/g,
    `<TestRouter initialEntries={$1} path="$2">$3</TestRouter>`
  );

  // Replace <MemoryRouter initialEntries={[path]}> <Component /> </MemoryRouter>
  content = content.replace(
    /<MemoryRouter initialEntries=\{([^}]+)\}>([\s\S]*?)<\/MemoryRouter>/g,
    `<TestRouter initialEntries={$1}>$2</TestRouter>`
  );

  // Replace <MemoryRouter> <Component /> </MemoryRouter>
  content = content.replace(
    /<MemoryRouter[^>]*>([\s\S]*?)<\/MemoryRouter>/g,
    `<TestRouter>$1</TestRouter>`
  );

  fs.writeFileSync(file, content);
  console.log('Updated ' + path.basename(file));
}
