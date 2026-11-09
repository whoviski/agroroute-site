(() => {
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  const ul = document.querySelector('#topnav ul');
  const burger = document.querySelector('.burger');
  burger.addEventListener('click', () => {
    const open = ul.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  ul.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      ul.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ul.classList.contains('open')) {
      ul.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  const sections = [...document.querySelectorAll('section[id]')];
  const links = [...ul.querySelectorAll('a')];
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        reveal.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach((node) => reveal.observe(node));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((section) => spy.observe(section));
  } else {
    document.querySelectorAll('.reveal').forEach((node) => node.classList.add('in'));
  }

  const bar = document.getElementById('progress');
  const paintBar = () => {
    const height = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (height > 0 ? Math.min(1, scrollY / height) : 0) + ')';
  };
  paintBar();
  addEventListener('scroll', paintBar, { passive: true });

  const lb = document.getElementById('lb');
  const lbImg = lb.querySelector('img');
  const lbText = lb.querySelector('p');
  const closeLb = () => { lb.hidden = true; lbImg.src = ''; };
  document.querySelectorAll('section img').forEach((img) => {
    img.addEventListener('click', () => {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbText.textContent = img.alt;
      lb.hidden = false;
    });
  });
  lb.addEventListener('click', (e) => { if (e.target !== lbImg) closeLb(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });

  const format = (value, digits) => value.toLocaleString('ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const runCounter = (el) => {
    const target = +el.dataset.to;
    const digits = +el.dataset.dec;
    const suffix = el.dataset.suf || '';
    if (rm) {
      el.textContent = format(target, digits) + suffix;
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / 1200);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = format(target * eased, digits) + suffix;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counters = document.querySelectorAll('[data-to]');
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    counters.forEach((node) => counterObserver.observe(node));
  } else {
    counters.forEach(runCounter);
  }

  document.querySelectorAll('.faq details').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      document.querySelectorAll('.faq details').forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  const parallaxOk = !rm && matchMedia('(min-width: 801px)').matches && !matchMedia('(pointer: coarse)').matches;
  if (parallaxOk) {
    const layers = [...document.querySelectorAll('[data-depth]')];
    const hero = document.querySelector('.hero');
    let mouseX = 0;
    let mouseY = 0;
    let queued = false;
    const paint = () => {
      queued = false;
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const y = scrollY;
      layers.forEach((layer) => {
        const depth = +layer.dataset.depth;
        layer.style.transform = 'translate3d(' + (mouseX * depth * 30) + 'px,' + (y * depth + mouseY * depth * 22) + 'px,0)';
      });
    };
    const requestPaint = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(paint);
    };
    addEventListener('scroll', requestPaint, { passive: true });
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      mouseY = (e.clientY - rect.top) / rect.height - 0.5;
      requestPaint();
    });
    requestPaint();
  }

  const canvas = document.getElementById('fx');
  if (canvas && !rm) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dots = [];
    const palette = ['rgba(255,255,255,.75)', 'rgba(250,204,21,.85)', 'rgba(167,243,208,.8)', 'rgba(125,211,252,.85)', 'rgba(244,114,182,.7)'];
    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      const count = Math.min(42, Math.max(12, width / 32 | 0));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2.2 + 0.8,
        c: palette[Math.random() * palette.length | 0],
      }));
    };
    resize();
    addEventListener('resize', resize);
    let visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }).observe(canvas);
    }
    const frame = () => {
      requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      ctx.clearRect(0, 0, width, height);
      for (const dot of dots) {
        dot.x = (dot.x + dot.vx + width) % width;
        dot.y = (dot.y + dot.vy + height) % height;
        ctx.fillStyle = dot.c;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, 7);
        ctx.fill();
      }
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i];
          const b = dots[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 110) {
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.22 * (1 - dist / 110)) + ')';
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    };
    requestAnimationFrame(frame);
  }

  const FIELD = [[78, 96], [230, 52], [470, 58], [650, 118], [702, 230], [648, 348], [430, 408], [190, 398], [62, 280]];
  const OBSTACLES = [{ x: 248, y: 178, r: 34 }, { x: 492, y: 262, r: 30 }];
  const svg = document.getElementById('field-svg');
  const fieldPath = document.getElementById('rd-field');
  const under = document.getElementById('rd-under');
  const route = document.getElementById('rd-route');
  const done = document.getElementById('rd-done');
  const obs = document.getElementById('rd-obs');
  const wps = document.getElementById('rd-wps');
  const start = document.getElementById('rd-start');
  const drone = document.getElementById('rd-drone');
  const course = document.getElementById('course');
  const courseOut = document.getElementById('course-out');
  const caption = document.getElementById('route-caption');
  const tabs = [...document.querySelectorAll('.flowline [role=tab]')];
  const captions = {
    field: 'Контур поля можно импортировать в форматах GeoJSON и KML.',
    route: 'Алгоритм строит параллельные гоны и упорядочивает их зигзагом.',
    mission: 'Маршрут привязывается к конкретному БАС и сроку работ.',
    monitor: 'Трек, оставшийся маршрут, телеметрия и предупреждения.',
  };
  let mode = 'route';
  let raf = 0;
  let played = false;

  const num = (n) => Math.round(n * 10) / 10;
  const point = (x, y) => ({ x, y });

  function chords(angle) {
    const rad = angle * Math.PI / 180;
    const dir = { x: Math.cos(rad), y: Math.sin(rad) };
    const normal = { x: -dir.y, y: dir.x };
    let min = Infinity;
    let max = -Infinity;
    FIELD.forEach((p) => {
      const t = p[0] * normal.x + p[1] * normal.y;
      if (t < min) min = t;
      if (t > max) max = t;
    });
    const step = 46;
    const list = [];
    for (let t = min + step * 0.62; t < max - step * 0.42; t += step) {
      const hits = [];
      for (let i = 0; i < FIELD.length; i++) {
        const a = FIELD[i];
        const b = FIELD[(i + 1) % FIELD.length];
        const ta = a[0] * normal.x + a[1] * normal.y;
        const tb = b[0] * normal.x + b[1] * normal.y;
        if ((ta - t) * (tb - t) > 0) continue;
        const delta = tb - ta;
        if (Math.abs(delta) < 1e-8) continue;
        const u = (t - ta) / delta;
        if (u < -1e-4 || u > 1 + 1e-4) continue;
        const x = a[0] + (b[0] - a[0]) * u;
        const y = a[1] + (b[1] - a[1]) * u;
        hits.push(point(x, y));
        hits[hits.length - 1].s = x * dir.x + y * dir.y;
      }
      hits.sort((a, b) => a.s - b.s);
      const uniq = [];
      hits.forEach((hit) => {
        if (!uniq.length || Math.hypot(hit.x - uniq[uniq.length - 1].x, hit.y - uniq[uniq.length - 1].y) > 1.5) uniq.push(hit);
      });
      if (uniq.length >= 2) list.push({ a: uniq[0], b: uniq[uniq.length - 1] });
    }
    return list;
  }

  function outside(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const blocked = [];
    OBSTACLES.forEach((c) => {
      const fx = a.x - c.x;
      const fy = a.y - c.y;
      const A = dx * dx + dy * dy;
      const B = 2 * (fx * dx + fy * dy);
      const C = fx * fx + fy * fy - c.r * c.r;
      const disc = B * B - 4 * A * C;
      if (disc <= 0 || A === 0) return;
      const root = Math.sqrt(disc);
      const t1 = Math.max(0, (-B - root) / (2 * A));
      const t2 = Math.min(1, (-B + root) / (2 * A));
      if (t2 - t1 > 0.008) blocked.push([t1, t2]);
    });
    blocked.sort((p, q) => p[0] - q[0]);
    const merged = [];
    blocked.forEach((span) => {
      if (!merged.length || span[0] > merged[merged.length - 1][1]) merged.push(span.slice());
      else merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], span[1]);
    });
    const at = (t) => point(a.x + dx * t, a.y + dy * t);
    const parts = [];
    let cursor = 0;
    merged.forEach(([t1, t2]) => {
      if (t1 > cursor + 0.012) parts.push([at(cursor), at(t1)]);
      cursor = t2;
    });
    if (cursor < 0.988) parts.push([at(cursor), at(1)]);
    return parts;
  }

  function buildRoute(angle) {
    let d = '';
    const turns = [];
    let begun = false;
    chords(angle).forEach((seg, index) => {
      const forward = index % 2 === 0;
      const parts = outside(forward ? seg.a : seg.b, forward ? seg.b : seg.a);
      if (!parts.length) return;
      if (!turns.length) turns.push(parts[0][0]);
      turns.push(parts[parts.length - 1][1]);
      parts.forEach((part, partIndex) => {
        const [p, q] = part;
        if (!begun) {
          d += 'M ' + num(p.x) + ' ' + num(p.y);
          begun = true;
        } else if (partIndex === 0) d += ' L ' + num(p.x) + ' ' + num(p.y);
        else d += ' M ' + num(p.x) + ' ' + num(p.y);
        d += ' L ' + num(q.x) + ' ' + num(q.y);
      });
    });
    return { d, turns };
  }

  function clearDash(el) {
    el.style.strokeDasharray = '';
    el.style.strokeDashoffset = '';
  }

  function moveDrone(dist, length) {
    const at = Math.max(0, Math.min(dist, Math.max(length - 0.01, 0)));
    const p = under.getPointAtLength(at);
    const p2 = under.getPointAtLength(Math.min(length, at + 8));
    const ang = Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI;
    drone.style.display = '';
    drone.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') rotate(' + (Number.isFinite(ang) ? ang : 0) + ') scale(1.8)');
  }

  function drawWaypoints(turns) {
    wps.replaceChildren();
    turns.forEach((p) => {
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', num(p.x));
      dot.setAttribute('cy', num(p.y));
      dot.setAttribute('r', '4');
      dot.setAttribute('class', 'wp');
      wps.appendChild(dot);
    });
  }

  function applyGeometry() {
    const built = buildRoute(+course.value);
    under.setAttribute('d', built.d);
    route.setAttribute('d', built.d);
    done.setAttribute('d', built.d);
    drawWaypoints(built.turns);
    if (built.turns[0]) start.setAttribute('transform', 'translate(' + built.turns[0].x + ' ' + built.turns[0].y + ')');
    return under.getTotalLength() || 1;
  }

  function styleUnder() {
    if (mode === 'monitor') {
      under.setAttribute('stroke', '#0369a1');
      under.setAttribute('stroke-width', '6');
      under.setAttribute('stroke-dasharray', '16 13');
      return;
    }
    under.setAttribute('stroke', '#c2410c');
    under.setAttribute('stroke-width', '8');
    under.removeAttribute('stroke-dasharray');
  }

  function slicePath(dist) {
    const len = under.getTotalLength() || 1;
    const end = Math.max(0, Math.min(dist, len));
    if (end < 1) return '';
    const steps = Math.max(2, Math.ceil(end / 12));
    let d = '';
    let prev = null;
    for (let i = 0; i <= steps; i++) {
      const p = under.getPointAtLength(end * i / steps);
      const jump = prev && Math.hypot(p.x - prev.x, p.y - prev.y) > 26;
      d += (!prev || jump ? 'M ' : 'L ') + num(p.x) + ' ' + num(p.y);
      prev = p;
    }
    return d;
  }

  function finish(length) {
    clearDash(under);
    clearDash(route);
    styleUnder();
    if (mode === 'field') {
      drone.style.display = 'none';
      return;
    }
    if (mode === 'monitor') {
      done.setAttribute('d', slicePath(length * 0.62));
      done.style.strokeDasharray = 'none';
      moveDrone(length * 0.62, length);
      return;
    }
    route.setAttribute('d', under.getAttribute('d'));
    done.style.strokeDasharray = '';
    moveDrone(length, length);
  }

  function play() {
    cancelAnimationFrame(raf);
    svg.dataset.mode = mode;
    const length = applyGeometry();
    const fieldLen = fieldPath.getTotalLength() || 1;
    if (rm) {
      clearDash(fieldPath);
      finish(length);
      return;
    }
    const t0 = performance.now();
    const dur = mode === 'field' ? 1600 : 3800;
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      if (mode === 'field') {
        fieldPath.style.strokeDasharray = String(fieldLen);
        fieldPath.style.strokeDashoffset = String(fieldLen * (1 - eased));
        drone.style.display = 'none';
      } else {
        clearDash(fieldPath);
        clearDash(under);
        clearDash(route);
        styleUnder();
        if (mode === 'monitor') {
          const at = length * 0.62 * eased;
          done.setAttribute('d', slicePath(at));
          done.style.strokeDasharray = 'none';
          moveDrone(Math.max(at, 1), length);
        } else {
          route.setAttribute('d', slicePath(length * eased));
          moveDrone(length * eased, length);
        }
      }
      if (k < 1) raf = requestAnimationFrame(tick);
      else finish(length);
    };
    raf = requestAnimationFrame(tick);
  }

  function setMode(next) {
    mode = next;
    tabs.forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.mode === next)));
    caption.textContent = captions[next];
    play();
  }

  fieldPath.setAttribute('d', 'M ' + FIELD.map((p) => p.join(' ')).join(' L ') + ' Z');
  OBSTACLES.forEach((c) => {
    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', c.x);
    circle.setAttribute('cy', c.y);
    circle.setAttribute('r', c.r);
    circle.setAttribute('class', 'obs');
    circle.setAttribute('fill', 'url(#rd-hatch)');
    circle.setAttribute('stroke', '#9a3412');
    circle.setAttribute('stroke-width', '2.4');
    obs.appendChild(circle);
  });
  tabs.forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.mode)));
  document.querySelector('.flowline').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    e.preventDefault();
    const next = tabs[(index + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    next.focus();
    setMode(next.dataset.mode);
  });
  course.addEventListener('input', () => {
    course.setAttribute('aria-valuenow', course.value);
    courseOut.textContent = course.value + '°';
    play();
  });
  document.getElementById('replay').addEventListener('click', play);

  svg.dataset.mode = mode;
  applyGeometry();
  if (rm) finish(under.getTotalLength() || 1);

  if ('IntersectionObserver' in window) {
    const demo = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || played) return;
      played = true;
      play();
      demo.disconnect();
    }, { threshold: 0.2 });
    demo.observe(document.getElementById('route-demo'));
  } else {
    play();
  }
})();
