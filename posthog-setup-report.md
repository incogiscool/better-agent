<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into BetterAgent. The integration covers client-side initialization via `instrumentation-client.ts` (Next.js 15.3+ pattern), a reverse proxy in `next.config.ts` to route events through `/ingest`, a server-side PostHog client at `lib/posthog-server.ts`, and event captures across 10 files spanning the full user lifecycle — from landing page CTAs through signup, project creation, onboarding, settings changes, and churn signals. Users are identified on sign-in and sign-up so that client and server events are correlated under a single distinct ID.

| Event | Description | File |
|---|---|---|
| `sign_up_completed` | User successfully created an account via email/password | `components/public/auth/SignupForm.tsx` |
| `sign_in_completed` | User successfully signed in via email/password | `components/public/auth/SigninForm.tsx` |
| `oauth_sign_in_started` | User clicked a GitHub or Google OAuth sign-in button | `components/public/auth/OAuthButtons.tsx` |
| `sign_out` | User signed out of their account | `components/dashboard/settings/AccountTab.tsx` |
| `pricing_page_viewed` | User viewed the pricing page (top of conversion funnel) | `app/(public)/pricing/page.tsx` |
| `pricing_plan_cta_clicked` | User clicked a CTA button on a pricing plan card | `components/landing/PricingCards.tsx` |
| `landing_cta_clicked` | User clicked the primary get-started CTA in the landing CTA section | `components/landing/CtaSection.tsx` |
| `project_created` | User successfully created a new project via the onboarding wizard | `components/projects/onboarding/OnboardingWizard.tsx` |
| `onboarding_step_advanced` | User advanced to the next step in the new-project onboarding wizard | `components/projects/onboarding/OnboardingWizard.tsx` |
| `project_settings_saved` | User saved project settings (name, base URL, system prompt, or allowed origins) | `app/(dashboard)/dashboard/projects/[id]/settings/ProjectSettingsForm.tsx` |
| `project_keys_regenerated` | User regenerated the project API keys | `app/(dashboard)/dashboard/projects/[id]/settings/ProjectSettingsForm.tsx` |
| `project_deleted` | User permanently deleted a project | `app/(dashboard)/dashboard/projects/[id]/settings/ProjectDangerZone.tsx` |
| `chat_conversation_started` | Server-side: a new chat conversation was created for a project | `app/api/v1/chat/route.ts` |
| `chat_credit_limit_reached` | Server-side: a chat request was rejected because the project has no remaining credits | `app/api/v1/chat/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/466385/dashboard/1705718)
- [New signups per day](https://us.posthog.com/project/466385/insights/u7Dwiv0U)
- [Signup conversion funnel](https://us.posthog.com/project/466385/insights/NcOmsOG3)
- [Projects created per week](https://us.posthog.com/project/466385/insights/vJHwfpDw)
- [Onboarding wizard completion funnel](https://us.posthog.com/project/466385/insights/gs7Grudt)
- [Churn signals over time](https://us.posthog.com/project/466385/insights/Z8TYZkmT)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
