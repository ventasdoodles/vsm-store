const fs = require('fs');

// Fix main.tsx
let main = fs.readFileSync('src/main.tsx', 'utf8');

main = main.replace(
    /<RouterProvider router=\{router\}>[\s\S]*?<\/RouterProvider>/g,
    '<RouterProvider router={router} />'
);

// Remove unused imports in main.tsx
main = main.replace(/import \{ ThemeProvider \} from '@\/contexts\/ThemeContext';\r?\n/, '');
main = main.replace(/import \{ AuthProvider \} from '@\/contexts\/AuthContext';\r?\n/, '');
main = main.replace(/import \{ SafetyProvider \} from '@\/contexts\/SafetyContext';\r?\n/, '');
main = main.replace(/import \{ QueryClientProvider \} from '@tanstack\/react-query';\r?\n/, '');
main = main.replace(/import \{ HelmetProvider \} from 'react-helmet-async';\r?\n/, '');
main = main.replace(/import \{ queryClient \} from '@\/lib\/react-query';\r?\n/, '');
main = main.replace(/import \{ App \} from '.\/App';\r?\n/, '');

fs.writeFileSync('src/main.tsx', main);

// Fix router.tsx
let routerFile = fs.readFileSync('src/router.tsx', 'utf8');

const imports = `import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SafetyProvider } from '@/contexts/SafetyContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { queryClient } from '@/lib/react-query';
`;

routerFile = imports + "\n" + routerFile;

const rootRouteReplacement = `export const rootRoute = createRootRoute({
    component: () => (
        <ThemeProvider>
            <AuthProvider>
                <QueryClientProvider client={queryClient}>
                    <HelmetProvider>
                        <SafetyProvider>
                            <Outlet />
                        </SafetyProvider>
                    </HelmetProvider>
                </QueryClientProvider>
            </AuthProvider>
        </ThemeProvider>
    ),
});`;

routerFile = routerFile.replace(
    /export const rootRoute = createRootRoute\(\{[\s\S]*?\}\);/,
    rootRouteReplacement
);

fs.writeFileSync('src/router.tsx', routerFile);

console.log("Updated main.tsx and router.tsx");
