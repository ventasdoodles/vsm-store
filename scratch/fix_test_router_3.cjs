const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/pages/__tests__/**/*.test.tsx');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix the previously broken literal ${...} insertions
  content = content.replace(
    /\(\(\) => \{\s*const history = createMemoryHistory\(\{ initialEntries: \$\{initialEntries\} \}\);\s*const rootRoute = createRootRoute\(\);\s*const route = createRoute\(\{ getParentRoute: \(\) => rootRoute, path: '\$\{routePath\}', component: \$\{componentName\} \}\);\s*const router = createRouter\(\{ routeTree: rootRoute\.addChildren\(\[route\]\), history \}\);\s*return <RouterProvider router=\{router\} \/>;\s*\}\)\(\)/g,
    "<MemoryRouter initialEntries={['/']}></MemoryRouter>" // reset back so we can fix it below
  );
  
  content = content.replace(
    /\(\(\) => \{\s*const history = createMemoryHistory\(\{ initialEntries: \$\{initialEntries\} \}\);\s*const rootRoute = createRootRoute\(\);\s*const route = createRoute\(\{ getParentRoute: \(\) => rootRoute, path: '\/\*', component: \$\{componentName\} \}\);\s*const router = createRouter\(\{ routeTree: rootRoute\.addChildren\(\[route\]\), history \}\);\s*return <RouterProvider router=\{router\} \/>;\s*\}\)\(\)/g,
    "<MemoryRouter initialEntries={['/']}></MemoryRouter>"
  );

  // We actually need to just restore from git first.
}
