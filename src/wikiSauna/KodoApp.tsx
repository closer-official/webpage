import { useEffect, useId, useRef, useState } from 'react';
import Lenis from 'lenis';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const P = (id: string, w: number, fm?: string, ext = 'jpeg') =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&w=${w}${fm ? `&fm=${fm}` : ''}`;

const HERO_VIDEO_MP4 = 'https://videos.pexels.com/video-files/856973/856973-hd_1920_1080_25fps.mp4';
const HERO_POSTER = P('35894903', 1920, 'webp');
const HERO_STATIC_FALLBACK = P('36554101', 1920, 'webp');

const easeOut = [0.22, 1, 0.36, 1] as const;
const revealTransition = { duration: 0.95, ease: easeOut };
type DemoProfile = 'tiktok' | 'youtube';

const DEMO_TIMELINES: Record<DemoProfile, { id: string; travelMs: number; holdMs: number }[]> = {
  tiktok: [
    { id: 'ritual', travelMs: 2400, holdMs: 3600 },
    { id: 'element-fire', travelMs: 2100, holdMs: 3200 },
    { id: 'element-ice', travelMs: 2100, holdMs: 3200 },
    { id: 'element-air', travelMs: 2100, holdMs: 3600 },
    { id: 'specs', travelMs: 2000, holdMs: 5200 },
    { id: 'membership', travelMs: 2000, holdMs: 5000 },
    { id: 'access', travelMs: 1700, holdMs: 2200 },
  ],
  youtube: [
    { id: 'ritual', travelMs: 2600, holdMs: 11000 },
    { id: 'element-fire', travelMs: 2400, holdMs: 12000 },
    { id: 'element-ice', travelMs: 2200, holdMs: 12000 },
    { id: 'element-air', travelMs: 2200, holdMs: 12000 },
    { id: 'specs', travelMs: 2000, holdMs: 12000 },
    { id: 'membership', travelMs: 2300, holdMs: 13000 },
    { id: 'access', travelMs: 1800, holdMs: 9000 },
  ],
};

function sectionReveal(delay = 0, reduceMotion: boolean | null) {
  if (reduceMotion) {
    return {
      initial: { opacity: 1, y: 0, scale: 1 },
      whileInView: { opacity: 1, y: 0, scale: 1 },
    };
  }
  return {
    initial: { opacity: 0, y: 40, scale: 0.98 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, margin: '0px 0px 12% 0px', amount: 0.08 },
    transition: { ...revealTransition, delay },
  };
}

function CoreElementBand({
  id,
  word,
  eyebrow,
  title,
  body,
  imageSide,
  photoId,
  w,
  width,
  height,
  alt,
  ext = 'jpeg',
  reduceMotion,
}: {
  id?: string;
  word: 'FIRE' | 'ICE' | 'AIR';
  eyebrow: string;
  title: string;
  body: string;
  imageSide: 'left' | 'right';
  photoId: string;
  w: number;
  width: number;
  height: number;
  alt: string;
  ext?: 'jpeg' | 'png';
  reduceMotion: boolean | null;
}) {
  const rm = !!reduceMotion;
  const rootRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start 0.9', 'end 0.1'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], rm ? [0, 0] : [56, -18]);
  const bgX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    rm ? [0, 0, 0] : imageSide === 'left' ? [-120, -36, 0] : [120, 36, 0],
  );
  const imageY = useTransform(scrollYProgress, [0, 1], rm ? [0, 0] : [44, -12]);

  const titleClass =
    word === 'FIRE' || word === 'AIR'
      ? 'wss-kodo-core-band__title wss-kodo-core-band__title--copper'
      : 'wss-kodo-core-band__title';

  return (
    <motion.article
      ref={rootRef}
      id={id}
      className={`wss-kodo-core-band wss-kodo-core-band--${word.toLowerCase()} wss-kodo-core-band--img-${imageSide}`}
    >
      <motion.span className="wss-kodo-core-band__bgword" aria-hidden style={rm ? undefined : { y: bgY, x: bgX }}>
        {word}
      </motion.span>
      <div className="wss-kodo-core-band__float">
        <motion.div
          className="wss-kodo-core-band__text"
          initial={rm ? false : { opacity: 0, y: 34 }}
          whileInView={rm ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.34, margin: '0px 0px 10% 0px' }}
          transition={{ duration: 0.82, ease: easeOut }}
        >
          <p className="wss-kodo-core-band__eyebrow">{eyebrow}</p>
          <h3 className={titleClass}>{title}</h3>
          <p className="wss-kodo-core-band__body">{body}</p>
        </motion.div>
        <motion.div className="wss-kodo-core-band__media-track" style={rm ? undefined : { y: imageY }}>
          <motion.div
            className="wss-kodo-core-band__media"
            initial={rm ? false : { opacity: 0, y: 52, scale: 0.986 }}
            whileInView={rm ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.28, margin: '0px 0px 8% 0px' }}
            transition={{ duration: 1.05, delay: 0.2, ease: easeOut }}
          >
            <PexImg photoId={photoId} w={w} width={width} height={height} alt={alt} ext={ext} />
          </motion.div>
        </motion.div>
      </div>
    </motion.article>
  );
}

function NavGlyph({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a2a44" />
          <stop offset="100%" stopColor="#0a101c" />
        </linearGradient>
        <linearGradient id={`${uid}-c`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8a5228" />
          <stop offset="100%" stopColor="#e8a86a" />
        </linearGradient>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="30"
        fill={`url(#${uid}-g)`}
        stroke="rgba(184,115,51,0.35)"
        strokeWidth="1"
      />
      <path
        fill="none"
        stroke={`url(#${uid}-c)`}
        strokeWidth="2"
        strokeLinecap="round"
        d="M14 36c6-10 14-14 22-10s14 8 24 6"
      />
      <path
        fill="none"
        stroke="rgba(232,237,245,0.25)"
        strokeWidth="1.2"
        strokeLinecap="round"
        d="M20 22c4 6 10 8 16 5M38 20c5 3 8 9 6 16"
      />
    </svg>
  );
}

