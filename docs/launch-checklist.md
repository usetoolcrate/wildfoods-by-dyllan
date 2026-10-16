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
- [x] www and the one-L domain (wildfoodsbydylan.com) redirect to the main domain
- [x] Domains added to the Vercel project

## The switch (GoDaddy → DNS for wildfoodsbydyllan.com)
- [ ] A @ 157.230.94.88 → replace with A @ 216.198.79.1 and A @ 64.29.17.1
- [ ] A www 157.230.94.88 → replace with CNAME www → a5a00162951abc63.vercel-dns-017.com
- [ ] Leave alone: MX, TXT (SPF, MS=), autodiscover / lyncdiscover / sip /
      enterpriseenrollment / enterpriseregistration CNAMEs, SRV records, NS, SOA
- [ ] Old-host leftovers (_acme-challenge*, _cf-custom-hostname*) can go after launch

## wildfoodsbydylan.com (one L)
- [ ] A @ (parked) → A @ 216.198.79.1 and A @ 64.29.17.1
- [ ] CNAME www → a5a00162951abc63.vercel-dns-017.com
- [ ] Keep its Microsoft records as they are

## After the switch
- [ ] `vercel domains verify` passes for all four names; HTTPS certificates issued
- [ ] https://wildfoodsbydyllan.com, www and the one-L domain all land on the new site
- [ ] Every page returns 200, old WordPress URLs redirect, share previews show the new domain
- [ ] MX / SPF / autodiscover unchanged (email still flows)
- [ ] Inquiry form, recipes, dinner list, admin login work on the real domain
- [ ] Tell Dyllan: new admin address, and to verify the email GoDaddy sent
- [ ] Tell Kyle the site has moved; keep his server up ~2 weeks, then he can shut it down

## Still open after launch
- Stripe live keys (Dyllan's account), which reopens online gift certificates and tickets
- Google reviews: add https://wildfoodsbydyllan.com/api/admin/content as an OAuth redirect URI
- Vercel Pro for the team (Hobby is non-commercial)
- Registrant contact info at GoDaddy (Dyllan's email, phone, Seymour address, "Dyllan" spelling)
- Auto-renew / renewal for both domains (expire 2026-11-14)
