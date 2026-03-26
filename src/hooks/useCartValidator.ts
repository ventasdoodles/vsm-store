// Hook para validar el carrito contra la API al cargar la app
// Muestra notificaciones para items removidos o ajustados
import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useCartStore, type CartValidationIssue } from '@/stores/cart.store';
import { useNotification } from '@/hooks/useNotification';

export function useCartValidator() {
    const { pathname } = useLocation();
    const isAdmin = pathname.startsWith('/admin');
    const validateCart = useCartStore((s) => s.validateCart);
    const lastResult = useCartStore((s) => s.lastValidationResult);
    const itemCount = useCartStore((s) => s.items.length);
    const [isValidating, setIsValidating] = useState(false);
    const hasValidated = useRef(false);
    const { warning, info } = useNotification();

    const showIssueNotifications = useCallback(
        (issues: CartValidationIssue[]) => {
            for (const issue of issues) {
                if (issue.type === 'variant_removed') {
                    warning('Opcion no disponible', `"${issue.productName}" ya no puede comprarse como estaba y fue removido del carrito.`);
                    continue;
                }

                if (issue.type === 'variant_stock_adjusted') {
                    warning('Cantidad ajustada', `"${issue.productName}": ${issue.oldValue} -> ${issue.newValue} uds segun la opcion vigente.`);
                    continue;
                }

                switch (issue.type) {
                    case 'removed':
                        warning('Producto no disponible', `"${issue.productName}" fue removido del carrito.`);
                        break;
                    case 'out_of_stock':
                        warning('Producto agotado', `"${issue.productName}" se agotó y fue removido.`);
                        break;
                    case 'price_changed':
                        info('Precio actualizado', `"${issue.productName}": $${issue.oldValue?.toFixed(2)} → $${issue.newValue?.toFixed(2)}`);
                        break;
                    case 'stock_adjusted':
                        warning('Cantidad ajustada', `"${issue.productName}": ${issue.oldValue} → ${issue.newValue} uds (stock limitado).`);
                        break;
                }
            }
        },
        [warning, info]
    );

    // Validar al montar la app (una sola vez, solo en storefront)
    useEffect(() => {
        if (isAdmin || hasValidated.current || itemCount === 0) return;
        hasValidated.current = true;

        setIsValidating(true);
        validateCart()
            .then((result) => {
                if (result.hasIssues) {
                    showIssueNotifications(result.issues);
                }
            })
            .finally(() => setIsValidating(false));
    }, [isAdmin, itemCount, validateCart, showIssueNotifications]);

    // Validación explícita (para pre-checkout)
    const runValidation = useCallback(async () => {
        setIsValidating(true);
        try {
            const result = await validateCart();
            if (result.hasIssues) {
                showIssueNotifications(result.issues);
            }
            return result;
        } finally {
            setIsValidating(false);
        }
    }, [validateCart, showIssueNotifications]);

    return { isValidating, lastResult, runValidation };
}
