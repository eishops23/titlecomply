# TitleComply — Deploy Checklist

## Pre-Deploy
- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes (15+ tests)
- [ ] `npm run build` succeeds locally
- [ ] All environment variables documented in `.env.example`
- [ ] Git is clean: `git status` shows no uncommitted changes

## Netlify Setup
- [ ] Connect GitHub repo (eishops23/titlecomply) to Netlify
- [ ] Set build command: `npx prisma generate && npm run build`
- [ ] Set publish directory: `.next`
- [ ] Install @netlify/plugin-nextjs
- [ ] Set all environment variables in Netlify UI:
  - DATABASE_URL
  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  - CLERK_SECRET_KEY
  - CLERK_WEBHOOK_SECRET
  - STRIPE_SECRET_KEY
  - STRIPE_PUBLISHABLE_KEY
  - STRIPE_WEBHOOK_SECRET
  - STRIPE_PRICE_STARTER
  - STRIPE_PRICE_PROFESSIONAL
  - STRIPE_PRICE_ENTERPRISE
  - STRIPE_PRICE_PER_FILE
  - ANTHROPIC_API_KEY
  - SENDGRID_API_KEY
  - ENCRYPTION_MASTER_KEY
  - EMAIL_FROM
  - EMAIL_FROM_NAME
  - NEXT_PUBLIC_SITE_URL=https://titlecomply.com

## DNS (Namecheap → Netlify)
- [ ] Add A record: @ → Netlify load balancer IP
- [ ] Add CNAME record: www → [your-site].netlify.app
- [ ] Enable HTTPS in Netlify (Let's Encrypt auto-provision)
- [ ] Verify https://titlecomply.com loads

## Post-Deploy Verification
- [ ] `/api/health` returns `{ status: "healthy" }`
- [ ] Landing page loads at `/`
- [ ] `/pricing` page loads with 4 plan cards
- [ ] `/blog` loads with 3 posts
- [ ] `/sign-up` redirects to Clerk
- [ ] `/sign-in` redirects to Clerk
- [ ] Dashboard loads after auth
- [ ] Create transaction → screening works
- [ ] Document upload works
- [ ] AI extraction works (requires ANTHROPIC_API_KEY)
- [ ] Filing PDF generates correctly
- [ ] Stripe checkout redirects correctly
- [ ] `/sitemap.xml` returns valid XML
- [ ] `/robots.txt` returns valid robots file
- [ ] OG tags appear (test with https://www.opengraph.xyz/)

## Stripe Webhook
- [ ] Add webhook endpoint in Stripe Dashboard: https://titlecomply.com/api/webhooks/stripe
- [ ] Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed
- [ ] Copy signing secret to STRIPE_WEBHOOK_SECRET env var
- [ ] Test with Stripe CLI: `stripe trigger checkout.session.completed`

## Clerk Webhook
- [ ] Add webhook endpoint in Clerk Dashboard: https://titlecomply.com/api/webhooks/clerk
- [ ] Events: user.created, organization.created, organizationMembership.created
- [ ] Copy signing secret to CLERK_WEBHOOK_SECRET env var
