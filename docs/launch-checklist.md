# Launch checklist: wildfoodsbydyllan.com

Moving the domain from the old WordPress site (Kyle's server, 157.230.94.88) to this
Vercel project. DNS stays at GoDaddy (Dyllan's account #751508441); only the website
records change. Email is Microsoft 365, billed by Microsoft. Its records are never touched.

## Before the switch
- [x] Domains in Dyllan's GoDaddy account (accepted 2026-10-15)
- [x] Old-site backup saved (WordPress files + database + DNS screenshots)
- [x] Snapshot of every DNS record, checked against what's live
- [x] Old WordPress links redirect to the new pages (vercel.json)
- [x] Share tags and sitemap use https://wildfoodsbydyllan.com
- [x] Test-mode Stripe can't sell on the real domain ("call or text to buy" until live keys)
- [x] /shop links to /gift-certificates, not the old store
- [x] www redirects to the main domain (vercel.json)
- [x] Domains added to the Vercel project

## The switch (GoDaddy → DNS for wildfoodsbydyllan.com)
- [x] A @ 157.230.94.88 → replaced with A @ 216.198.79.1 and A @ 64.29.17.1 (2026-10-16)
- [x] A www 157.230.94.88 → A www 216.198.79.1 (GoDaddy can't change a record's type in place; Vercel accepts the A record)
- [x] Left alone: MX, TXT (SPF, MS=), autodiscover / lyncdiscover / sip /
      enterpriseenrollment / enterpriseregistration CNAMEs, SRV records, NS, SOA
- [ ] Old-host leftovers (_acme-challenge*, _cf-custom-hostname*) can go after launch

## wildfoodsbydylan.com (one L)
- [x] Already forwards (301, HTTPS) to https://wildfoodsbydyllan.com via GoDaddy Forwarding, so no DNS change.
      Its A records belong to the forwarding service; leave them.

## After the switch
- [x] `vercel domains verify` passes for wildfoodsbydyllan.com and www; HTTPS works (2026-10-16)
- [x] https://wildfoodsbydyllan.com, www (308) and the one-L domain (GoDaddy 301) all land on the new site
- [x] Every page returns 200, old WordPress URLs redirect, share previews show the new domain, real domain is indexable
- [x] MX / SPF / autodiscover unchanged (checked on Google and Cloudflare DNS)
- [x] Recipes, dinner list, reviews and admin pages load on the real domain; sales show "call or text to buy"
- [ ] Tell Dyllan: new admin address, and to verify the email GoDaddy sent
- [ ] Tell Kyle the site has moved; keep his server up ~2 weeks, then he can shut it down

## Still open after launch
- Stripe live keys (Dyllan's account), which reopens online gift certificates and tickets
- Google reviews: add https://wildfoodsbydyllan.com/api/admin/content as an OAuth redirect URI
- Vercel Pro for the team (Hobby is non-commercial)
- Registrant contact for wildfoodsbydyllan.com still spencer@bradan.co / KC address (the one-L domain is updated to Dyllan's Gmail and is pending his WHOIS verification)
- Renew wildfoodsbydyllan.com (expires 2026-11-14; the one-L domain is renewed to 2027)
