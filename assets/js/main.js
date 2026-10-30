/* MIND by GAB — interactions */
(() => {
  "use strict";

  const CONTACT_EMAIL = "mindbygab@gmail.com";
  // Contact form delivery (FormSubmit.co forwards submissions to CONTACT_EMAIL; the first one sends an activation email)
  const FORM_ENDPOINT = "https://formsubmit.co/ajax/" + CONTACT_EMAIL;
  // Tech Warrior on Amazon; empty = the button emails you instead
  const BOOK_URL = "https://www.amazon.com/dp/B09L4RFK9S";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined";
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  $("#year").textContent = new Date().getFullYear();
  if (BOOK_URL) { const b = $("#bookBtn"); b.href = BOOK_URL; b.target = "_blank"; b.rel = "noopener"; }

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduced && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollToTarget = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: -70 });
    else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const target = id === "#top" ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    document.documentElement.classList.remove("menu-open");
    scrollToTarget(target);
  });

  /* ---------- preloader ---------- */
  const loader = $("#loader");
  const finishIntro = () => {
    document.body.classList.remove("loading");
    heroIntro();
  };
  if (reduced) {
    loader.remove();
    finishIntro();
  } else {
    const num = $("#loadNum"), bar = $("#loadBar");
    let p = 0, loaded = false;
    window.addEventListener("load", () => (loaded = true));
    setTimeout(() => (loaded = true), 3500);
    const tick = () => {
      p += (loaded ? 4 : 0.6) + Math.random() * 1.5;
      if (!loaded && p > 85) p = 85;
      p = Math.min(p, 100);
      num.textContent = Math.floor(p);
      bar.style.width = p + "%";
      if (p < 100) return setTimeout(tick, 28);
      if (hasGsap) {
        const tl = gsap.timeline({ onComplete: () => loader.remove() });
        tl.to(".loader-inner", { y: -40, opacity: 0, duration: .5, ease: "power3.in" })
          .to("#curtain", { y: "0%", duration: .6, ease: "power4.inOut" }, "-=.1")
          .set(loader, { display: "none" })
          .add(finishIntro)
          .to("#curtain", { y: "-100%", duration: .8, ease: "power4.inOut" });
      } else {
        loader.remove();
        finishIntro();
      }
    };
    tick();
  }

  function heroIntro() {
    if (!hasGsap || reduced) return;
    gsap.from("#heroTitle .line > span", { yPercent: 110, rotate: 4, duration: 1.3, ease: "expo.out", stagger: .1 });
    gsap.from([".book-badge", ".hero-top", ".hero-sub", ".hero-bottom", ".scroll-hint", ".nav"], { opacity: 0, y: 24, duration: 1, ease: "power3.out", stagger: .08, delay: .35 });
  }

  /* ---------- cursor ---------- */
  if (finePointer) {
    const cur = $("#cursor"), dot = $("#cursorDot"), label = $("span", cur);
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    });
    (function loop() {
      cx += (mx - cx) * .18; cy += (my - cy) * .18;
      cur.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", (e) => {
      const lab = e.target.closest("[data-cursor]");
      const hov = e.target.closest("a, button, input, textarea, .pu-orb");
      cur.classList.toggle("is-label", !!lab);
      cur.classList.toggle("is-hover", !lab && !!hov);
      label.textContent = lab ? lab.dataset.cursor : "";
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (finePointer && !reduced) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * .3}px, ${y * .4}px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
  }

  /* ---------- nav ---------- */
  const nav = $("#nav"), progress = $("#progress");
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle("scrolled", y > 40);
    nav.classList.toggle("hidden", y > lastY && y > 600 && !document.documentElement.classList.contains("menu-open"));
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  $("#menuBtn").addEventListener("click", () => document.documentElement.classList.toggle("menu-open"));

  const navLinks = $$(".nav-links a");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + navFor[en.target.id]));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  const navFor = { projects: "projects", pulse: "projects", hitbeatrun: "projects", work: "projects", services: "services", team: "team", about: "about", book: "book", start: "start" };
  Object.keys(navFor).forEach((id) => $("#" + id) && spy.observe($("#" + id)));

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 0.07 + "s";
    io.observe(el);
  });

  /* ---------- rotating word (scramble) ---------- */
  const words = ["mobile app", "software", "website", "MVP", "AI product", "technology"];
  const rot = $("#rotator");
  const glyphs = "!<>-_\\/[]{}—=+*^?#01";
  let wi = 0;
  const scramble = (to) => {
    const from = rot.textContent, len = Math.max(from.length, to.length);
    let frame = 0;
    const q = [...Array(len)].map((_, i) => ({ from: from[i] || "", to: to[i] || "", start: Math.floor(Math.random() * 12), end: Math.floor(Math.random() * 12) + 12 }));
    const step = () => {
      let out = "", done = 0;
      q.forEach((c) => {
        if (frame >= c.end) { done++; out += c.to; }
        else if (frame >= c.start) out += glyphs[Math.floor(Math.random() * glyphs.length)];
        else out += c.from;
      });
      rot.textContent = out;
      if (done < q.length) { frame++; requestAnimationFrame(step); }
    };
    step();
  };
  if (!reduced) setInterval(() => scramble(words[(wi = (wi + 1) % words.length)]), 2600);

  /* ---------- hero neural network ---------- */
  (function neural() {
    const c = $("#neural"), ctx = c.getContext("2d");
    const cols = [[232, 63, 203], [43, 155, 230], [106, 53, 224]];
    let w, h, dpr, nodes = [], mouse = { x: -9999, y: -9999 }, shocks = [], visible = true;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(130, (w * h) / 11000));
      nodes = [...Array(n)].map(() => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
        r: Math.random() * 1.8 + .8, c: cols[Math.floor(Math.random() * 3)], glow: 0
      }));
    };
    resize();
    addEventListener("resize", resize);
    const hero = $("#hero");
    hero.addEventListener("mousemove", (e) => { const r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener("mouseleave", () => (mouse.x = mouse.y = -9999));
    hero.addEventListener("click", (e) => {
      if (e.target.closest("a,button")) return;
      const r = c.getBoundingClientRect();
      shocks.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 0 });
    });
    new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(hero);
    const LINK = 130;
    const draw = () => {
      requestAnimationFrame(draw);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      shocks.forEach((s) => (s.r += 9));
      shocks = shocks.filter((s) => s.r < Math.max(w, h));
      for (const n of nodes) {
        const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
        if (d < 200) { n.vx += dx / d * .03; n.vy += dy / d * .03; n.glow = Math.min(1, n.glow + .08); }
        for (const s of shocks) {
          const sx = n.x - s.x, sy = n.y - s.y, sd = Math.hypot(sx, sy);
          if (Math.abs(sd - s.r) < 30) { n.vx += sx / sd * 1.2; n.vy += sy / sd * 1.2; n.glow = 1; }
        }
        n.glow *= .97;
        n.vx *= .985; n.vy *= .985;
        const sp = Math.hypot(n.vx, n.vy);
        if (sp < .15) { n.vx += (Math.random() - .5) * .05; n.vy += (Math.random() - .5) * .05; }
        n.x += reduced ? 0 : n.vx; n.y += reduced ? 0 : n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            const g = Math.max(a.glow, b.glow);
            ctx.strokeStyle = `rgba(${a.c[0]},${a.c[1]},${a.c[2]},${(1 - d / LINK) * (.18 + g * .6)})`;
            ctx.lineWidth = .6 + g;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        // mouse links
        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < 180) {
          ctx.strokeStyle = `rgba(255,255,255,${(1 - md / 180) * .5})`;
          ctx.lineWidth = .7;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${n.c[0]},${n.c[1]},${n.c[2]},${.55 + n.glow * .45})`;
        ctx.shadowColor = `rgb(${n.c})`; ctx.shadowBlur = 6 + n.glow * 18;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + n.glow * 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;
      for (const s of shocks) {
        ctx.strokeStyle = `rgba(232,63,203,${Math.max(0, .5 - s.r / 1200)})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.stroke();
      }
    };
    draw();
  })();

  /* ---------- manifesto word reveal ---------- */
  (function manifesto() {
    const p = $("#manifestoText");
    const hl = ["product-driven", "grows.", "design", "build"];
    p.innerHTML = p.textContent.trim().split(/\s+/).map((w) => `<span class="w${hl.includes(w) ? " hl" : ""}">${w}</span>`).join(" ");
    const ws = $$(".w", p);
    if (reduced) return ws.forEach((w) => (w.style.opacity = 1));
    const update = () => {
      const r = p.getBoundingClientRect();
      const prog = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .35)));
      const n = prog * ws.length;
      ws.forEach((w, i) => (w.style.opacity = i < n ? 1 : .14));
    };
    addEventListener("scroll", update, { passive: true });
    update();
  })();

  /* ---------- counters + stat spotlight ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      countIO.unobserve(en.target);
      const el = en.target, end = +el.dataset.count, start = "plain" in el.dataset ? end - 9 : 0;
      if (reduced) return;
      const t0 = performance.now(), dur = 1800;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
        const v = Math.round(start + (end - start) * e);
        el.textContent = "plain" in el.dataset ? v : v.toLocaleString("en-US");
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: .6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));
  $$(".stat, .why-card").forEach((s) => s.addEventListener("mousemove", (e) => {
    const r = s.getBoundingClientRect();
    s.style.setProperty("--mx", e.clientX - r.left + "px");
    s.style.setProperty("--my", e.clientY - r.top + "px");
  }));

  /* ---------- Pulse demo ---------- */
  (function pulseDemo() {
    const orb = $("#puOrb"), ring = $(".pu-ring circle"), waves = $$(".pu-wave"), toast = $("#puToast");
    const LEN = 534, HOLD = 1100;
    let sel = { e: "💭", t: "Thinking of you" }, t0 = 0, raf = 0, sent = false;
    $$(".pu-sig").forEach((b) => b.addEventListener("click", () => {
      $$(".pu-sig").forEach((x) => x.classList.remove("sel"));
      b.classList.add("sel");
      sel = { e: b.dataset.e, t: b.dataset.t };
      $("#puOrbE").textContent = sel.e;
    }));
    const reset = () => {
      cancelAnimationFrame(raf);
      orb.classList.remove("holding");
      ring.style.transition = "stroke-dashoffset .4s";
      ring.style.strokeDashoffset = LEN;
      if (!sent) $("#puOrbT").textContent = "Hold to send";
    };
    const fire = () => {
      sent = true;
      orb.classList.remove("holding");
      $("#puOrbT").textContent = "Sent!";
      waves.forEach((w, i) => { w.classList.remove("go"); void w.offsetWidth; setTimeout(() => w.classList.add("go"), i * 220); });
      $("#puToastText").textContent = `“${sel.t}” delivered`;
      toast.classList.add("show");
      try { navigator.vibrate && navigator.vibrate([30, 40, 30]); } catch (_) {}
      setTimeout(() => toast.classList.remove("show"), 2400);
      setTimeout(() => { sent = false; reset(); }, 1600);
    };
    const start = (e) => {
      e.preventDefault();
      if (sent) return;
      orb.classList.add("holding");
      $("#puOrbT").textContent = "Keep holding…";
      ring.style.transition = "none";
      t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / HOLD);
        ring.style.strokeDashoffset = LEN * (1 - k);
        if (k < 1) raf = requestAnimationFrame(step); else fire();
      };
      raf = requestAnimationFrame(step);
    };
    orb.addEventListener("pointerdown", start);
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => orb.addEventListener(ev, () => !sent && reset()));

    // 3D tilt of the phone + parallax of floating shots
    const stage = $("#pulseStage"), phone = $("#pulsePhone"), shots = $$(".float-shot", stage);
    if (finePointer && !reduced) {
      stage.addEventListener("mousemove", (e) => {
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        phone.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 14}deg)`;
        shots.forEach((s) => {
          const d = +s.dataset.depth;
          s.style.translate = `${x * d}px ${y * d}px`;
        });
      });
      stage.addEventListener("mouseleave", () => { phone.style.transform = ""; shots.forEach((s) => (s.style.translate = "")); });
    }
  })();

  /* ---------- HitBeatRun beat lab ---------- */
  (function beatLab() {
    const c = $("#beatCanvas"), ctx = c.getContext("2d");
    const range = $("#bpmRange"), playBtn = $("#beatPlay");
    const bpmOut = $("#bpmOut"), mphOut = $("#mphOut"), lvlOut = $("#lvlOut"), state = $("#beatState");
    const ramp = $$("#ramp span");
    let ac = null, playing = false, nextBeat = 0, beatIdx = 0, lastBeatAt = 0, bpm = 128, energy = .5;
    const bars = [...Array(64)].map(() => Math.random());
    const history = [];

    const level = () => (bpm < 120 ? ["LOW", 4.5] : bpm < 145 ? ["MEDIUM", 6] : ["MAX", 7.5]);
    const updateReadouts = () => {
      const [lvl, base] = level();
      const mph = base + (energy - .5) * 1.2;
      bpmOut.textContent = bpm;
      mphOut.textContent = mph.toFixed(1);
      lvlOut.textContent = lvl;
      const on = Math.round(((bpm - 100) / 80) * 10);
      ramp.forEach((s, i) => s.classList.toggle("on", i < Math.max(1, on)));
    };
    range.addEventListener("input", () => { bpm = +range.value; updateReadouts(); });
    updateReadouts();

    const kick = (t, accent) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.setValueAtTime(accent ? 150 : 120, t);
      o.frequency.exponentialRampToValueAtTime(40, t + .18);
      g.gain.setValueAtTime(accent ? .9 : .6, t);
      g.gain.exponentialRampToValueAtTime(.001, t + .25);
      o.connect(g).connect(ac.destination);
      o.start(t); o.stop(t + .3);
      // hat
      const len = ac.sampleRate * .04, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const n = ac.createBufferSource(), hg = ac.createGain(), hp = ac.createBiquadFilter();
      hp.type = "highpass"; hp.frequency.value = 7000; hg.gain.value = .12;
      n.buffer = buf; n.connect(hp).connect(hg).connect(ac.destination);
      n.start(t + 30 / bpm);
    };
    const scheduler = () => {
      if (!playing) return;
      while (nextBeat < ac.currentTime + .12) {
        kick(nextBeat, beatIdx % 4 === 0);
        const at = nextBeat;
        setTimeout(() => { lastBeatAt = performance.now(); }, Math.max(0, (at - ac.currentTime) * 1000));
        nextBeat += 60 / bpm;
        beatIdx++;
      }
      setTimeout(scheduler, 25);
    };
    playBtn.addEventListener("click", async () => {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") await ac.resume();
      playing = !playing;
      playBtn.textContent = playing ? "❚❚" : "▶";
      state.textContent = playing ? "● Live analysis" : "Paused";
      if (playing) { nextBeat = ac.currentTime + .05; scheduler(); }
    });

    let w, h;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener("resize", resize);
    let visible = false;
    new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(c);

    const draw = (t) => {
      requestAnimationFrame(draw);
      if (!visible) return;
      const since = (performance.now() - lastBeatAt) / 1000;
      const hit = playing ? Math.exp(-since * 9) : .15 + .1 * Math.sin(t / 400);
      energy += ((playing ? .4 + hit * .6 : .35) - energy) * .05;
      ctx.fillStyle = "rgba(5,4,10,.35)";
      ctx.fillRect(0, 0, w, h);
      // spectrum bars
      const bw = w / bars.length;
      bars.forEach((b, i) => {
        const target = Math.random() * (1 - i / bars.length) * (.3 + hit * .9);
        bars[i] += (target - b) * .3;
        const bh = bars[i] * h * .75;
        const g = ctx.createLinearGradient(0, h, 0, h - bh);
        g.addColorStop(0, "#6a35e0"); g.addColorStop(.5, "#2b9be6"); g.addColorStop(1, "#e83fcb");
        ctx.fillStyle = g;
        ctx.fillRect(i * bw + 1, h - bh, bw - 2, bh);
      });
      // energy line
      history.push(energy);
      if (history.length > w / 2) history.shift();
      ctx.strokeStyle = "#31e29a"; ctx.lineWidth = 2;
      ctx.beginPath();
      history.forEach((v, i) => { const x = w - (history.length - i) * 2, y = h * .45 - v * h * .35; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke();
      // beat circle
      const R = 26 + hit * 22;
      ctx.beginPath(); ctx.arc(w - 50, 50, R, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,63,203,${.2 + hit * .6})`; ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "600 13px JetBrains Mono, monospace"; ctx.textAlign = "center";
      ctx.fillText(bpm, w - 50, 55);
      ctx.textAlign = "left"; ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.font = "11px JetBrains Mono, monospace";
      ctx.fillText("RMS ENERGY", 14, 22);
      if (playing) mphOut.textContent = (level()[1] + (energy - .5) * 1.2).toFixed(1);
    };
    requestAnimationFrame(draw);
  })();

  /* ---------- work: filters, tilt, video hover, modal ---------- */
  const PROJECTS = {
    pulse: {
      title: "Pulse", meta: "2026 · iOS app · Relationships", img: "assets/img/pulse-intro.jpg",
      tags: ["Product strategy", "UX/UI", "Swift", "Firebase", "StoreKit"],
      html: `<p>Sometimes love sounds like silence. Sometimes it sounds like “I miss you.” Pulse lets people send a private signal: a gentle timeout when emotions run high, or a quiet reminder that someone is on their mind.</p>
             <ul><li>Hold-to-send signals delivered as notifications, even on a locked phone</li><li>Private pairing with 6-digit invitation codes carried in a share link</li><li>Custom signals with message, emoji and color</li><li>Free plan + premium subscription for unlimited signals and more people</li><li>30-state onboarding and home flow, product film and App Store campaign</li></ul>`
    },
    hitbeatrun: {
      title: "HitBeatRun", meta: "2021 → today · Fitness tech · AI", img: "assets/img/p-hbr.jpg",
      tags: ["R&D", "Audio AI", "Prototyping", "UX/UI", "Mobile"],
      html: `<p>A system built on the BPM of songs, for an entertaining high-intensity cardio session. It took a lot of R&amp;D and testing: research on APIs and audio frameworks able to identify the BPM of a song, then an energy analysis that turns every build-up and drop into a speed cue.</p>
             <ul><li>Neural network tempo detection + RMS energy speed levels</li><li>Guided run-along videos with low / medium / max cues</li><li>Membership site with 1,500+ students</li></ul>
             <p><a href="https://hitbeatrun.com" target="_blank" rel="noopener" class="grad-text">Visit hitbeatrun.com ↗</a></p>`
    },
    bafu: {
      title: "BAFU", meta: "2022 · Fintech · AI", img: "assets/img/p-bafu.jpg",
      tags: ["Fintech", "UX/UI", "Mobile development", "Business analysis", "AI"],
      html: `<p>A digital banking platform that predicts customers' next life events and needs to guide product recommendations.</p>
             <p>BAFU's value proposition is to help underserved Millennial and Gen-Z consumers with financial needs that are rarely about products, using data-driven Artificial Intelligence.</p>`
    },
    vice: {
      title: "Vice Boat Club", meta: "2022 · Marine · Web & software", img: "assets/img/p-vice.jpg",
      tags: ["Web development", "UX/UI", "Cloud integration", "Branding", "SEO"],
      html: `<p>Vice Boat Club was created for life lovers, offering innovative and unique experiences to Miami water enthusiasts.</p>
             <p>MIND by GAB helped Vice Boat Club with web and custom software development. As a boat rental company, they wanted to innovate by offering a very organized way to manage their fleet for different companies, so we built a fleet management system covering asset tracking, dispatch and cost control.</p>`
    },
    homestudy: {
      title: "Homestudy", meta: "2021 · Edtech · Mobile app", img: "assets/img/p-homestudy.jpg",
      tags: ["Mobile app development", "UX/UI", "Business analysis", "Digital marketing"],
      html: `<p>An effective learning tool that teaches kids how to organize their homework and create study schedules.</p>
             <p>Homework, exams, projects and house tasks are organized in a daily timetable, inside an interactive, game-like platform where kids win puzzle pieces and claim prizes when they complete a study plan.</p>`
    },
    food2go: {
      title: "Food2Go", meta: "2019 · Food · Mobile app", img: "assets/img/p-food2go.jpg",
      tags: ["UX/UI", "Mobile app development", "Branding", "Digital marketing"],
      html: `<p>The network of all meal-plan companies in Miami: chef-prepared healthy meals delivered fresh, with easy payment, attractive interfaces and delivery tracking.</p>
             <p>Every company is reviewed, uses high-quality locally sourced ingredients, and menus change weekly so users never get bored.</p>`
    },
    spinu: {
      title: "SpinU", meta: "2017 · Social app", img: "assets/img/p-spinu.jpg",
      tags: ["Strategy", "Concept", "Web design", "Marketing"],
      html: `<p>Bored with the same old way of seeing pictures? SpinU is the social app that replaces likes with spins. Create “Spin Stories” from your photos with filters, blur and colored backgrounds, permanent or for 24 hours.</p>
             <ul><li>One-of-a-kind social media experience</li><li>Upload photos and create your own spin stories</li><li>Permanent or 1-day stories</li><li>Join friends and meet new people</li></ul><p><b>TRASH LIKES. SPIN YOUR LIFE.</b></p>`
    }
  };

  const cards = $$(".card");
  $$("#filters .filter").forEach((b) => b.addEventListener("click", () => {
    $$("#filters .filter").forEach((x) => x.classList.toggle("active", x === b));
    const f = b.dataset.f;
    cards.forEach((card) => card.classList.toggle("dim", f !== "all" && !card.dataset.cat.split(" ").includes(f)));
  }));

  cards.forEach((card) => {
    const vid = $("video", card);
    if (vid) {
      new IntersectionObserver(([en]) => (en.isIntersecting ? vid.play().catch(() => {}) : vid.pause()), { threshold: .3 }).observe(card);
    }
    if (finePointer && !reduced) {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(1000px) rotateY(${(x - .5) * 10}deg) rotateX(${(.5 - y) * 10}deg) translateY(-6px)`;
        card.style.setProperty("--gx", x * 100 + "%");
        card.style.setProperty("--gy", y * 100 + "%");
      });
      card.addEventListener("mouseleave", () => (card.style.transform = ""));
    }
    card.addEventListener("click", () => openModal(card.dataset.id));
  });

  const modal = $("#modal");
  function openModal(id) {
    const p = PROJECTS[id];
    if (!p) return;
    $("#mImg").src = p.img; $("#mImg").alt = p.title;
    $("#mTitle").textContent = p.title;
    $("#mMeta").textContent = p.meta;
    $("#mTags").innerHTML = p.tags.map((t) => `<span class="chip">${t}</span>`).join("");
    $("#mText").innerHTML = p.html;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    lenis && lenis.stop();
    $(".modal-close", modal).focus();
  }
  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    lenis && lenis.start();
  }
  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", closeModal));
  addEventListener("keydown", (e) => e.key === "Escape" && modal.classList.contains("open") && closeModal());

  /* ---------- services accordion ---------- */
  const svcs = $$(".svc");
  svcs.forEach((s) => {
    $(".svc-row", s).addEventListener("click", () => {
      const open = s.classList.contains("open");
      svcs.forEach((x) => x.classList.remove("open"));
      if (!open) s.classList.add("open");
      setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 650);
    });
  });

  /* ---------- process line ---------- */
  (function processLine() {
    const el = $("#processEl"), line = $("#processLine"), steps = $$(".step", el);
    const update = () => {
      const r = el.getBoundingClientRect();
      const k = Math.min(1, Math.max(0, (innerHeight * .75 - r.top) / (r.height * .9)));
      line.style.width = k * 100 + "%";
      steps.forEach((s, i) => s.classList.toggle("on", k >= i / steps.length + .05));
    };
    addEventListener("scroll", update, { passive: true });
    update();
  })();

  /* ---------- GSAP scroll extras ---------- */
  if (hasGsap && window.ScrollTrigger && !reduced) {
    gsap.to("#portrait img", { yPercent: -14, ease: "none", scrollTrigger: { trigger: "#portrait", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.to(".hero .wrap", { yPercent: 25, opacity: .2, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.from("#pulsePhone", { y: 120, rotate: -6, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: "#pulseStage", start: "top 75%" } });
    gsap.from(".float-shot.s1", { x: -120, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: "#pulseStage", start: "top 70%" } });
    gsap.from(".float-shot.s2", { x: 120, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: "#pulseStage", start: "top 70%" } });
    gsap.to(".marquee-track", { x: () => -200, ease: "none", scrollTrigger: { trigger: ".marquee", start: "top bottom", end: "bottom top", scrub: true } });
  }

  /* ---------- footer letters wave ---------- */
  (function footerWave() {
    const big = $("#footerBig");
    big.innerHTML = big.textContent.trim().split(/\s+/).map((w) => `<span class="word">${w.split("").map((ch) => `<span>${ch}</span>`).join("")}</span>`).join(" ");
    const letters = $$(".word span", big);
    if (!finePointer || reduced) return;
    big.addEventListener("mousemove", (e) => {
      letters.forEach((l) => {
        const r = l.getBoundingClientRect();
        const d = Math.abs(e.clientX - (r.left + r.width / 2));
        const lift = Math.max(0, 1 - d / 220);
        l.style.transform = `translateY(${-lift * 28}px) scale(${1 + lift * .12})`;
      });
    });
    big.addEventListener("mouseleave", () => letters.forEach((l) => (l.style.transform = "")));
  })();

  /* ---------- project brief builder ---------- */
  const brief = { type: [], needs: [], stage: [], time: [] };
  const outs = { type: "#sType", needs: "#sNeeds", stage: "#sStage", time: "#sTime" };
  const renderBrief = () => {
    Object.keys(brief).forEach((k) => ($(outs[k]).textContent = brief[k].length ? brief[k].join(", ") : "—"));
    const pct = Math.round((Object.values(brief).filter((v) => v.length).length / 4) * 100);
    $("#meter").style.width = pct + "%";
    $("#meterPct").textContent = pct + "%";
  };
  $$(".opts").forEach((group) => {
    const key = group.dataset.q, single = "single" in group.dataset;
    $$(".opt", group).forEach((o) => o.addEventListener("click", () => {
      if (single) {
        $$(".opt", group).forEach((x) => x !== o && x.classList.remove("on"));
      }
      o.classList.toggle("on");
      brief[key] = $$(".opt.on", group).map((x) => x.dataset.v);
      renderBrief();
    }));
  });
  // "Build an app like this" buttons preselect the brief
  $$("[data-preset]").forEach((b) => b.addEventListener("click", () => {
    const v = b.dataset.preset === "ai" ? "AI product" : "Mobile app";
    const opt = $(`.opts[data-q="type"] .opt[data-v="${v}"]`);
    if (opt && !opt.classList.contains("on")) opt.click();
  }));

  /* ---------- contact form ---------- */
  $("#contactForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, btn = $("#formBtn");
    if (f.elements._honey.value) return;
    let ok = true;
    ["name", "email", "message"].forEach((n) => {
      const el = f.elements[n];
      const bad = !el.value.trim() || (n === "email" && !/^\S+@\S+\.\S+$/.test(el.value));
      el.style.borderColor = bad ? "#ff5a7a" : "";
      if (bad) ok = false;
    });
    if (!ok) return;
    const v = (n) => f.elements[n].value.trim();
    const subject = `New project: ${brief.type[0] || "Let's talk"} — ${v("name")}`;
    const data = {
      name: v("name"), email: v("email"), company: v("company") || "-", message: v("message"),
      building: brief.type.join(", ") || "-", needs: brief.needs.join(", ") || "-",
      stage: brief.stage.join(", ") || "-", launch: brief.time.join(", ") || "-",
      _subject: subject, _replyto: v("email"), _template: "table", _captcha: "false"
    };
    const label = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "Sending…";
    try {
      const res = await fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || String(out.success) !== "true") throw new Error(out.message || res.status);
      f.reset();
      $("#formOk").style.display = "block";
      btn.innerHTML = "Sent ✓";
    } catch (err) {
      // never lose a lead: fall back to the visitor's email app
      const body = Object.entries(data).filter(([k]) => !k.startsWith("_")).map(([k, val]) => `${k}: ${val}`).join("\n");
      location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      btn.disabled = false;
      btn.innerHTML = label;
    }
  });

  /* ---------- 3D book ---------- */
  (function book() {
    const stage = $("#bookStage"), book = $("#book3d");
    if (!finePointer || reduced) return;
    stage.addEventListener("mousemove", (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      book.style.transform = `rotateY(${-28 + x * 40}deg) rotateX(${-y * 16}deg)`;
    });
    stage.addEventListener("mouseleave", () => (book.style.transform = ""));
  })();
})();