function HeroLogo({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-lg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4915a" />
          <stop offset="100%" stopColor="#7a441f" />
        </linearGradient>
      </defs>
      <rect
        x="8"
        y="8"
        width="104"
        height="104"
        rx="52"
        fill="rgba(10,16,28,0.55)"
        stroke={`url(#${uid}-lg)`}
        strokeWidth="1.2"
      />
      <path
        fill="none"
        stroke={`url(#${uid}-lg)`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M28 62c12-22 28-28 32-8 2 12-6 24-18 30M52 34c10 4 16 14 14 26"
      />
      <path
        fill="none"
        stroke="rgba(232,237,245,0.35)"
        strokeWidth="1.4"
        strokeLinecap="round"
        d="M34 38c6 8 14 10 22 6M70 36c6 4 10 12 8 20"
      />
    </svg>
  );
}

function PexImg({
  photoId,
  w,
  width,
  height,
  alt = '',
  fetchPriority,
  ext = 'jpeg',
}: {
  photoId: string;
  w: number;
  width: number;
  height: number;
  alt?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  ext?: 'jpeg' | 'png';
}) {
  return (
    <picture>
      <source type="image/avif" srcSet={P(photoId, w, 'avif', ext)} />
      <source type="image/webp" srcSet={P(photoId, w, 'webp', ext)} />
      <img
        src={P(photoId, w, undefined, ext)}
        alt={alt}
        loading={fetchPriority === 'high' ? 'eager' : 'lazy'}
        decoding="async"
        width={width}
        height={height}
        {...(fetchPriority ? { fetchPriority } : {})}
      />
    </picture>
  );
}

export default function KodoApp() {
  const reduceMotion = useReducedMotion();
  const demoConfig = (() => {
    if (typeof window === 'undefined') return { enabled: false, profile: 'tiktok' as DemoProfile, loop: false };
    const qs = new URLSearchParams(window.location.search);
    const enabled = qs.get('demo') === '1';
    const profile = qs.get('profile') === 'youtube' ? 'youtube' : 'tiktok';
    const loopParam = qs.get('loop');
    const loop = loopParam === '1' || (loopParam == null && profile === 'youtube');
    return { enabled, profile: profile as DemoProfile, loop };
  })();
  const [splashDone, setSplashDone] = useState(!!reduceMotion || demoConfig.enabled);
  const [navSolid, setNavSolid] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (demoConfig.enabled) {
      setSplashDone(true);
      return;
    }
    if (reduceMotion) setSplashDone(true);
  }, [reduceMotion, demoConfig.enabled]);

  useEffect(() => {
    if (reduceMotion || splashDone || demoConfig.enabled) return;
    const t = window.setTimeout(() => setSplashDone(true), 2000);
    return () => window.clearTimeout(t);
  }, [reduceMotion, splashDone, demoConfig.enabled]);

  useEffect(() => {
    if (reduceMotion || demoConfig.enabled) {
      lenisRef.current = null;
      const onScroll = () => setNavSolid(window.scrollY > 48);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }
    let lenis: Lenis | null = null;
    let rafId = 0;
    try {
      lenis = new Lenis({ smoothWheel: true, wheelMultiplier: 0.92 });
      lenisRef.current = lenis;
      const loop = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
      const onScroll = () => setNavSolid((lenis?.scroll ?? 0) > 48);
      lenis.on('scroll', onScroll);
      onScroll();
    } catch (e) {
      console.error('[wiki-sauna] Lenis init failed', e);
      lenisRef.current = null;
      const onScroll = () => setNavSolid(window.scrollY > 48);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }
    return () => {
      cancelAnimationFrame(rafId);
      lenisRef.current = null;
      lenis?.destroy();
    };
  }, [reduceMotion, demoConfig.enabled]);

  useEffect(() => {
    if (!demoConfig.enabled || !splashDone) return;
    let cancelled = false;
    let rafId = 0;
    let timer: number | null = null;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        if (cancelled) {
          resolve();
          return;
        }
        timer = window.setTimeout(() => {
          timer = null;
          resolve();
        }, ms);
      });

    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const animateTo = (targetY: number, durationMs: number) =>
      new Promise<void>((resolve) => {
        if (cancelled) {
          resolve();
          return;
        }
        const startY = window.scrollY;
        const distance = targetY - startY;
        if (Math.abs(distance) < 2 || durationMs <= 16) {
          window.scrollTo(0, targetY);
          resolve();
          return;
        }
        const startTime = performance.now();
        const tick = (now: number) => {
          if (cancelled) {
            resolve();
            return;
          }
          const elapsed = now - startTime;
          const t = Math.min(1, elapsed / durationMs);
          const eased = easeInOutCubic(t);
          window.scrollTo(0, startY + distance * eased);
          if (t < 1) rafId = requestAnimationFrame(tick);
          else resolve();
        };
        rafId = requestAnimationFrame(tick);
      });

    const getTargetY = (id: string) => {
      const el = document.getElementById(id);
      if (!(el instanceof HTMLElement)) return 0;
      return Math.max(0, el.getBoundingClientRect().top + window.scrollY - 72);
    };

    const run = async () => {
      const timeline = DEMO_TIMELINES[demoConfig.profile];
      do {
        for (const cue of timeline) {
          if (cancelled) return;
          await animateTo(getTargetY(cue.id), cue.travelMs);
          await sleep(cue.holdMs);
        }
        if (!demoConfig.loop || cancelled) break;
        await animateTo(0, demoConfig.profile === 'youtube' ? 2600 : 1800);
        await sleep(demoConfig.profile === 'youtube' ? 2200 : 1200);
      } while (!cancelled);
    };

    run();
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (timer != null) window.clearTimeout(timer);
    };
  }, [demoConfig.enabled, demoConfig.loop, demoConfig.profile, splashDone]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const a = t.closest('a[href^="#"]');
      if (!a || !root.contains(a)) return;
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const el = document.querySelector(href);
      if (!(el instanceof HTMLElement)) return;
      e.preventDefault();
      const lenis = lenisRef.current;
      if (lenis && !reduceMotion) lenis.scrollTo(el, { offset: -72, duration: 1.15 });
      else {
        const top = el.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [reduceMotion]);

  const rev = (delay = 0) => sectionReveal(delay, reduceMotion);

  const showSplashLayer = !reduceMotion && !splashDone && !demoConfig.enabled;

  return (
    <div ref={rootRef} className="wss-kodo-mount">
      <AnimatePresence>
        {showSplashLayer && (
          <motion.div
            key="kodo-splash"
            className="wss-kodo-splash"
            role="presentation"
            aria-hidden
            initial={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.78, ease: easeOut }}
          >
            <motion.div
              className="wss-kodo-splash__inner"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                scale: reduceMotion ? 1 : [1, 1.04, 1],
              }}
              transition={{
                opacity: { duration: 1.35, ease: 'easeOut' },
                scale: { duration: 2.4, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' },
              }}
            >
              <span className="wss-kodo-splash__word">KODŌ</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        className={`wss-kodo-nav${navSolid ? ' wss-kodo-nav--solid' : ''}`}
        id="kodo-top"
        initial={false}
      >
        <div className="wss-kodo-nav__mark">
          <NavGlyph className="wss-kodo-nav__glyph" />
          <div>
            <div className="wss-kodo-nav__word">KODŌ</div>
            <div className="wss-kodo-nav__sub">The Ritual of Primal Pulse</div>
          </div>
        </div>
        <nav className="wss-kodo-nav__links" aria-label="In-page">
          <a href="#elements">Elements</a>
          <a href="#specs">Specs</a>
          <a href="#membership">Membership</a>
          <a href="#access">Access</a>
        </nav>
      </motion.header>

      <section className="wss-kodo-hero" id="ritual" aria-label="Hero">
        <div className="wss-kodo-hero__media" aria-hidden>
          {reduceMotion ? (
            <img src={HERO_STATIC_FALLBACK} alt="" width={1920} height={1280} decoding="async" />
          ) : (
            <video autoPlay muted loop playsInline poster={HERO_POSTER}>
              <source src={HERO_VIDEO_MP4} type="video/mp4" />
            </video>
          )}
        </div>
        <div className="wss-kodo-hero__mist" aria-hidden />
        <div className="wss-kodo-hero__veil" aria-hidden />
        <motion.div
          className="wss-kodo-hero__content"
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: easeOut, delay: reduceMotion ? 0 : 0.35 }}
        >
          <HeroLogo className="wss-kodo-hero__logo" />
          <h1 className="wss-kodo-hero__title">KODŌ</h1>
          <p className="wss-kodo-hero__ja">鼓動</p>
          <p className="wss-kodo-hero__tag">The Ritual of Primal Pulse</p>
          <div className="wss-kodo-scroll">
            <span>Scroll</span>
            <span className="wss-kodo-scroll__line" aria-hidden />
          </div>
        </motion.div>
      </section>

      <motion.section className="wss-kodo-section wss-kodo-core" id="elements" aria-labelledby="kodo-elements-heading" {...rev(0.06)}>
        <div className="wss-kodo-section__head">
          <p className="wss-kodo-section__eyebrow">Three Pulses</p>
          <h2 id="kodo-elements-heading">The Ritual of Three Pulses</h2>
          <p className="wss-kodo-section__lead">
            Digital noise follows you everywhere. KODŌ is the mute button: three pulses—heat, ice, and the restoration of air.
          </p>
        </div>
        <div className="wss-kodo-core__bands">
          <CoreElementBand
            id="element-fire"
            word="FIRE"
            eyebrow="HAKU (脈)"
            title="Fire"
            body="Heat arrives as a disciplined wave. In the sauna chamber, temperature is held at the edge of tolerance so attention cannot wander. You listen inward—the first pulse, quickening—until the mind yields and the periphery falls away."
            imageSide="left"
            photoId="35894903"
            w={1800}
            width={1800}
            height={1200}
            alt="Close-up of glowing charcoal and flame"
            reduceMotion={reduceMotion}
          />
          <CoreElementBand
            id="element-ice"
            word="ICE"
            eyebrow="SUI (深)"
            title="Ice"
            body="Then ice: a second pulse, clean and absolute, rinsing heat from the skin and thought from the forebrain. The contrast is architectural, not theatrical; we refuse spectacle in favor of precision."
            imageSide="right"
            photoId="36650041"
            w={1500}
            width={1500}
            height={1000}
            alt="Dark stone bath in low warm light"
            reduceMotion={reduceMotion}
          />
          <CoreElementBand
            id="element-air"
            word="AIR"
            eyebrow="KŪ (空)"
            title="Air"
            body="The third pulse belongs to air and horizon. On the terrace, gravity eases; the chair supports without demanding posture. Wind carries scent from moss, cedar, rain on stone. Time stretches—not as boredom, but as spaciousness. Members describe it as hearing their own pulse again, faint but unmistakable, like a metronome returned to the correct tempo after years of drift."
            imageSide="left"
            photoId="36099638"
            w={1700}
            width={1700}
            height={1133}
            alt="Quiet forest path with tall trees and filtered light"
            ext="png"
            reduceMotion={reduceMotion}
          />
        </div>
      </motion.section>

      <motion.section className="wss-kodo-section wss-kodo-specs" id="specs" aria-labelledby="kodo-specs-heading" {...rev(0.05)}>
        <div className="wss-kodo-section__head">
          <p className="wss-kodo-section__eyebrow">Technical</p>
          <h2 id="kodo-specs-heading">Specifications</h2>
        </div>
        <div className="wss-kodo-specs__grid" role="list">
          <div className="wss-kodo-specs__row" role="listitem">
            <span className="wss-kodo-specs__cat">Sauna</span>
            <div className="wss-kodo-specs__vals">
              <span>95°C</span>
              <span>100-year-old Kero wood</span>
              <span>Charcoal heater</span>
            </div>
          </div>
          <div className="wss-kodo-specs__row" role="listitem">
            <span className="wss-kodo-specs__cat">Cold Plunge</span>
            <div className="wss-kodo-specs__vals">
              <span>10°C &amp; 16°C</span>
              <span>Underground mineral water</span>
            </div>
          </div>
          <div className="wss-kodo-specs__row" role="listitem">
            <span className="wss-kodo-specs__cat">Rest</span>
            <div className="wss-kodo-specs__vals">
              <span>Rooftop terrace</span>
              <span>Zero-gravity chairs</span>
            </div>
          </div>
          <div className="wss-kodo-specs__row" role="listitem">
            <span className="wss-kodo-specs__cat">Amenities</span>
            <div className="wss-kodo-specs__vals">
              <span className="wss-kodo-specs__premium">Curated selections from LE LABO</span>
            </div>
          </div>
        </div>
        <p className="wss-kodo-specs__note">
          Fictional specification sheet for demo purposes. Operational temperatures, materials, and partner brands
          require verification before any real launch.
        </p>
      </motion.section>

      <motion.section
        className="wss-kodo-section wss-kodo-section--membership"
        id="membership"
        aria-labelledby="kodo-member-heading"
        {...rev(0.04)}
      >
        <div className="wss-kodo-section__head">
          <p className="wss-kodo-section__eyebrow wss-kodo-section__eyebrow--ja" lang="ja">
            料金・会員
          </p>
          <h2 id="kodo-member-heading">Exclusive Membership</h2>
        </div>
        <div className="wss-kodo-privileges">
          <motion.span
            className="wss-kodo-privileges__bgword"
            aria-hidden
            initial={reduceMotion ? false : { opacity: 0, x: -160 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.1, ease: easeOut }}
          >
            PRIVILEGE
          </motion.span>
          <div className="wss-kodo-privileges__grid">
            <article className="wss-kodo-privilege">
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M4 20h16M6 20V8l6-4 6 4v12M10 20v-5h4v5" />
              </svg>
              <h3>Private Sanctuary</h3>
              <p>Unlimited access to individual Kero-wood suites.</p>
            </article>
            <article className="wss-kodo-privilege">
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M12 4v16M4 12h16M7 7c2 2 8 2 10 0M7 17c2-2 8-2 10 0" />
              </svg>
              <h3>Personal Curator</h3>
              <p>Tailored humidity and scent settings for every session.</p>
            </article>
            <article className="wss-kodo-privilege">
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M5 8h14M6 8l1 10h10l1-10M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              <h3>KODŌ Lounge</h3>
              <p>Full access to our members-only vegan mixology bar.</p>
            </article>
            <article className="wss-kodo-privilege">
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M5 9l7-5 7 5v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9Zm4 4h6m-6 3h6" />
              </svg>
              <h3>Priority Concierge</h3>
              <p>24/7 priority booking via our dedicated app.</p>
            </article>
          </div>
        </div>
        <div className="wss-kodo-tier-cards">
          <article className="wss-kodo-tier-card wss-kodo-tier-card--founder">
            <p className="wss-kodo-tier-card__eyebrow">Founder</p>
            <h3>Legacy Tier</h3>
            <p className="wss-kodo-tier-card__price">
              <strong>¥300,000</strong>
              <span> one-time</span>
            </p>
            <p className="wss-kodo-tier-card__lead">Lifetime Access. Legacy Status.</p>
            <ul className="wss-kodo-tier-card__list">
              <li>Permanent founder recognition in member registry.</li>
              <li>Priority allocation for prime evening ritual windows.</li>
            </ul>
          </article>
          <article className="wss-kodo-tier-card wss-kodo-tier-card--monthly">
            <p className="wss-kodo-tier-card__eyebrow">Monthly</p>
            <h3>Signature Tier</h3>
            <p className="wss-kodo-tier-card__price">
              <strong>¥50,000</strong>
              <span> / month</span>
            </p>
            <p className="wss-kodo-tier-card__lead">Flexibility. Full Access.</p>
            <ul className="wss-kodo-tier-card__list">
              <li>Includes 4 private sessions and unlimited lounge access.</li>
              <li>Full app booking controls with same-day concierge support.</li>
            </ul>
          </article>
        </div>
        <p className="wss-kodo-member-note wss-kodo-member-note--emphasis">
          Admission is granted only after a personal interview and recommendation by two existing members.
        </p>
        <p className="wss-kodo-member-cta">
          <a href="#access" className="wss-kodo-btn-tour">
            Book A Tour
          </a>
        </p>
      </motion.section>

      <motion.section className="wss-kodo-access" id="access" aria-labelledby="kodo-access-heading" {...rev(0.03)}>
        <PexImg photoId="6044198" w={1600} width={1600} height={1067} alt="" />
        <div className="wss-kodo-access__veil" aria-hidden />
        <div className="wss-kodo-access__panel">
          <h2 id="kodo-access-heading">Minami-Aoyama</h2>
          <address className="wss-kodo-access__address">
            Minami-Aoyama, Minato-ku, Tokyo 107-0062
          </address>
          <p className="wss-kodo-access__note">By Appointment Only. Discreet Entrance.</p>
        </div>
      </motion.section>

      <motion.footer className="wss-kodo-footer" id="contact" {...rev(0.02)}>
        <a href="#kodo-top" className="wss-kodo-footer__pulse">
          <HeroLogo className="wss-kodo-footer__logo" />
          <span className="wss-kodo-footer__word">KODŌ</span>
          <span className="wss-kodo-footer__addr">Minami-Aoyama, Minato-ku, Tokyo 107-0062</span>
        </a>
        <p className="wss-kodo-footer__copy">Copyright © 2026 KODŌ Wellness Design Group LLC.</p>
        <p className="wss-kodo-footer__demo">
          Fictional demo property. Verify claims, pricing, and regulations before any real operation.
        </p>
        <p className="wss-kodo-footer__credits">
          Photos &amp; video:{' '}
          <a href="https://www.pexels.com/" rel="noopener noreferrer" target="_blank">
            Pexels
          </a>
        </p>
      </motion.footer>
    </div>
  );
}
