/* ==========================================================================
   BÙI PHI HƯNG (Hunggw) — 3D SAPPHIRE RIBBON ENGINE & CORE UI (app-3d.js)
   - Sculptural 3D Metallic Ribbon + Floating 3D AI Depth Nodes on #hero3dCanvas
   - Dynamic Theme Lighting (Sapphire Blue default / Ice Cyan / Copper Gold)
   - Dossier Drawer, Lightbox, QR Modal & Bilingual VI/EN Switcher
   ========================================================================== */

(function () {
  'use strict';

  var docEl = document.documentElement;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Electric Sapphire Blue-Black 3D Metallic Ribbon & Studio Lighting Palette
  var THEMES = {
    sapphire: {
      glowInner: 'rgba(37, 99, 235, 0.24)',
      glowMid: 'rgba(56, 189, 248, 0.08)',
      baseR: 9, baseG: 15, baseB: 28,
      diffR: 28, diffG: 48, diffB: 82,
      foldR: 35, foldG: 135, foldB: 245,
      specR: 130, specG: 215, specB: 255,
      rimLeft: function (i) { return 'rgba(56, ' + Math.round(165 + i * 70) + ', 255, ' + (0.72 * i).toFixed(2) + ')'; },
      rimRight: function (i) { return 'rgba(37, 120, 235, ' + (0.42 * i).toFixed(2) + ')'; },
      edgeStrokeL: 'rgba(96, 195, 255, 0.85)',
      edgeShadowL: 'rgba(37, 99, 235, 0.90)',
      edgeStrokeR: 'rgba(186, 230, 253, 0.45)',
      edgeShadowR: 'rgba(56, 189, 248, 0.60)',
      particle: '56, 189, 248'
    }
  };

  var activeThemeKey = 'sapphire';

  /* ------------------------------------------------------------------------
     1. 3D SCULPTURAL METALLIC RIBBON + FLOATING AI NODES (#hero3dCanvas)
     ------------------------------------------------------------------------ */
  var canvas = document.getElementById('hero3dCanvas');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var width = 0;
    var height = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    var pointer = { tx: 0, ty: 0, cx: 0, cy: 0 };
    var startTime = performance.now();

    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    window.addEventListener('pointermove', function (e) {
      if (!width || !height) return;
      pointer.tx = (e.clientX / width - 0.5) * 2;
      pointer.ty = (e.clientY / height - 0.5) * 2;
    }, { passive: true });

    function rotX(p, a) {
      var c = Math.cos(a), s = Math.sin(a);
      return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
    }
    function rotY(p, a) {
      var c = Math.cos(a), s = Math.sin(a);
      return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
    }
    function sub(a, b) {
      return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    }
    function cross(a, b) {
      return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
      };
    }
    function norm(v) {
      var l = Math.hypot(v.x, v.y, v.z) || 1;
      return { x: v.x / l, y: v.y / l, z: v.z / l };
    }
    function dot(a, b) {
      return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    function catmullRom(p0, p1, p2, p3, t) {
      var t2 = t * t;
      var t3 = t2 * t;
      return {
        x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
        z: 0.5 * ((2 * p1.z) + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3),
        twist: p1.twist + (p2.twist - p1.twist) * t,
        w: p1.w + (p2.w - p1.w) * t
      };
    }

    var baseKnots = [
      { x: -120, y: -640, z: -220, twist: -0.55, w: 125 },
      { x: -10,  y: -430, z: -90,  twist: -0.38, w: 132 },
      { x: 350,  y: -75,  z: 145,  twist: 0.42,  w: 142 },
      { x: -95,  y: 165,  z: 35,   twist: -0.62, w: 135 },
      { x: 380,  y: 440,  z: 170,  twist: 0.35,  w: 152 },
      { x: 560,  y: 650,  z: 60,   twist: 0.50,  w: 148 }
    ];

    // Subtle 3D floating AI depth nodes around the ribbon
    var depthNodes = [];
    for (var d = 0; d < 22; d++) {
      depthNodes.push({
        x: (Math.random() - 0.35) * 900,
        y: (Math.random() - 0.5) * 820,
        z: (Math.random() - 0.5) * 420,
        r: 1.2 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.7
      });
    }

    function sampleRibbon(timeSec, rx, ry) {
      var samples = [];
      var segmentsPerSpan = 28;
      var numSpans = baseKnots.length - 3;

      for (var s = 0; s < numSpans; s++) {
        var k0 = baseKnots[s];
        var k1 = baseKnots[s + 1];
        var k2 = baseKnots[s + 2];
        var k3 = baseKnots[s + 3];

        for (var i = 0; i < segmentsPerSpan; i++) {
          if (s > 0 && i === 0) continue;
          var t = i / (segmentsPerSpan - 1);
          var pt = catmullRom(k0, k1, k2, k3, t);
          var u = (s + t) / numSpans;

          var wave = Math.sin(u * Math.PI * 2.4 - timeSec * 0.85) * 14;
          var twistWave = Math.cos(u * Math.PI * 2.0 + timeSec * 0.6) * 0.08;

          var pos = {
            x: pt.x + wave * 0.6,
            y: pt.y,
            z: pt.z + wave
          };

          pos = rotX(pos, rx);
          pos = rotY(pos, ry);

          samples.push({
            u: u,
            pos: pos,
            twist: pt.twist + twistWave,
            w: pt.w
          });
        }
      }
      return samples;
    }

    function project(p, cx, cy, fov) {
      var depth = fov + p.z;
      var scale = fov / Math.max(depth, 120);
      return {
        x: cx + p.x * scale,
        y: cy + p.y * scale,
        z: p.z,
        scale: scale
      };
    }

    function renderFrame(now) {
      var t = reducedMotion ? 0 : (now - startTime) * 0.001;
      var pal = THEMES[activeThemeKey] || THEMES.sapphire;

      pointer.cx += (pointer.tx - pointer.cx) * 0.055;
      pointer.cy += (pointer.ty - pointer.cy) * 0.055;

      ctx.clearRect(0, 0, width, height);

      var stageCenterX = width * (width < 768 ? 0.58 : 0.61);
      var stageCenterY = height * 0.50;
      var fov = Math.max(width, height) * 0.95;

      // Ambient studio backlight glow
      var bgGlow = ctx.createRadialGradient(
        stageCenterX + pointer.cx * 28,
        stageCenterY - height * 0.05 + pointer.cy * 22,
        20,
        stageCenterX,
        stageCenterY,
        Math.max(width, height) * 0.54
      );
      bgGlow.addColorStop(0, pal.glowInner);
      bgGlow.addColorStop(0.45, pal.glowMid);
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      var rx = -0.10 + pointer.cy * 0.11 + Math.sin(t * 0.45) * 0.025;
      var ry = -0.16 + pointer.cx * 0.14 + Math.cos(t * 0.38) * 0.03;

      // Draw subtle 3D AI depth particles behind & around the ribbon
      for (var d = 0; d < depthNodes.length; d++) {
        var dn = depthNodes[d];
        var dp = {
          x: dn.x + Math.sin(t * dn.speed + dn.phase) * 18,
          y: dn.y + Math.cos(t * dn.speed + dn.phase) * 18,
          z: dn.z
        };
        dp = rotX(dp, rx * 0.7);
        dp = rotY(dp, ry * 0.7);
        var projNode = project(dp, stageCenterX, stageCenterY, fov);
        var alpha = (0.18 + 0.22 * Math.sin(t * 1.5 + dn.phase)) * Math.min(1, projNode.scale);
        ctx.beginPath();
        ctx.arc(projNode.x, projNode.y, dn.r * projNode.scale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + pal.particle + ', ' + alpha.toFixed(2) + ')';
        ctx.fill();
      }

      var pts = sampleRibbon(t, rx, ry);

      var leftRail = [];
      var rightRail = [];
      var leftBevel = [];
      var rightBevel = [];
      var normals = [];

      for (var i = 0; i < pts.length; i++) {
        var prev = pts[Math.max(0, i - 1)].pos;
        var next = pts[Math.min(pts.length - 1, i + 1)].pos;
        var tang = norm(sub(next, prev));

        var up = { x: 0, y: 0, z: 1 };
        var side = norm(cross(tang, up));
        var faceN = norm(cross(side, tang));

        var tw = pts[i].twist;
        var cosT = Math.cos(tw), sinT = Math.sin(tw);
        var binorm = {
          x: side.x * cosT + faceN.x * sinT,
          y: side.y * cosT + faceN.y * sinT,
          z: side.z * cosT + faceN.z * sinT
        };
        var surfNormal = norm(cross(tang, binorm));
        normals.push(surfNormal);

        var halfW = pts[i].w * (width < 768 ? 0.68 : 1.0);
        var thick = 11.5;

        var p = pts[i].pos;
        var lPos = {
          x: p.x - binorm.x * halfW,
          y: p.y - binorm.y * halfW,
          z: p.z - binorm.z * halfW
        };
        var rPos = {
          x: p.x + binorm.x * halfW,
          y: p.y + binorm.y * halfW,
          z: p.z + binorm.z * halfW
        };
        var lBev = {
          x: lPos.x - surfNormal.x * thick,
          y: lPos.y - surfNormal.y * thick,
          z: lPos.z - surfNormal.z * thick
        };
        var rBev = {
          x: rPos.x - surfNormal.x * thick,
          y: rPos.y - surfNormal.y * thick,
          z: rPos.z - surfNormal.z * thick
        };

        leftRail.push(project(lPos, stageCenterX, stageCenterY, fov));
        rightRail.push(project(rPos, stageCenterX, stageCenterY, fov));
        leftBevel.push(project(lBev, stageCenterX, stageCenterY, fov));
        rightBevel.push(project(rBev, stageCenterX, stageCenterY, fov));
      }

      var keyLight = norm({
        x: 0.78 + pointer.cx * 0.25,
        y: -0.22 + pointer.cy * 0.20,
        z: 0.58
      });
      var foldLight = norm({
        x: 0.92,
        y: 0.15,
        z: 0.35
      });

      var quads = [];
      for (var q = 0; q < pts.length - 1; q++) {
        var avgZ = 0.5 * (pts[q].pos.z + pts[q + 1].pos.z);
        quads.push({ idx: q, z: avgZ });
      }
      quads.sort(function (a, b) { return a.z - b.z; });

      for (var k = 0; k < quads.length; k++) {
        var idx = quads[k].idx;
        var l0 = leftRail[idx], l1 = leftRail[idx + 1];
        var r0 = rightRail[idx], r1 = rightRail[idx + 1];
        var lb0 = leftBevel[idx], lb1 = leftBevel[idx + 1];
        var rb0 = rightBevel[idx], rb1 = rightBevel[idx + 1];
        var n = normals[idx];
        var uPos = pts[idx].u;

        var ndotl = Math.max(0, dot(n, keyLight));
        var ndotw = Math.max(0, Math.abs(dot(n, foldLight)));
        var spec = Math.pow(ndotl, 9);
        var foldProximity =
          Math.exp(-Math.pow((uPos - 0.34) / 0.11, 2)) +
          Math.exp(-Math.pow((uPos - 0.66) / 0.12, 2)) +
          Math.exp(-Math.pow((uPos - 0.86) / 0.13, 2));
        foldProximity = Math.min(1, foldProximity);

        var rCol = Math.round(pal.baseR + ndotl * pal.diffR + foldProximity * pal.foldR * Math.pow(ndotw, 2.1) + spec * pal.specR);
        var gCol = Math.round(pal.baseG + ndotl * pal.diffG + foldProximity * pal.foldG * Math.pow(ndotw, 2.2) + spec * pal.specG);
        var bCol = Math.round(pal.baseB + ndotl * pal.diffB + foldProximity * pal.foldB * Math.pow(ndotw, 2.0) + spec * pal.specB);

        rCol = Math.min(255, rCol);
        gCol = Math.min(255, gCol);
        bCol = Math.min(255, bCol);

        var grad = ctx.createLinearGradient(l0.x, l0.y, r0.x, r0.y);
        grad.addColorStop(0, 'rgb(' + Math.min(255, rCol + 20) + ',' + Math.min(255, gCol + 26) + ',' + Math.min(255, bCol + 34) + ')');
        grad.addColorStop(0.5, 'rgb(' + rCol + ',' + gCol + ',' + bCol + ')');
        grad.addColorStop(1, 'rgb(' + Math.max(4, Math.round(rCol * 0.52)) + ',' + Math.max(6, Math.round(gCol * 0.52)) + ',' + Math.max(12, Math.round(bCol * 0.56)) + ')');

        ctx.beginPath();
        ctx.moveTo(l0.x, l0.y);
        ctx.lineTo(r0.x, r0.y);
        ctx.lineTo(r1.x, r1.y);
        ctx.lineTo(l1.x, l1.y);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.9;
        ctx.stroke();

        var rimIntensity = 0.45 + 0.55 * foldProximity;

        // Left glowing beveled edge
        ctx.beginPath();
        ctx.moveTo(l0.x, l0.y);
        ctx.lineTo(l1.x, l1.y);
        ctx.lineTo(lb1.x, lb1.y);
        ctx.lineTo(lb0.x, lb0.y);
        ctx.closePath();
        ctx.fillStyle = pal.rimLeft(rimIntensity);
        ctx.fill();

        // Right beveled edge
        ctx.beginPath();
        ctx.moveTo(r0.x, r0.y);
        ctx.lineTo(r1.x, r1.y);
        ctx.lineTo(rb1.x, rb1.y);
        ctx.lineTo(rb0.x, rb0.y);
        ctx.closePath();
        ctx.fillStyle = pal.rimRight(rimIntensity);
        ctx.fill();
      }

      // Specular highlight strokes along the ribbon edges
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      for (var e = 0; e < leftRail.length; e++) {
        if (e === 0) ctx.moveTo(leftRail[e].x, leftRail[e].y);
        else ctx.lineTo(leftRail[e].x, leftRail[e].y);
      }
      ctx.strokeStyle = pal.edgeStrokeL;
      ctx.lineWidth = 2.1;
      ctx.shadowColor = pal.edgeShadowL;
      ctx.shadowBlur = 15;
      ctx.stroke();

      ctx.beginPath();
      for (var r = 0; r < rightRail.length; r++) {
        if (r === 0) ctx.moveTo(rightRail[r].x, rightRail[r].y);
        else ctx.lineTo(rightRail[r].x, rightRail[r].y);
      }
      ctx.strokeStyle = pal.edgeStrokeR;
      ctx.lineWidth = 1.4;
      ctx.shadowColor = pal.edgeShadowR;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();

      if (!reducedMotion) {
        requestAnimationFrame(renderFrame);
      }
    }

    requestAnimationFrame(renderFrame);
  }

  /* ------------------------------------------------------------------------
     2. DOSSIER DRAWER, SECTION JUMP, LIGHTBOX, QR MODAL & LANGUAGE SWITCHER
     ------------------------------------------------------------------------ */
  var dossier = document.getElementById('dossier');
  var closeBtn = document.getElementById('dossierClose');
  var printCvBtn = document.getElementById('printCvBtn');
  var openQrModalBtn = document.getElementById('openQrModalBtn');
  var qrModal = document.getElementById('qrModal');
  var qrModalClose = document.getElementById('qrModalClose');
  var qrModalImg = document.getElementById('qrModalImg');
  var qrModalUrlInput = document.getElementById('qrModalUrlInput');
  var qrCopyUrlBtn = document.getElementById('qrCopyUrlBtn');
  var qrOpenDirectBtn = document.getElementById('qrOpenDirectBtn');
  var langBtn = document.getElementById('langBtn');
  var wfLightbox = document.getElementById('wfLightbox');
  var wfLightboxClose = document.getElementById('wfLightboxClose');

  var openWfBtns = [
    document.getElementById('openWorkflowLightboxBtn'),
    document.getElementById('zoomWfBtn2'),
    document.getElementById('wfImgWrap')
  ];

  window.__currentLang = 'vi';

  function toggleDossier(open, targetId) {
    if (!dossier) return;
    var isOpen = typeof open === 'boolean' ? open : !dossier.classList.contains('is-open');
    dossier.classList.toggle('is-open', isOpen);
    dossier.setAttribute('aria-hidden', isOpen ? 'false' : 'true');

    if (isOpen && typeof window.__animateDossierKPIs === 'function') {
      window.__animateDossierKPIs();
    }

    if (isOpen && targetId) {
      var el = document.getElementById(targetId);
      if (el) {
        setTimeout(function () {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 180);
      }
    }
  }

  window.__openPortfolioDossier = toggleDossier;

  var triggers = document.querySelectorAll('[data-open-dossier], [data-target]');
  for (var i = 0; i < triggers.length; i++) {
    triggers[i].addEventListener('click', function (e) {
      var target = this.getAttribute('data-target');
      if (this.tagName === 'A' && this.getAttribute('href') && this.getAttribute('href').charAt(0) === '#') {
        e.preventDefault();
      }
      toggleDossier(true, target || null);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      toggleDossier(false);
    });
  }
  if (printCvBtn) {
    printCvBtn.addEventListener('click', function () {
      window.print();
    });
  }
  if (dossier) {
    dossier.addEventListener('click', function (e) {
      if (e.target === dossier) toggleDossier(false);
    });
  }

  var wfLightboxImg = wfLightbox ? wfLightbox.querySelector('img') : null;
  var defaultWfSrc = wfLightboxImg ? wfLightboxImg.getAttribute('src') : '';
  var avatarImg = document.querySelector('.dossier__avatar');

  function toggleLightbox(open, customSrc) {
    if (!wfLightbox) return;
    var isOpen = typeof open === 'boolean' ? open : !wfLightbox.classList.contains('is-active');
    if (isOpen && wfLightboxImg) {
      wfLightboxImg.setAttribute('src', customSrc || defaultWfSrc);
    }
    wfLightbox.classList.toggle('is-active', isOpen);
    wfLightbox.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  }

  if (avatarImg) {
    avatarImg.addEventListener('click', function () {
      toggleLightbox(true, avatarImg.getAttribute('src'));
    });
  }

  openWfBtns.forEach(function (btn) {
    if (btn) {
      btn.addEventListener('click', function () {
        toggleLightbox(true, defaultWfSrc);
      });
    }
  });
  if (wfLightboxClose) {
    wfLightboxClose.addEventListener('click', function () {
      toggleLightbox(false);
    });
  }
  if (wfLightbox) {
    wfLightbox.addEventListener('click', function (e) {
      if (e.target === wfLightbox) toggleLightbox(false);
    });
  }

  function isPublicWebHost(hostname) {
    if (!hostname) return false;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return false;
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname)) return false;
    return true;
  }

  function getShareablePhoneUrl() {
    var loc = window.location;
    // 1. If hosted on a public web domain (GitHub Pages, Vercel, Netlify, Custom Domain, etc.), automatically use the live public URL
    if ((loc.protocol === 'https:' || loc.protocol === 'http:') && isPublicWebHost(loc.hostname)) {
      return loc.href.split('#')[0];
    }
    // 2. If user entered/saved a custom public web URL
    try {
      var saved = localStorage.getItem('hunggw_public_url');
      if (saved && saved.trim()) return saved.trim();
    } catch (e) {}
    // 3. Default to the official GitHub Pages public URL so 4G/5G/Wi-Fi QR scanning works anywhere
    return 'https://hngxkyz.github.io/PortfolioCV-Hunggw/';
  }

  function renderQrFromUrl(urlStr) {
    var cleanUrl = (urlStr || '').trim() || getShareablePhoneUrl();
    if (qrModalImg) {
      qrModalImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=4&data=' + encodeURIComponent(cleanUrl);
    }
  }

  function toggleQrModal(open) {
    if (!qrModal) return;
    var isOpen = typeof open === 'boolean' ? open : !qrModal.classList.contains('is-active');
    if (isOpen) {
      var shareUrl = (qrModalUrlInput && qrModalUrlInput.value.trim()) ? qrModalUrlInput.value.trim() : getShareablePhoneUrl();
      if (qrModalUrlInput) {
        qrModalUrlInput.value = shareUrl;
      }
      renderQrFromUrl(shareUrl);
    }
    qrModal.classList.toggle('is-active', isOpen);
    qrModal.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  }

  if (qrModalUrlInput) {
    qrModalUrlInput.addEventListener('input', function () {
      var val = this.value.trim();
      if (val) {
        renderQrFromUrl(val);
        try {
          if (!isPublicWebHost(window.location.hostname)) {
            localStorage.setItem('hunggw_public_url', val);
          }
        } catch (e) {}
      }
    });
  }

  if (openQrModalBtn) {
    openQrModalBtn.addEventListener('click', function () {
      toggleQrModal(true);
    });
  }
  if (qrModalClose) {
    qrModalClose.addEventListener('click', function () {
      toggleQrModal(false);
    });
  }
  if (qrModal) {
    qrModal.addEventListener('click', function (e) {
      if (e.target === qrModal) toggleQrModal(false);
    });
  }
  if (qrOpenDirectBtn) {
    qrOpenDirectBtn.addEventListener('click', function () {
      var urlToOpen = (qrModalUrlInput && qrModalUrlInput.value.trim()) ? qrModalUrlInput.value.trim() : getShareablePhoneUrl();
      window.open(urlToOpen, '_blank', 'noopener');
    });
  }

  var copyBtns = [
    document.getElementById('copyContactBtn'),
    document.getElementById('heroCopyBtn')
  ];
  var copyToast = document.getElementById('copyToast');
  var toastTimer = null;

  function showToast() {
    if (!copyToast) return;
    copyToast.classList.add('is-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      copyToast.classList.remove('is-visible');
    }, 2600);
  }

  function fallbackCopy(text, onDone) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (err) {}
    document.body.removeChild(ta);
    if (onDone) onDone();
  }

  function copyTextToClipboard(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone).catch(function () {
        fallbackCopy(text, onDone);
      });
    } else {
      fallbackCopy(text, onDone);
    }
  }

  copyBtns.forEach(function (btn) {
    if (btn) {
      btn.addEventListener('click', function () {
        copyTextToClipboard('buiphihung2004@gmail.com | 0385620608', showToast);
      });
    }
  });

  if (qrCopyUrlBtn) {
    qrCopyUrlBtn.addEventListener('click', function () {
      var urlToCopy = (qrModalUrlInput && qrModalUrlInput.value.trim()) ? qrModalUrlInput.value.trim() : getShareablePhoneUrl();
      copyTextToClipboard(urlToCopy, showToast);
    });
  }

  if (langBtn) {
    langBtn.addEventListener('click', function () {
      window.__currentLang = window.__currentLang === 'vi' ? 'en' : 'vi';
      var lang = window.__currentLang;
      langBtn.textContent = lang === 'vi' ? 'VI / EN' : 'EN / VI';
      docEl.setAttribute('lang', lang);

      var textNodes = document.querySelectorAll('[data-vi][data-en]');
      for (var j = 0; j < textNodes.length; j++) {
        textNodes[j].textContent = textNodes[j].getAttribute('data-' + lang);
      }

      var htmlNodes = document.querySelectorAll('[data-vi-html][data-en-html]');
      for (var h = 0; h < htmlNodes.length; h++) {
        htmlNodes[h].innerHTML = htmlNodes[h].getAttribute('data-' + lang + '-html');
      }

      var placeNodes = document.querySelectorAll('[data-vi-placeholder][data-en-placeholder]');
      for (var p = 0; p < placeNodes.length; p++) {
        placeNodes[p].setAttribute('placeholder', placeNodes[p].getAttribute('data-' + lang + '-placeholder'));
      }
    });
  }
})();
