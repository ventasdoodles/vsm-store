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
  
  // Replace <MemoryRouter ...> <Routes> <Route ... /> </Routes> </MemoryRouter>
  content = content.replace(
    /<MemoryRouter initialEntries=\{([^}]+)\}>[\s\S]*?<Route path="([^"]+)" element=\{<([A-Za-z0-9_]+)[^>]*\/>\} \/>[\s\S]*?<\/MemoryRouter>/g,
    `<TestRouter initialEntries={$1} path="$2" component={$3} />`
  );

  // Replace <MemoryRouter ...> <Component /> </MemoryRouter>
  content = content.replace(
    /<MemoryRouter initialEntries=\{([^}]+)\}>[\s\S]*?<([A-Za-z0-9_]+) \/>[\s\S]*?<\/MemoryRouter>/g,
    (match, initialEntries, componentName) => {
        if (componentName === 'TestRouter') return match;
        return `<TestRouter initialEntries={${initialEntries}} component={${componentName}} />`;
    }
  );

  fs.writeFileSync(file, content);
  console.log('Updated ' + path.basename(file));
}
