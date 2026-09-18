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

      <div class="margin-notes" style="margin-top:54px; grid-template-columns:1fr;">
        <div class="margin-note" style="padding-left:0;">
          <p style="font-style:normal; font-size:17px;">Chef Dyllan Dale — Wild Foods by Dyllan<br>Springfield, Missouri — serving the Ozarks</p>
        </div>
      </div>
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
