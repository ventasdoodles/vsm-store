import { describe, it, expect } from 'vitest';
import {
    calculateDiscount,
    calculateOrderTotal,
    calculateSavingsPercentage,
    type CouponData,
} from '../pricing';

describe('calculateDiscount', () => {
    it('returns 0 with no coupon', () => {
        expect(calculateDiscount(500, null)).toBe(0);
    });

    it('returns 0 when subtotal is below min_purchase', () => {
        const coupon: CouponData = { discount_type: 'percentage', discount_value: 10, min_purchase: 1000 };
        expect(calculateDiscount(500, coupon)).toBe(0);
    });

    it('calculates percentage discount correctly', () => {
        const coupon: CouponData = { discount_type: 'percentage', discount_value: 10, min_purchase: 0 };
        expect(calculateDiscount(500, coupon)).toBe(50);
    });

    it('calculates fixed discount correctly', () => {
        const coupon: CouponData = { discount_type: 'fixed', discount_value: 200, min_purchase: 0 };
        expect(calculateDiscount(500, coupon)).toBe(200);
    });

    it('caps discount to subtotal (percentage)', () => {
        const coupon: CouponData = { discount_type: 'percentage', discount_value: 150, min_purchase: 0 };
        expect(calculateDiscount(100, coupon)).toBe(100); // Can't discount more than subtotal
    });

    it('caps discount to subtotal (fixed)', () => {
        const coupon: CouponData = { discount_type: 'fixed', discount_value: 1000, min_purchase: 0 };
        expect(calculateDiscount(500, coupon)).toBe(500);
    });

    it('handles 100% discount', () => {
        const coupon: CouponData = { discount_type: 'percentage', discount_value: 100, min_purchase: 0 };
        expect(calculateDiscount(500, coupon)).toBe(500);
    });

    it('works at exact min_purchase threshold', () => {
        const coupon: CouponData = { discount_type: 'fixed', discount_value: 50, min_purchase: 500 };
        expect(calculateDiscount(500, coupon)).toBe(50);
    });
});

describe('calculateOrderTotal', () => {
    it('returns subtotal with no discount or shipping', () => {
        expect(calculateOrderTotal(500)).toBe(500);
    });

    it('subtracts discount', () => {
        expect(calculateOrderTotal(500, 100)).toBe(400);
    });

    it('adds shipping cost', () => {
        expect(calculateOrderTotal(500, 0, 50)).toBe(550);
    });

    it('handles all three parameters', () => {
        expect(calculateOrderTotal(1000, 200, 100)).toBe(900);
    });

    it('never returns negative', () => {
        expect(calculateOrderTotal(100, 500, 0)).toBe(0);
    });
});

describe('calculateSavingsPercentage', () => {
    it('returns null when no compare price', () => {
        expect(calculateSavingsPercentage(100, null)).toBeNull();
    });

    it('returns null when compare price is lower than price', () => {
        expect(calculateSavingsPercentage(100, 80)).toBeNull();
    });

    it('returns null when compare price equals price', () => {
        expect(calculateSavingsPercentage(100, 100)).toBeNull();
    });

    it('calculates correct percentage', () => {
        expect(calculateSavingsPercentage(75, 100)).toBe(25);
    });

    it('rounds to nearest integer', () => {
        expect(calculateSavingsPercentage(70, 100)).toBe(30);
        expect(calculateSavingsPercentage(33, 100)).toBe(67);
    });

    it('handles 50% off correctly', () => {
        expect(calculateSavingsPercentage(250, 500)).toBe(50);
    });
});
