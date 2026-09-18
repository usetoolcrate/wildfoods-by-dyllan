import { useEffect } from "react";
import { renderTopBar, renderBookCard, renderPageBanner, FOOTER_HTML, SITE_STYLES } from "@/pages/site-shared";

const PAGE_BODY = `${renderTopBar("/contact")}

${renderPageBanner({
  eyebrow: "Contact",
  title: "Get In Touch",
  sub: "Pop-ups, private chef nights, foraging walks, classes, or just a question — start here.",
})}

<main>
  <section>
    <div class="wrap-narrow">
      ${renderBookCard({
        title: "Reach Dyllan Directly",
        sub: "Every booking starts as a real conversation — call, text, or email and tell him what you're picturing.",
      })}

      <p style="margin-top:54px; text-align:center; font-family:'Special Elite', monospace; font-size:13px; color:var(--ink-soft); letter-spacing:0.04em;">Chef Dyllan Dale — Wild Foods by Dyllan<br>Springfield, Missouri — serving the Ozarks</p>
    </div>
  </section>
</main>

${FOOTER_HTML}`;

export function ContactPage() {
  useEffect(() => {
    document.title = "Contact — Wild Foods by Dyllan";
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SITE_STYLES }} />
      <div dangerouslySetInnerHTML={{ __html: PAGE_BODY }} />
    </>
  );
}
