/* Meridian — builds one static page per language from data/i18n/*.json. No dependencies. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const site = JSON.parse(readFileSync('data/site.json','utf8'));
const tpl  = readFileSync('src/page.template.html','utf8');
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const telRaw = site.phone.replace(/[^\d+]/g,'');

/* every language file must carry exactly the keys en.json does */
const flat = (o,p='') => typeof o!=='object'||o===null ? [p]
  : Array.isArray(o) ? o.flatMap((v,i)=>flat(v,`${p}[${i}]`))
  : Object.entries(o).flatMap(([k,v])=>flat(v,`${p}.${k}`));
const en = JSON.parse(readFileSync('data/i18n/en.json','utf8'));
const refKeys = new Set(flat(en));

let built = 0;
for (const lang of site.languages) {
  const t = JSON.parse(readFileSync(`data/i18n/${lang.code}.json`,'utf8'));
  const keys = new Set(flat(t));
  const missing = [...refKeys].filter(k=>!keys.has(k));
  const extra   = [...keys].filter(k=>!refKeys.has(k));
  if (missing.length || extra.length) {
    console.error(`  ! ${lang.code}: missing ${missing.length}, extra ${extra.length}`);
    if (missing.length) console.error('    missing:', missing.slice(0,5).join(', '));
    process.exitCode = 1;
    continue;
  }

  const alt = site.languages.map(l =>
    `<link rel="alternate" hreflang="${l.code}" href="${l.file}">`).join('\n') +
    `\n<link rel="alternate" hreflang="x-default" href="index.html">`;

  const langOpts = site.languages.map(l =>
    `<option value="${l.file}"${l.code===lang.code?' selected':''}>${l.label}</option>`).join('');

  const fontExtra = lang.code==='ar'
    ? '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;600&display=swap" rel="stylesheet">'
    : lang.code==='zh'
    ? '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;600&display=swap" rel="stylesheet">'
    : '';

  const TRUST = t.trust.items.map(i=>`
        <div class="tcell rv"><h3>${esc(i.h)}</h3><p>${esc(i.p)}</p></div>`).join('');
  const SVCS = t.services.items.map(i=>`
        <article class="svc rv"><h3>${esc(i.h)}</h3><p>${esc(i.p)}</p></article>`).join('');
  const STEPS = t.how.steps.map(s=>`
        <div class="step rv"><p class="n">${esc(s.n)}</p><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div>`).join('');
  const TYPES = t.intake.types.map(x=>`<option>${esc(x)}</option>`).join('');
  const URG   = t.intake.urgencies.map(x=>`<option>${esc(x)}</option>`).join('');
  const LANGOPTS_FORM = site.languages.map(l=>`<option>${l.label}</option>`).join('');

  const d = site.demo||{};
  const DEMOBAR = d.show?`<div class="demo-bar" role="note"><p>${esc(d.text)}</p><span class="sep">&middot;</span>
    <a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">${esc(d.linkText)}</a></div>`:'';
  const DEMOFOOT = d.show?`<div class="demo-foot">${esc(d.text)}
    <a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">${esc(d.linkText)}</a></div>`:'';
  const TRANSNOTE = lang.code==='en' ? '' : `<div class="trans-note">${esc(t.transNote)}</div>`;

  const JSONLD = JSON.stringify({'@context':'https://schema.org','@type':'LegalService',
    name: site.firm, description: t.meta.desc, telephone: site.phone, email: site.email,
    areaServed: site.city, availableLanguage: site.languages.map(l=>l.label),
    address:{'@type':'PostalAddress',streetAddress:site.office.line1,addressLocality:site.city}});

  const vars = {
    LANG: lang.code, DIR: lang.dir, FONT_EXTRA: fontExtra, ALT: alt, LANGOPTS: langOpts,
    LANGOPTS_FORM, FIRM: esc(site.firm), SHORT: esc(site.short), CITY: esc(site.city),
    PHONE: esc(site.phone), PHONE_RAW: telRaw, EMAIL: esc(site.email),
    OFF1: esc(site.office.line1), OFF2: esc(site.office.line2), BARNOTE: esc(site.barNote),
    TITLE: esc(t.meta.title), DESC: esc(t.meta.desc), SKIP: esc(t.skip),
    N_SERVICES: esc(t.nav.services), N_HOW: esc(t.nav.how), N_ABOUT: esc(t.nav.about),
    N_INTAKE: esc(t.nav.intake), N_CONTACT: esc(t.nav.contact), N_LANGLABEL: esc(t.nav.langLabel),
    H_EYEBROW: esc(t.hero.eyebrow), H_H1: esc(t.hero.h1), H_LEDE: esc(t.hero.lede),
    H_CTA1: esc(t.hero.cta1), H_CTA2: esc(t.hero.cta2),
    TRUST_TITLE: esc(t.trust.title), TRUST,
    S_EYEBROW: esc(t.services.eyebrow), S_TITLE: esc(t.services.title), S_LEDE: esc(t.services.lede), SVCS,
    HOW_EYEBROW: esc(t.how.eyebrow), HOW_TITLE: esc(t.how.title), STEPS,
    I_EYEBROW: esc(t.intake.eyebrow), I_TITLE: esc(t.intake.title), I_LEDE: esc(t.intake.lede),
    I_NAME: esc(t.intake.name), I_EMAIL: esc(t.intake.email), I_PHONE: esc(t.intake.phone),
    I_LANG: esc(t.intake.lang), I_TYPE: esc(t.intake.type), TYPES, I_COUNTRY: esc(t.intake.country),
    I_URGENCY: esc(t.intake.urgency), URG, I_MESSAGE: esc(t.intake.message),
    I_SUBMIT: esc(t.intake.submit), I_NOTE: esc(t.intake.note),
    I_OK: esc(t.intake.ok), I_ERRNAME: esc(t.intake.errName), I_ERREMAIL: esc(t.intake.errEmail),
    A_EYEBROW: esc(t.about.eyebrow), A_TITLE: esc(t.about.title), A_P1: esc(t.about.p1), A_P2: esc(t.about.p2),
    C_EYEBROW: esc(t.contact.eyebrow), C_TITLE: esc(t.contact.title), C_OFFICE: esc(t.contact.office),
    C_REACH: esc(t.contact.reach), C_HOURS: esc(t.contact.hours), C_HOURSVAL: esc(t.contact.hoursVal),
    DISCLAIMER: esc(t.disclaimer), TRANSNOTE, DEMOBAR, DEMOFOOT, JSONLD,
    JS_OK: JSON.stringify(t.intake.ok),
    JS_ERRNAME: JSON.stringify(t.intake.errName),
    JS_ERREMAIL: JSON.stringify(t.intake.errEmail)
  };
  const out = tpl.replace(/\{\{(\w+)\}\}/g,(m,k)=> k in vars ? vars[k] : (console.warn(`  ! ${lang.code}: unknown token`,k),m));
  writeFileSync(lang.file, out);
  built++;
}
console.log(`  built ${built} pages: ${site.languages.map(l=>l.file).join(', ')}`);
console.log(`  ${refKeys.size} strings per language, ${site.languages.length} languages, 1 right-to-left`);
