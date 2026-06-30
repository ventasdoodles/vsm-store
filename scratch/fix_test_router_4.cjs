const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/pages/__tests__/**/*.test.tsx');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(
    /import \{.*?MemoryRouter.*?\} from ['"]@tanstack\/react-router['"];/,
    "import { RouterProvider, createRouter, createRootRoute, createRoute, createMemoryHistory } from '@tanstack/react-router';"
  );
  
  content = content.replace(
    /import \{.*?(Route, Routes).*?\} from ['"]@tanstack\/react-router['"];/,
    ""
  );

  content = content.replace(
    /import \{.*?(Routes, Route).*?\} from ['"]@tanstack\/react-router['"];/,
    ""
  );
  
  content = content.replace(
    /<MemoryRouter initialEntries=\{([^}]+)\}>[\s\S]*?<Route path="([^"]+)" element=\{<([A-Za-z0-9_]+)[^>]*\/>\} \/>[\s\S]*?<\/MemoryRouter>/g,
    (match, initialEntries, routePath, componentName) => {
        return "(() => {\n" +
               "    const history = createMemoryHistory({ initialEntries: " + initialEntries + " });\n" +
               "    const rootRoute = createRootRoute();\n" +
               "    const route = createRoute({ getParentRoute: () => rootRoute, path: '" + routePath + "', component: " + componentName + " });\n" +
               "    const router = createRouter({ routeTree: rootRoute.addChildren([route]), history });\n" +
               "    return <RouterProvider router={router} />;\n" +
               "})()";
    }
  );

  content = content.replace(
    /<MemoryRouter initialEntries=\{([^}]+)\}>[\s\S]*?<([A-Za-z0-9_]+) \/>[\s\S]*?<\/MemoryRouter>/g,
    (match, initialEntries, componentName) => {
        if (componentName === 'RouterProvider' || componentName === 'Route') return match;
        
        return "(() => {\n" +
               "    const history = createMemoryHistory({ initialEntries: " + initialEntries + " });\n" +
               "    const rootRoute = createRootRoute();\n" +
               "    const route = createRoute({ getParentRoute: () => rootRoute, path: '/*', component: " + componentName + " });\n" +
               "    const router = createRouter({ routeTree: rootRoute.addChildren([route]), history });\n" +
               "    return <RouterProvider router={router} />;\n" +
               "})()";
    }
  );

  fs.writeFileSync(file, content);
  console.log('Updated ' + path.basename(file));
}
