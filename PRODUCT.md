# Product

## Register

product

## Users

**Students** (primary end-users)
- Algerian university students seeking internships (L1 through PhD).
- Context: anxious about career outcomes, applying to multiple offers, tracking application status.
- Job to be done: discover relevant internships, apply with a complete profile, track progress through interviews to placement.
- Emotional need: feel guided, safe, and in control of their career trajectory.

**Company recruiters and owners**
- HR staff, hiring managers, or company founders posting internship offers.
- Context: time-constrained, evaluating many candidates, coordinating with universities.
- Job to be done: post offers, manage candidate pipeline from application to acceptance, schedule interviews, generate placement documents.
- Emotional need: feel efficient, organized, and professionally credible.

**University administrators and department heads**
- Academic staff validating student placements and supervising the internship program.
- Context: bureaucratic workload, coordinating between students and companies, ensuring compliance.
- Job to be done: validate placement agreements, track student status, approve departmental applications.
- Emotional need: feel authoritative without friction; trust that the system handles process correctly.

**Super admins**
- Platform operators managing user accounts, organizations, and system settings.
- Context: oversight across all roles, moderation, onboarding new universities and companies.
- Job to be done: user and organization management, analytics, system configuration.
- Emotional need: feel in command with clear visibility and power tools.

## Product Purpose

Stag.io is a university-company internship matching platform that closes the gap between students seeking professional experience and organizations seeking young talent. It coordinates a multi-party workflow: students discover and apply, companies review and interview, universities validate and supervise.

Success is measured by:
- Students finding and securing relevant internships with minimal friction.
- Companies filling positions with qualified candidates efficiently.
- Universities maintaining oversight and compliance without drowning in paperwork.

## Brand Personality

**Confident, structured, warm.**

The interface projects professional credibility first, editorial elegance second. Every surface must answer the question: "Does this system know what it's doing?" before it answers "Is this beautiful?"

- **Confident:** Decisive hierarchy, clear affordances, no ambiguity about what is clickable or what happens next.
- **Structured:** Predictable layouts, consistent patterns, logical grouping. Users always know where they are and how to get back.
- **Warm:** Human tone in copy, tactile feedback (motion, hover states), a color palette that feels approachable rather than clinical.

## Anti-references

**Magazine-style decoration in functional surfaces.** The editorial aesthetic (serif headlines, generous whitespace, decorative motion) belongs on the homepage and marketing pages. It does not belong in the dashboard, pipeline, or form flows where users are performing tasks. This was the core critique that triggered this redesign effort.

**Dense academic bureaucracy UI.** Kafkaesque forms, tiny unreadable tables, walls of unstructured text. The system serves academia but must not look like it was built by a 1990s university IT department.

**Generic shadcn/ui defaults.** Untouched default components with no customization signal "we didn't care." Every component must be intentional.

**SaaS card-grid monotony.** Identical icon-heading-text cards repeated endlessly, hero-metric templates (big number + small label), gradient accents. These are training-data clichés.

**Dark-mode-for-the-sake-of-cool.** Every surface must justify its theme through a concrete physical scene, not category reflex.

## Design Principles

1. **Form follows workflow.** The visual treatment of any surface must map to the user's mental model of the task, not to a pre-chosen aesthetic category. Homepage = invitation. Dashboard = instrument.

2. **Hierarchy through density, not decoration.** Information priority is expressed through spacing, scale, and grouping — not through borders, shadows, or background tints that fight for attention.

3. **Trust through precision.** Users who are anxious about their careers or managing hiring pipelines need to see that every number, status, and interaction is exactly right. Precision breeds confidence.

4. **Warmth without whimsy.** The interface can be human and approachable, but never playful, cute, or distracting. The user is doing serious work.

5. **One system, many registers.** The same design tokens (colors, type, motion) serve both the brand homepage and the product dashboard. The difference is in composition, density, and emphasis — not in a separate visual language.

## Accessibility & Inclusion

- **WCAG 2.1 AA** as the minimum standard across all surfaces.
- **Full RTL support** for Arabic (logical CSS properties, Arabic type scale, right-to-left layout flow).
- **Reduced motion** respected at the system level: all animations collapse to instant state changes when `prefers-reduced-motion` is set.
- **Color is never the sole signal** for status or action; always paired with icon, text label, or pattern.
- **Keyboard navigation** fully supported for all interactive elements; focus rings are visible and follow a logical tab order.
- **Screen reader compatibility** for dynamic content (toasts, modals, infinite scroll) via ARIA live regions and proper focus management.
