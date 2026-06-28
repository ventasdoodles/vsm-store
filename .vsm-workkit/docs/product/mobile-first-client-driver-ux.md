# VSM Store - Mobile First Client and Driver UX Canon

## Decision

Client and Driver are mobile-first surfaces. The experience must feel like a compact native mobile product, not a desktop dashboard compressed into a phone.

## UX Rules

- Surfaces must be intuitive and low-friction.
- Users must immediately understand what is happening, what they can do next, what needs attention, and what is only historical or detail information.
- Cards must be compact by default.
- Extra detail must be progressive and only expand when it is useful.
- History views must stay compact, scannable, grouped, and mobile-friendly.

## Driver Canon

Driver UX must make these states and actions easy to understand at a glance:

- available orders;
- active orders;
- next action;
- wallet balance;
- wallet movements and history;
- completed trips;
- cancelled trips;
- counteroffers;
- cancellation attribution when data exists.

Driver history must be:

- scoped to the logged-in driver;
- compact by default;
- grouped by status or date where useful;
- expandable for detail;
- clear about completed and cancelled trips;
- honest when cancellation attribution is unknown.

## Customer Canon

Customer UX must make these states and actions easy to understand at a glance:

- current order state;
- pending counteroffers;
- accepted and rejected offers;
- order history;
- the next required action;
- whether profile completion blocks progress.

Customer history must be:

- compact by default;
- grouped by status or date where useful;
- expandable for detail;
- not visually overwhelming.

## Profile Gate

The customer/order flow remains blocked until required profile data is complete:

- full name;
- primary phone;
- secondary phone, required;
- full address.

## Role Model

Driver-as-customer remains the product direction:

- every driver can also act as customer;
- not every customer can act as driver;
- admin remains separate and protected;
- capability-based access or equivalent logic is the intended direction.

## Non-Goals

Do not fake GPS, fake ETA, fake rider proximity, fake notifications, real payment readiness, or cancellation attribution that is not supported by data.

