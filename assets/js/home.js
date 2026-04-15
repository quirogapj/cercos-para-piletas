// assets/js/home.js

function waLink(phoneE164, msg) {
  const phone = (phoneE164 || "").replace(/[^\d]/g, "");
  const url = new URL(`https://wa.me/${phone}`);
  const text = msg || "";
  // UTM simple para medir origen en GA4 (si después trackeás clicks)
  url.searchParams.set("text", `${text}\n\n(Origen: Home)`);
  return url.toString();
}

function safeText(v, fallback = "") {
  return (v === null || v === undefined) ? fallback : String(v);
}

fetch("/content/home.json", { cache: "no-store" })
  .then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status} loading /content/home.json`);
    return r.json();
  })
  .then((d) => {
    // SEO
    if (d.seo?.title) document.getElementById("seoTitle").textContent = safeText(d.seo.title);
    if (d.seo?.description) document.getElementById("seoDesc").setAttribute("content", safeText(d.seo.description));

    // Brand
    document.getElementById("brandName").textContent = safeText(d.brand?.name, "Cercos para piletas");
    document.getElementById("brandTagline").textContent = safeText(d.brand?.tagline, "");

    // Hero
    document.getElementById("heroTitle").textContent = safeText(d.hero?.title, "Cercos para piletas");
    document.getElementById("heroSubtitle").textContent = safeText(d.hero?.subtitle, "");

    const wa = waLink(d.hero?.whatsappPhoneE164, d.hero?.whatsappDefaultMsg);

    const cta = document.getElementById("ctaPrimary");
    cta.textContent = safeText(d.hero?.primaryCtaText, "Pedir presupuesto por WhatsApp");
    cta.href = wa;
    // Tracking simple (para GTM/GA4 más adelante)
    cta.addEventListener("click", () => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "whatsapp_click",
        source: "home_hero",
        href: cta.href
      });
    });

    // Link de contacto WhatsApp
    const w = document.getElementById("whatsLink");
    w.href = wa;
    w.textContent = "Abrir chat";
    w.addEventListener("click", () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "whatsapp_click",
      source: "home_contact",
      href: w.href
      });
    });

    // Badges
    const badgesArr = Array.isArray(d.badges) ? d.badges : [];
    const badges = badgesArr.map((x) => `<li>${safeText(x)}</li>`).join("");
    document.getElementById("badges").innerHTML = badges;

    // KPIs
    if (Array.isArray(d.kpis) && d.kpis[0]) {
      document.getElementById("kpi1n").textContent = safeText(d.kpis[0].n, "");
      document.getElementById("kpi1t").textContent = safeText(d.kpis[0].t, "");
    }
    if (Array.isArray(d.kpis) && d.kpis[1]) {
      document.getElementById("kpi2n").textContent = safeText(d.kpis[1].n, "");
      document.getElementById("kpi2t").textContent = safeText(d.kpis[1].t, "");
    }

    // Cards de modelos (con fallback para que nunca quede vacío)
    const cardsArr = Array.isArray(d.modelCards) ? d.modelCards : [];
    const cards = cardsArr.length
      ? cardsArr
          .map(
            (c, index) => `
          <article class="card">
            <div class="miniLabel">Opción ${index + 1}</div>
            <h3>${safeText(c.title)}</h3>
            <p>${safeText(c.desc)}</p>
          </article>
        `
          )
          .join("")
      : `
        <article class="card"><div class="miniLabel">Opción 1</div><h3>Vidrio templado</h3><p>Minimalista y elegante. Ideal para mantener vista.</p></article>
        <article class="card"><div class="miniLabel">Opción 2</div><h3>Acero inoxidable</h3><p>Durabilidad premium y herrajes resistentes.</p></article>
        <article class="card"><div class="miniLabel">Opción 3</div><h3>Mixto</h3><p>Balance entre estética, costo y resistencia.</p></article>
      `;

    document.getElementById("modelCards").innerHTML = cards;

    // Steps (con fallback)
    const stepsArr = Array.isArray(d.steps) ? d.steps : [];
    const steps = stepsArr.length
      ? stepsArr.map((s) => `<li>${safeText(s)}</li>`).join("")
      : `
        <li>Nos escribís por WhatsApp con zona, medidas y fotos.</li>
        <li>Te pasamos propuesta y opciones.</li>
        <li>Coordinamos visita (si hace falta) y fecha.</li>
        <li>Fabricación e instalación prolija.</li>
      `;

    document.getElementById("steps").innerHTML = steps;

    // Contacto
    document.getElementById("zone").textContent = safeText(d.contact?.zone, "");
    document.getElementById("hours").textContent = safeText(d.contact?.hours, "");
    document.getElementById("footerText").textContent = safeText(d.contact?.footerText, "© Cercos para piletas");
  })
  .catch((err) => {
    console.error("No se pudo cargar home.json", err);

    // Fallback para que la home no quede pelada si falla el JSON
    const cta = document.getElementById("ctaPrimary");
    if (cta) {
      cta.href = "#contacto";
      cta.textContent = "Contactanos";
    }

    const w = document.getElementById("whatsLink");
    if (w) {
      w.href = "#contacto";
      w.textContent = "Contactanos";
    }

    const modelCards = document.getElementById("modelCards");
    if (modelCards) {
      modelCards.innerHTML = `
        <article class="card"><div class="miniLabel">Opción 1</div><h3>Vidrio templado</h3><p>Minimalista y elegante. Ideal para mantener vista.</p></article>
        <article class="card"><div class="miniLabel">Opción 2</div><h3>Acero inoxidable</h3><p>Durabilidad premium y herrajes resistentes.</p></article>
        <article class="card"><div class="miniLabel">Opción 3</div><h3>Mixto</h3><p>Balance entre estética, costo y resistencia.</p></article>
      `;
    }

    const steps = document.getElementById("steps");
    if (steps) {
      steps.innerHTML = `
        <li>Escribinos con zona, medidas y fotos.</li>
        <li>Te cotizamos y definimos modelo.</li>
        <li>Coordinamos fabricación e instalación.</li>
      `;
    }
  });
