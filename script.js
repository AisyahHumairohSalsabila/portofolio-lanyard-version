/* ====== DATA KONTAK (EDIT DI SINI) ====== */
const CONTACT = {
  email: "aisyahhumairohsalsabila07@gmail.com",
  wa: "6285281351949",                              // GANTI nomor WA (format 62...)
  linkedin: "https://linkedin.com/aisyahhumairohsalsabila", // ganti jika URL aslinya linkedin.com/in/...
  github: "https://github.com/AisyahHumairohSalsabila"
};

/* ====== LINK DOKUMEN & SERTIFIKAT (EDIT DI SINI) ====== */
const DOCS = {
  pi:        "https://share.google/Dl8uiAD1Ebphy2BrN",
  skripsi:   "https://library.gunadarma.ac.id/epaper/d3JTNHRXVjVoRVBQaWhBVVJSS3hGNzNSekdYbFhCY0oxTHEyNUFGNU1RbWJCTSs3TC9vbG5yNXcvcHZxam1oZw==",
  linux:     "https://drive.google.com/file/d/10dccFYe5VcbELoYs3g3hpBN8PROow8rn/view?usp=sharing", // CEK: sama dengan SQL
  sql:       "https://drive.google.com/file/d/10dccFYe5VcbELoYs3g3hpBN8PROow8rn/view?usp=sharing", // CEK: sama dengan Linux
  dicoding:  "https://drive.google.com/file/d/1SFRdHMyZ63wv_EwJPAPyovGREMnpYhf7/view?usp=sharing",
  sertifPI:  "https://drive.google.com/file/d/12vOQqEpaakLMTS64-V6qS2rVVk-wCVbv/view?usp=sharing",
  cvids:     "https://drive.google.com/file/d/1-1ADsfW5-mRCwbz-MxTXlQgdD1wpXsIv/view?usp=sharing",
  sa:        "https://drive.google.com/file/d/1U1hhHEp971k5aaYg4FBAzc1c-egOS45P/view?usp=sharing",
  msib:      "https://drive.google.com/file/d/1_P3Ho4H8qCNCEe_SkdH9Z2OOYeKBwUCx/view?usp=sharing",
  infografis:"https://drive.google.com/file/d/1Md9fC-y7n4_bx1h98qLTH8fnCPm08tmB/view?usp=sharing",
  cyberlabs: "https://drive.google.com/file/d/1-2oPPZQ619IFwlgmY1ViH3eukrbOKvmW/view?usp=sharing",
  jwp:       "https://drive.google.com/file/d/1_SGpst2bsalC6JRrTMQuO39dG5q_a9tK/view?usp=sharing",
  aqua:      "https://drive.google.com/file/d/1s21vYPwhtP0GtqvLkgkWjZ4eEFQ9U3Hn/view?usp=sharing"
};

/* ====== NAVBAR & FOOTER ====== */
const pages = [
  ["index.html", "Home"], ["about.html", "Tentang"], ["experience.html", "Pengalaman"],
  ["achievements.html", "Prestasi"], ["contact.html", "Kontak"]
];
const current = document.body.dataset.page;
document.body.insertAdjacentHTML("afterbegin", `
<nav><div class="container nav-in">
  <a href="index.html" class="logo grad">Aisyah.</a>
  <ul class="menu" id="menu">
    ${pages.map(p => `<li><a href="${p[0]}" class="${p[0] === current ? "active" : ""}">${p[1]}</a></li>`).join("")}
    <li><button class="icon-btn" id="theme" aria-label="Ganti tema"><i class="fa-solid fa-moon"></i></button></li>
  </ul>
  <button class="icon-btn" id="burger" aria-label="Menu"><i class="fa-solid fa-bars"></i></button>
</div></nav>`);
document.body.insertAdjacentHTML("beforeend", `
<footer>
  <div class="socials">
    <a data-link="email" class="mail" aria-label="Email"><i class="fa-solid fa-envelope"></i></a>
    <a data-link="wa" class="wa" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
    <a data-link="linkedin" class="li" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
    <a data-link="github" class="gh" aria-label="GitHub"><i class="fa-brands fa-github"></i></a>
  </div>
  © ${new Date().getFullYear()} · Dibangun dengan HTML, CSS & JavaScript
</footer>`);

/* ====== THEME ====== */
const root = document.documentElement, btn = document.getElementById("theme");
const saved = localStorage.getItem("theme") ||
  (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
setTheme(saved);
function setTheme(t) {
  root.dataset.theme = t;
  btn.innerHTML = t === "dark" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  localStorage.setItem("theme", t);
}
btn.onclick = () => setTheme(root.dataset.theme === "dark" ? "light" : "dark");
document.getElementById("burger").onclick = () => document.getElementById("menu").classList.toggle("open");

/* ====== TRANSISI ANTAR HALAMAN ====== */
document.querySelectorAll("a[href$='.html']").forEach(a => {
  a.addEventListener("click", e => {
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(() => (location.href = a.href), 280);
  });
});
window.addEventListener("pageshow", () => document.body.classList.remove("leaving"));

/* ====== SCROLL REVEAL ====== */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); }
}), { threshold: .15 });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 90 + "ms"; io.observe(el);
});

/* ====== TYPING EFFECT ====== */
const typing = document.querySelector(".typing");
if (typing) {
  const words = ["Quality Assurance", "Business Analyst", "System Analyst", "SQL & Database Enthusiast", "Web Developer"];
  let w = 0, c = 0, del = false;
  (function tick() {
    const word = words[w];
    typing.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(tick, 1400); }
    if (del && c === 0) { del = false; w = (w + 1) % words.length; }
    c += del ? -1 : 1;
    setTimeout(tick, del ? 40 : 85);
  })();
}

/* ====== COUNTER ANGKA ====== */
document.querySelectorAll("[data-count]").forEach(el => {
  const target = parseFloat(el.dataset.count), dec = el.dataset.dec ? 2 : 0;
  let n = 0;
  const step = () => {
    n += target / 50;
    if (n >= target) { el.textContent = target.toFixed(dec); return; }
    el.textContent = n.toFixed(dec);
    requestAnimationFrame(step);
  };
  new IntersectionObserver((es, o) => es.forEach(e => {
    if (e.isIntersecting) { step(); o.disconnect(); }
  })).observe(el);
});

/* ====== LINK KONTAK ====== */
const waLink = `https://wa.me/${CONTACT.wa}?text=${encodeURIComponent("Halo, saya ingin berdiskusi tentang peluang kerja sama.")}`;
const map = { email: `mailto:${CONTACT.email}`, wa: waLink, linkedin: CONTACT.linkedin, github: CONTACT.github };
document.querySelectorAll("[data-link]").forEach(a => {
  a.href = map[a.dataset.link];
  if (a.dataset.link !== "email") { a.target = "_blank"; a.rel = "noopener"; }
});

/* ====== LINK DOKUMEN ====== */
document.querySelectorAll("[data-doc]").forEach(a => {
  a.href = DOCS[a.dataset.doc] || "#";
  a.target = "_blank"; a.rel = "noopener";
});

/* ====== FORM EMAIL ====== */
const form = document.getElementById("mailForm");
if (form) form.onsubmit = e => {
  e.preventDefault();
  const f = new FormData(form);
  location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(f.get("subject"))}&body=${encodeURIComponent(f.get("message") + "\n\n— " + f.get("name"))}`;
};