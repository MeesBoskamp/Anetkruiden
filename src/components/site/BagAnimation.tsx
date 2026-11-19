import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";

import { useTr, type Text } from "@/lib/i18n";

import "./bag-animation.css";

/**
 * Productanimatie: een kraftzak met venster die bij binnenkomst een rondje draait.
 * Met de knop "Ingrediënten" wordt de zak doorzichtig en verschijnen de labels.
 * Gebaseerd op Mees' kamille-animatie (artifact "Kamille – productanimatie").
 * Bouwt de 3D-zak met gewone DOM-elementen en CSS 3D; alleen in de browser.
 */
export type BagAnimationKind = "kamille";

/** Standaardteksten als er in het beheer geen eigen labels zijn ingevuld. */
export const DEFAULT_BAG_LABELS: Record<BagAnimationKind, string[]> = {
  kamille: [
    "**Kamille**bloemen (100%)",
    "Hele bloemhoofdjes",
    "Gedroogd",
    "Zonder toevoegingen",
    "Kraftpapieren zak",
    "Venster om de inhoud te zien",
  ],
};

/** **vet** in een label wordt vetgedrukt. */
function rich(s: string): ReactNode {
  return s
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <b key={i}>{part.slice(2, -2)}</b>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    );
}

/* ---------- Texturen (één keer per pagina gemaakt) ---------- */
const svgUrl = (svg: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
const NOISE = svgUrl(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85 .55' numOctaves='3' seed='4'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='.55'/></svg>`,
);
const MOTTLE = svgUrl(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='900' preserveAspectRatio='none'><filter id='m'><feTurbulence type='fractalNoise' baseFrequency='.012 .006' numOctaves='2' seed='9'/><feColorMatrix values='0 0 0 0 .6  0 0 0 0 .4  0 0 0 0 .2  0 0 0 1.4 -.45'/></filter><rect width='100%' height='100%' filter='url(#m)'/></svg>`,
);

function chamomile(size: number, seed: number) {
  let s = seed * 9301 + 49297;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  if (!g) return "";
  g.fillStyle = "#b3ab82";
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < 260; i++) {
    // stengels en blaadjes
    g.strokeStyle = `rgba(${110 + rnd() * 30},${125 + rnd() * 25},${70 + rnd() * 20},.8)`;
    g.lineWidth = 1 + rnd() * 2;
    const x = rnd() * size,
      y = rnd() * size,
      a = rnd() * Math.PI * 2,
      l = 6 + rnd() * 18;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  const n = Math.round((size * size) / 260);
  for (let i = 0; i < n; i++) {
    const x = rnd() * size,
      y = rnd() * size,
      r = 5 + rnd() * 9,
      rot = rnd() * Math.PI * 2;
    const petals = Math.floor(rnd() * 7) + 6,
      dried = rnd();
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    for (let p = 0; p < petals; p++) {
      const a = (p / petals) * Math.PI * 2 + rnd() * 0.4;
      const len = r * (0.8 + rnd() * 0.9) * (dried > 0.4 ? 0.7 : 1);
      g.save();
      g.rotate(a);
      const sh = 225 + rnd() * 25;
      g.fillStyle = `rgba(${sh + 8},${sh + 4},${sh - 22},${0.75 + rnd() * 0.25})`;
      g.beginPath();
      g.ellipse(
        len * 0.75,
        0,
        len * 0.6,
        r * (0.16 + rnd() * 0.12),
        rnd() * 0.6 - 0.3,
        0,
        Math.PI * 2,
      );
      g.fill();
      g.strokeStyle = "rgba(120,110,80,.25)";
      g.lineWidth = 0.5;
      g.stroke();
      g.restore();
    }
    const cr = r * (0.42 + rnd() * 0.18);
    const grd = g.createRadialGradient(-cr * 0.3, -cr * 0.35, cr * 0.1, 0, 0, cr);
    grd.addColorStop(0, "#f6d55a");
    grd.addColorStop(0.6, "#dcaa2a");
    grd.addColorStop(1, "#9a6f12");
    g.fillStyle = grd;
    g.beginPath();
    g.arc(0, 0, cr, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  const v = g.createRadialGradient(size / 2, size / 2, size * 0.2, size / 2, size / 2, size * 0.75);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(30,25,5,.12)");
  g.fillStyle = v;
  g.fillRect(0, 0, size, size);
  return c.toDataURL("image/jpeg", 0.88);
}

const textureCache: Partial<Record<BagAnimationKind, [string, string]>> = {};
function textures(kind: BagAnimationKind): [string, string] {
  return (textureCache[kind] ??= [chamomile(700, 1), chamomile(500, 7)]);
}

/* ---------- Intro: één rondje van 360° ---------- */
const DUR = 2030; // ms
const ELEV = -7; // camera-elevatie in graden
const ease = (p: number) => (1 - Math.cos(Math.PI * p)) / 2;
const paperAt = (a: number) => {
  const d = Math.min(a % 360, 360 - (a % 360));
  return Math.max(0, 1 - d / 55);
};

/** Bouwt de zak in `scene` op basis van de beschikbare ruimte. */
function buildBag(
  root: HTMLElement,
  scene: HTMLElement,
  bag: HTMLElement,
  shadow: HTMLElement,
  btn: HTMLElement,
  tex: [string, string],
) {
  const rw = root.clientWidth,
    rh = root.clientHeight;
  const narrow = rw < 560;
  // Ruimte voor de zak: smal = labels eronder, breed = labels ernaast.
  const k = narrow
    ? Math.max(0.3, Math.min(1, (rh - 130) / 670, rw / 420))
    : Math.max(0.3, Math.min(1, (rh * 0.86) / 670, (rw * 0.5) / 324));
  const W = 190 * k,
    H = 600 * k,
    D = 112 * k,
    Dt = 12 * k,
    F = H * 0.66; // breedte, hoogte, diepte onder/boven, vulhoogte
  const tilt = (Math.atan((D - Dt) / 2 / H) * 180) / Math.PI;
  const depthAt = (h: number) => D - ((D - Dt) * h) / H;

  const sceneH = H + 70 * k;
  scene.style.width = `${W + D * 1.2}px`;
  scene.style.height = `${sceneH}px`;
  bag.style.width = `${W}px`;
  bag.style.height = `${H}px`;
  bag.style.marginLeft = `${-W / 2}px`;
  bag.style.marginTop = `${-H / 2}px`;
  shadow.style.width = `${W * 1.9}px`;
  shadow.style.height = `${D * 0.7}px`;
  shadow.style.top = `${sceneH / 2 + H / 2 - D * 0.35}px`;

  bag.innerHTML = "";
  const face = (cls: string, w: number, h: number, tf: string, inner = "") => {
    const d = document.createElement("div");
    d.className = `ba-face ${cls}`;
    d.style.cssText = `width:${w}px;height:${h}px;left:${(W - w) / 2}px;top:${(H - h) / 2}px;transform:${tf}`;
    d.innerHTML = `<div class="ba-paper">${inner}</div><div class="ba-glass"></div>`;
    bag.appendChild(d);
    return d;
  };
  const fill = (cls: string, w: number, h: number, tf: string, t: string, pos = "center") => {
    const d = document.createElement("div");
    d.className = `ba-fill ${cls}`;
    d.style.cssText = `width:${w}px;height:${h}px;left:${(W - w) / 2}px;top:${(H - h) / 2}px;transform:${tf};background-image:url(${t});background-position:${pos}`;
    bag.appendChild(d);
    return d;
  };

  // Inhoud
  const fi = 3 * k,
    Fd = depthAt(F) - 2 * fi;
  const bump = Array.from(
    { length: 9 },
    (_, i) => `${i * 12.5}% ${2 + Math.abs(Math.sin(i * 1.7)) * 5}%`,
  ).join(",");
  fill(
    "ba-ffront",
    W - 2 * fi,
    F,
    `translateY(${(H - F) / 2}px) translateZ(${D / 2 - fi}px) rotateX(${tilt}deg)`,
    tex[0],
  ).style.clipPath = `polygon(0 4%,${bump},100% 3%,100% 100%,0 100%)`;
  fill(
    "ba-fback",
    W - 2 * fi,
    F,
    `translateY(${(H - F) / 2}px) translateZ(${-D / 2 + fi}px) rotateY(180deg) rotateX(${tilt}deg)`,
    tex[1],
  );
  const half = (Fd / 2 / (D - 2 * fi)) * 50;
  const sideClip = `polygon(0 100%,100% 100%,${50 + half}% 0,${50 - half}% 0)`;
  fill(
    "ba-fside",
    D - 2 * fi,
    F,
    `translateY(${(H - F) / 2}px) translateX(${W / 2 - fi}px) rotateY(90deg)`,
    tex[1],
    "30% 50%",
  ).style.clipPath = sideClip;
  fill(
    "ba-fside",
    D - 2 * fi,
    F,
    `translateY(${(H - F) / 2}px) translateX(${-W / 2 + fi}px) rotateY(-90deg)`,
    tex[0],
    "70% 40%",
  ).style.clipPath = sideClip;
  fill(
    "ba-ftop",
    W - 2 * fi,
    Fd,
    `translateY(${H / 2 - F}px) rotateX(90deg)`,
    tex[0],
  ).style.transformOrigin = "50% 50%";

  // Buitenkant
  const gusClip = `polygon(0 100%,100% 100%,${50 + (Dt / 2 / D) * 50}% 0,${50 - (Dt / 2 / D) * 50}% 0)`;
  const gusSvg = `<svg class="ba-gus" viewBox="0 0 100 600" preserveAspectRatio="none"><path d="M50 0 L50 505" stroke="rgba(60,30,0,.28)" stroke-width="1.2" fill="none"/><path d="M0 600 L50 505 L100 600" stroke="rgba(60,30,0,.30)" stroke-width="1.2" fill="rgba(0,0,0,.06)"/><path d="M0 525 L100 525" stroke="rgba(255,255,255,.15)" stroke-width="1"/></svg>`;
  face(
    "ba-side",
    D + 3,
    H,
    `translateX(${-W / 2 + 0.6}px) rotateY(-90deg)`,
    gusSvg,
  ).style.clipPath = gusClip;
  face("ba-side", D + 3, H, `translateX(${W / 2 - 0.6}px) rotateY(90deg)`, gusSvg).style.clipPath =
    gusClip;
  face(
    "ba-back",
    W,
    H,
    `translateZ(${-D / 2}px) rotateY(180deg) rotateX(${tilt}deg)`,
    `<div class="ba-band"></div><div class="ba-tie ba-l"></div><div class="ba-tie ba-r"></div><div class="ba-seam"></div><div class="ba-crease"></div><div class="ba-crease ba-c2"></div>`,
  );
  const top = face("ba-top", W, Dt, `translateY(${-H / 2}px) rotateX(90deg)`);
  top.style.transformOrigin = "50% 50%";
  top.style.top = `${(H - Dt) / 2}px`;
  face(
    "ba-front",
    W,
    H,
    `translateZ(${D / 2}px) rotateX(${tilt}deg)`,
    `<div class="ba-band"></div><div class="ba-crease"></div><div class="ba-crease ba-c2"></div><div class="ba-win" style="background-image:url(${tex[0]})"></div>`,
  );

  // Knop ter hoogte van de vulling / het venster
  btn.style.top = `${sceneH / 2 - H / 2 + H * 0.47}px`;
  return narrow;
}

export function BagAnimation({
  kind,
  labels,
  className = "",
}: {
  kind: BagAnimationKind;
  /** Labels; de eerste helft komt links, de rest rechts. Leeg = standaardteksten. */
  labels?: Text[] | undefined;
  className?: string;
}) {
  const tr = useTr();
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const bagRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const introRef = useRef<() => void>(() => {});
  const [xray, setXray] = useState(false);
  const [touch, setTouch] = useState(false);
  const [narrow, setNarrow] = useState(false);

  const all = labels && labels.length > 0 ? labels.map((l) => tr(l)) : DEFAULT_BAG_LABELS[kind];
  const split = Math.ceil(all.length / 2);
  const left = all.slice(0, split);
  const right = all.slice(split);

  useEffect(() => {
    const root = rootRef.current,
      scene = sceneRef.current,
      bag = bagRef.current,
      shadow = shadowRef.current,
      btn = btnRef.current;
    if (!root || !scene || !bag || !shadow || !btn) return;
    setTouch(window.matchMedia("(hover: none)").matches);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.style.setProperty("--ba-noise", NOISE);
    root.style.setProperty("--ba-mottle", MOTTLE);
    const tex = textures(kind);

    let raf = 0;
    const frame = (t: number) => {
      const p = Math.min(1, Math.max(0, t / DUR)),
        a = 360 * ease(p);
      bag.style.transform = `rotateX(${ELEV}deg) rotateY(${a}deg)`;
      bag.style.setProperty("--ba-p", paperAt(a).toFixed(3));
      return p < 1;
    };
    const intro = () => {
      cancelAnimationFrame(raf);
      setXray(false);
      shadow.classList.add("ba-on");
      if (reduced) {
        frame(DUR);
        return;
      }
      bag.classList.add("ba-anim");
      const t0 = performance.now();
      const step = (now: number) => {
        if (frame(now - t0)) raf = requestAnimationFrame(step);
        else bag.classList.remove("ba-anim");
      };
      frame(0);
      raf = requestAnimationFrame(step);
    };
    introRef.current = intro;

    setNarrow(buildBag(root, scene, bag, shadow, btn, tex));
    frame(0);

    // Het rondje start zodra de zak in beeld komt.
    let played = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!played && entries.some((e) => e.isIntersecting)) {
          played = true;
          intro();
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(root);

    let lastW = root.clientWidth,
      lastH = root.clientHeight,
      rt = 0;
    const ro = new ResizeObserver(() => {
      if (root.clientWidth === lastW && root.clientHeight === lastH) return;
      lastW = root.clientWidth;
      lastH = root.clientHeight;
      window.clearTimeout(rt);
      rt = window.setTimeout(() => {
        const p = bag.style.getPropertyValue("--ba-p");
        setNarrow(buildBag(root, scene, bag, shadow, btn, tex));
        if (played) {
          cancelAnimationFrame(raf);
          bag.classList.remove("ba-anim");
          frame(DUR);
          bag.style.setProperty("--ba-p", p);
        } else frame(0);
      }, 150);
    });
    ro.observe(root);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(rt);
      io.disconnect();
      ro.disconnect();
    };
  }, [kind]);

  useEffect(() => {
    bagRef.current?.style.setProperty("--ba-p", xray ? "0" : "1");
  }, [xray]);

  const lab = (t: string, i: number, offset = 0) => (
    <div
      key={i}
      className="ba-lab"
      style={{ transitionDelay: xray ? `${(i + offset) * 70}ms` : "0ms" }}
    >
      <i aria-hidden="true" />
      <span>{rich(t)}</span>
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={`ba-root ${xray ? "ba-xray" : ""} ${touch ? "ba-touch" : ""} ${narrow ? "ba-narrow" : ""} ${className}`}
    >
      <div className="ba-stage">
        <div className="ba-labels ba-left" aria-hidden={!xray}>
          {left.map((t, i) => lab(t, i))}
        </div>
        <div
          ref={sceneRef}
          className="ba-scene"
          onClick={() => setTouch((v) => v || window.matchMedia("(hover: none)").matches)}
        >
          <div ref={shadowRef} className="ba-shadow" />
          <div className="ba-fade">
            <div
              ref={bagRef}
              className="ba-bag"
              role="img"
              aria-label={tr({
                nl: "Kraftpapieren zak met venster",
                en: "Kraft paper bag with window",
              })}
            />
          </div>
          <button
            ref={btnRef}
            type="button"
            className="ba-btn"
            aria-pressed={xray}
            onClick={(e) => {
              e.stopPropagation();
              setXray((v) => !v);
            }}
          >
            {xray ? tr({ nl: "Terug", en: "Back" }) : tr({ nl: "Ingrediënten", en: "Ingredients" })}
          </button>
        </div>
        <div className="ba-labels ba-right" aria-hidden={!xray}>
          {right.map((t, i) => lab(t, i, 0.5))}
        </div>
        <div className="ba-mobile" aria-hidden={!xray}>
          {all.map((t, i) => lab(t, i))}
        </div>
      </div>
      <button type="button" className="ba-replay" onClick={() => introRef.current()}>
        {tr({ nl: "Opnieuw draaien", en: "Spin again" })}
      </button>
    </div>
  );
}
