const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/pages/__tests__/**/*.test.tsx');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // We need to replace block:
  // <MemoryRouter initialEntries={...}> ... <Route path="X" element={<Y />} /> ... </MemoryRouter>
  
  // Actually since there are only 5 failing test files, let's just do them manually to ensure correctness.
  // The easiest way is to use a generalized regex matching the whole block.
  
  content = content.replace(
    /<MemoryRouter initialEntries=\{([^}]+)\}>[\s\S]*?<Route path="([^"]+)" element=\{<([A-Za-z0-9_]+)[^>]*\/>\} \/>[\s\S]*?<\/MemoryRouter>/g,
    (match, initialEntries, routePath, componentName) => {
        return `(() => {
            const history = createMemoryHistory({ initialEntries: \${initialEntries} });
            const rootRoute = createRootRoute();
            const route = createRoute({ getParentRoute: () => rootRoute, path: '\${routePath}', component: \${componentName} });
            const router = createRouter({ routeTree: rootRoute.addChildren([route]), history });
            return <RouterProvider router={router} />;
        })()`;
    }
  );

  content = content.replace(
    /<MemoryRouter initialEntries=\{([^}]+)\}>[\s\S]*?<([A-Za-z0-9_]+) \/>[\s\S]*?<\/MemoryRouter>/g,
    (match, initialEntries, componentName) => {
        // If it's already a RouterProvider block, skip it
        if (componentName === 'RouterProvider') return match;
        
        return `(() => {
            const history = createMemoryHistory({ initialEntries: \${initialEntries} });
            const rootRoute = createRootRoute();
            const route = createRoute({ getParentRoute: () => rootRoute, path: '/*', component: \${componentName} });
            const router = createRouter({ routeTree: rootRoute.addChildren([route]), history });
            return <RouterProvider router={router} />;
        })()`;
    }
  );

  fs.writeFileSync(file, content);
  console.log('Updated ' + path.basename(file));
}
