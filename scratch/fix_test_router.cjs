const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/pages/__tests__/**/*.test.tsx');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace imports
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
  
  // Custom replace for each file based on its render setup:

  // PaymentSuccess.test.tsx
  if (file.includes('PaymentSuccess.test.tsx')) {
    content = content.replace(
      /<MemoryRouter initialEntries=\{\[path\]\}>\s*<Routes>\s*<Route path="\/payment\/success" element=\{<PaymentSuccess \/>\} \/>\s*<\/Routes>\s*<\/MemoryRouter>/g,
      `(() => {
            const history = createMemoryHistory({ initialEntries: [path] });
            const rootRoute = createRootRoute();
            const route = createRoute({ getParentRoute: () => rootRoute, path: '/payment/success', component: PaymentSuccess });
            const router = createRouter({ routeTree: rootRoute.addChildren([route]), history });
            return <RouterProvider router={router} />;
        })()`
    );
  }
  
  // ProductDetail.test.tsx
  if (file.includes('ProductDetail.test.tsx')) {
    content = content.replace(
      /<MemoryRouter initialEntries=\{\[path\]\}>\s*<Routes>\s*<Route path="\/[^\/]+\/[^\/]+" element=\{<ProductDetail \/>\} \/>\s*<\/Routes>\s*<\/MemoryRouter>/g,
      `(() => {
            const history = createMemoryHistory({ initialEntries: [path] });
            const rootRoute = createRootRoute();
            const route = createRoute({ getParentRoute: () => rootRoute, path: '/$section/$slug', component: ProductDetail });
            const router = createRouter({ routeTree: rootRoute.addChildren([route]), history });
            return <RouterProvider router={router} />;
        })()`
    );
    // Also the fallback replacement
    content = content.replace(
      /<MemoryRouter initialEntries=\{\[path\]\}>\s*<Routes>\s*<Route path="\/[^"]+" element=\{<ProductDetail \/>\} \/>\s*<\/Routes>\s*<\/MemoryRouter>/g,
      `(() => {
            const history = createMemoryHistory({ initialEntries: [path] });
            const rootRoute = createRootRoute();
            const route = createRoute({ getParentRoute: () => rootRoute, path: '/$section/$slug', component: ProductDetail });
            const router = createRouter({ routeTree: rootRoute.addChildren([route]), history });
            return <RouterProvider router={router} />;
        })()`
    );
  }
  
  // SearchResults.test.tsx
  if (file.includes('SearchResults.test.tsx')) {
    content = content.replace(
      /<MemoryRouter initialEntries=\{\[path\]\}>\s*<SearchResults \/>\s*<\/MemoryRouter>/g,
      `(() => {
                const history = createMemoryHistory({ initialEntries: [path] });
                const rootRoute = createRootRoute();
                const route = createRoute({ getParentRoute: () => rootRoute, path: '/buscar', component: SearchResults });
                const router = createRouter({ routeTree: rootRoute.addChildren([route]), history });
                return <RouterProvider router={router} />;
            })()`
    );
  }

  // SecondVerticalProofFixture.test.tsx
  if (file.includes('SecondVerticalProofFixture.test.tsx')) {
    content = content.replace(
      /<MemoryRouter initialEntries=\{\['\/'\]\}>\s*<SecondVerticalProofFixture \/>\s*<\/MemoryRouter>/g,
      `(() => {
            const history = createMemoryHistory({ initialEntries: ['/'] });
            const rootRoute = createRootRoute();
            const route = createRoute({ getParentRoute: () => rootRoute, path: '/', component: SecondVerticalProofFixture });
            const router = createRouter({ routeTree: rootRoute.addChildren([route]), history });
            return <RouterProvider router={router} />;
        })()`
    );
  }
  
  // Wishlist.test.tsx
  if (file.includes('Wishlist.test.tsx')) {
    content = content.replace(
      /<MemoryRouter initialEntries=\{\['\/wishlist'\]\}>\s*<Wishlist \/>\s*<\/MemoryRouter>/g,
      `(() => {
                const history = createMemoryHistory({ initialEntries: ['/wishlist'] });
                const rootRoute = createRootRoute();
                const route = createRoute({ getParentRoute: () => rootRoute, path: '/wishlist', component: Wishlist });
                const router = createRouter({ routeTree: rootRoute.addChildren([route]), history });
                return <RouterProvider router={router} />;
            })()`
    );
  }

  fs.writeFileSync(file, content);
  console.log('Updated ' + path.basename(file));
}
