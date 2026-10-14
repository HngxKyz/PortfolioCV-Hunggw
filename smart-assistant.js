/* ==========================================================================
   BÙI PHI HƯNG (Hunggw) — SMART PORTFOLIO AI ENGINE (smart-assistant.js)
   1. AI Command Palette & Recruiter Q&A Assistant (Ctrl+K / Streaming Reply)
   2. Live Interactive Google FlowNodes Pipeline Simulator
   3. Animated KPI Number Counters & Sticky Reading Progress Bar
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. STICKY READING PROGRESS BAR & ANIMATED KPI COUNTERS
     ------------------------------------------------------------------------ */
  var dossierPanel = document.getElementById('dossierPanel');
  var progressBar = document.getElementById('dossierProgressBar');

  if (dossierPanel && progressBar) {
    dossierPanel.addEventListener('scroll', function () {
      var scrollTop = dossierPanel.scrollTop;
      var maxScroll = dossierPanel.scrollHeight - dossierPanel.clientHeight;
      var pct = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)) : 0;
      progressBar.style.width = pct.toFixed(1) + '%';
    }, { passive: true });
  }

  var kpiAnimatedOnce = false;
  window.__animateDossierKPIs = function () {
    if (kpiAnimatedOnce) return;
    kpiAnimatedOnce = true;

    var counters = document.querySelectorAll('[data-kpi-target]');
    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-kpi-target') || '0');
      var prefix = el.getAttribute('data-kpi-prefix') || '';
      var suffix = el.getAttribute('data-kpi-suffix') || '';
      var formatType = el.getAttribute('data-kpi-format') || 'int';
      var duration = 1150;
      var start = performance.now();

      function tick(now) {
        var elapsed = now - start;
        var p = Math.min(1, elapsed / duration);
        var ease = 1 - Math.pow(1 - p, 3); // Cubic ease-out
        var val = Math.round(target * ease);

        if (formatType === 'million') {
          el.textContent = prefix + val.toLocaleString('vi-VN') + suffix;
        } else {
          el.textContent = prefix + val + suffix;
        }

        if (p < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = el.getAttribute('data-kpi-final') || (prefix + target + suffix);
        }
      }

      requestAnimationFrame(tick);
    });
  };

  /* ------------------------------------------------------------------------
     3. LIVE INTERACTIVE GOOGLE FLOWNODES PIPELINE SIMULATOR
     ------------------------------------------------------------------------ */
  var runPipelineBtn = document.getElementById('runPipelineBtn');
  var flowNodes = document.querySelectorAll('.flow-node');
  var flowConsoleLog = document.getElementById('flowConsoleLog');
  var flowConsoleTime = document.getElementById('flowConsoleTime');
  var isSimRunning = false;

  var simSteps = [
    {
      vi: '[Node 01] Đang phân tích kịch bản & tối ưu Hook 3 giây đầu (Retention Rate)...',
      en: '[Node 01] Parsing script & optimizing 3-second Hook (Retention Rate)...',
      ms: '140ms'
    },
    {
      vi: '[Node 02] Đang khóa đồng bộ nhân vật AI, sản phẩm FMCG & bối cảnh nhà xưởng...',
      en: '[Node 02] Locking character consistency, FMCG product & factory backdrop...',
      ms: '320ms'
    },
    {
      vi: '[Node 03] Đang tổng hợp Voice AI, nhịp thoại & lồng ghép hiệu ứng âm thanh SFX...',
      en: '[Node 03] Synthesizing AI voiceover pacing & multi-track SFX audio...',
      ms: '510ms'
    },
    {
      vi: '[Node 04] Hoàn tất xuất hàng loạt (Batch Render): 10 Video 9:16 sẵn sàng đăng @giagiataixuong!',
      en: '[Node 04] Batch Render complete: 10 vertical 9:16 videos ready for @giagiataixuong!',
      ms: 'DONE · 8–10 Video/Ngày'
    }
  ];

  if (runPipelineBtn && flowNodes.length) {
    runPipelineBtn.addEventListener('click', function () {
      if (isSimRunning) return;
      isSimRunning = true;
      runPipelineBtn.classList.add('is-running');

      var lang = window.__currentLang || 'vi';
      var btnSpan = runPipelineBtn.querySelector('span');
      if (btnSpan) {
        btnSpan.textContent = lang === 'vi' ? 'Đang chạy luồng AI...' : 'Running AI Pipeline...';
      }

      // Reset all nodes
      for (var i = 0; i < flowNodes.length; i++) {
        flowNodes[i].classList.remove('is-active', 'is-done');
        var st = flowNodes[i].querySelector('.flow-node__status');
        if (st) st.textContent = 'QUEUED';
      }

      var currentStep = 0;

      function nextStep() {
        if (currentStep > 0 && flowNodes[currentStep - 1]) {
          flowNodes[currentStep - 1].classList.remove('is-active');
          flowNodes[currentStep - 1].classList.add('is-done');
          var prevSt = flowNodes[currentStep - 1].querySelector('.flow-node__status');
          if (prevSt) prevSt.textContent = 'DONE ✓';
        }

        if (currentStep < flowNodes.length) {
          var node = flowNodes[currentStep];
          node.classList.add('is-active');
          var curSt = node.querySelector('.flow-node__status');
          if (curSt) curSt.textContent = 'RUNNING';

          var stepInfo = simSteps[currentStep];
          var curLang = window.__currentLang || 'vi';
          if (flowConsoleLog) flowConsoleLog.textContent = stepInfo[curLang];
          if (flowConsoleTime) flowConsoleTime.textContent = stepInfo.ms;

          currentStep++;
          setTimeout(nextStep, 680);
        } else {
          isSimRunning = false;
          runPipelineBtn.classList.remove('is-running');
          var curLangEnd = window.__currentLang || 'vi';
          if (btnSpan) {
            btnSpan.textContent = curLangEnd === 'vi' ? 'Chạy lại mô phỏng AI' : 'Re-run AI Simulation';
          }
        }
      }

      nextStep();
    });
  }

  /* ------------------------------------------------------------------------
     4. SMART AI RECRUITER ASSISTANT & COMMAND PALETTE (Ctrl + K)
     ------------------------------------------------------------------------ */
  var cmdModal = document.getElementById('cmdModal');
  var openCmdBtn = document.getElementById('openCmdBtn');
  var closeCmdBtn = document.getElementById('closeCmdBtn');
  var cmdInput = document.getElementById('cmdInput');
  var cmdAnswerText = document.getElementById('cmdAnswerText');
  var cmdJumpBtn = document.getElementById('cmdJumpBtn');
  var promptBtns = document.querySelectorAll('[data-ai-topic]');
  var typingTimer = null;

  var KNOWLEDGE_BASE = {
    kpi: {
      target: 'sec-experience',
      vi: '• Khả năng chịu áp lực sản lượng cao: Độc lập cam kết KPI 8–10 Video AI hoàn chỉnh/ngày (khi làm thuần AI) hoặc chạy song song 5 Video AI + 10–15 Video Oneshot + 5 Kịch bản mới/ngày.\n• Tốc độ và chất lượng hậu kỳ đã đạt chuẩn nhân sự Quay dựng chính thức ngay trong thời gian Intern (được duyệt đặc cách lên Chính thức sớm theo mã đơn REQ-20260916-174).',
      en: '• High-Volume Resilience: Independently delivers 8–10 full AI videos/day or 5 AI videos + 10–15 Oneshots + 5 new scripts/day.\n• Post-production speed and quality matched full-time senior producers during internship (approved for early promotion via REQ-20260916-174).'
    },
    viral: {
      target: 'sec-showreel',
      vi: '• Case 01 — Video Viral 1.000.000+ views (@giagia.vietnam): Ứng dụng tư duy kể chuyện (Storytelling) mở nút thắt 3 giây đầu tối ưu Retention Rate, kéo phễu Livestream đạt đỉnh ~200 triệu VNĐ/ngày.\n• Case 02 — Storytelling Bắt Trend & VJ Tình huống (@giagia.vietnam): Nghiên cứu nhanh trend đang lên, khéo léo lồng ghép USP sản phẩm vào mạch truyện đời thường đạt 50K–200K+ views.\n• Case 03 — Sản phẩm Phim AI Đầu tay (@giagiataixuong): Tự biên kịch & đạo diễn trọn gói bằng tổ hợp công cụ AI.',
      en: '• Case 01 — 1,000,000+ Views Viral Hit (@giagia.vietnam): 3-second storytelling hook driving ~200M VND peak single-day Livestream GMV.\n• Case 02 — Trend Storytelling & Situational VJ (@giagia.vietnam): Rapid trend adaptation woven naturally into product narratives (50K–200K+ views).\n• Case 03 — Debut AI Short Film (@giagiataixuong): End-to-end AI filmmaking.'
    },
    workflow: {
      target: 'sec-workflow',
      vi: '• Làm chủ hầu hết các công cụ AI hiện nay (AI Video Gen, khóa đồng bộ nhân vật/sản phẩm, Voice AI/SFX, ChatGPT, Claude, Gemini) để sản xuất cả Phim ngắn AI lẫn Video TMĐT.\n• Tự nghiên cứu tài liệu kỹ thuật để thiết kế luồng tự động hóa Google Flow (FlowNodes) + ReactFlow, thực hiện sản phẩm Phim AI đầu tay và vực dậy kênh @giagiataixuong từ 0 đơn lên có đơn hàng thực tế mỗi ngày.',
      en: '• Proficient across almost all modern AI tools (Video Gen, character/product lock, AI Voice/SFX, LLMs) to produce both AI Short Films and commercial E-Commerce videos.\n• Self-built Google Flow (FlowNodes) + ReactFlow pipeline powering the debut AI Short Film and scaling @giagiataixuong from 0 to daily orders.'
    },
    objectives: {
      target: 'sec-objectives',
      vi: '• 4 Thế mạnh cốt lõi: Làm chủ hầu hết công cụ AI & làm Phim AI · Tư duy kể chuyện (Storytelling) & bắt trend nhanh vào sản phẩm · Chịu áp lực sản lượng cao (15–20 video/ngày) · Tự mày mò hệ thống & xây dựng quan hệ chất lượng.\n• 4 Mục tiêu: (1) Tạo doanh thu, lợi nhuận & giá trị thương hiệu thực chất; (2) Gia tăng giá trị & thu nhập tương xứng kết quả; (3) Làm chủ Media/TikTok Shop tiến tới Omnichannel; (4) Mở rộng mạng lưới quan hệ uy tín trong ngành TMĐT.',
      en: '• 4 Core Strengths: Full AI toolstack & AI Filmmaking · Storytelling mindset & rapid trend-to-product fit · High-pressure output (15–20 videos/day) · Self-taught R&D & quality industry networking.\n• 4 Career Goals: Drive real GMV & brand equity, merit-based growth, TikTok Shop to Omnichannel mastery, and lasting E-Commerce relationships.'
    },
    skills: {
      target: 'sec-skills',
      vi: '• Độc lập trọn gói (All-in-One): Cử nhân Hệ thống Thông tin (2022–2026) + Làm chủ hệ sinh thái AI Tools & sản xuất Phim AI (Google Flow, ReactFlow, LLM, Video/Image/Voice AI) + Tư duy kể chuyện (Storytelling), nghiên cứu trend nhanh & làm VJ/Diễn xuất + Quay dựng Premiere Pro / CapCut PC + Vận hành TikTok Shop & Shopee Seller Center.',
      en: '• True All-in-One Producer: B.S. in Information Systems + Full AI Toolstack & AI Filmmaking (Google Flow, ReactFlow, Video/Image/Voice AI, LLMs) + Storytelling, Rapid Trend Adaptation & On-Camera VJ + Premiere Pro/CapCut PC Editing + TikTok Shop & Shopee Store Operations.'
    },
    contact: {
      target: 'sec-tiktok',
      vi: '• Điện thoại / Zalo: 0385 620 608\n• Email: buiphihung2004@gmail.com\n• Địa chỉ: Trần Cung, Hà Nội\n• Kênh TikTok thực chiến: @giagia.vietnam & @giagiataixuong\n• Hưng sẵn sàng nhận dự án Freelance (Phim AI, Video AI, Quay dựng, Thiết kế Workflow, Website TMĐT) và cơ hội Full-time!',
      en: '• Phone / Zalo: 0385 620 608\n• Email: buiphihung2004@gmail.com\n• Location: Tran Cung, Hanoi\n• TikTok Channels: @giagia.vietnam & @giagiataixuong\n• Available immediately for Freelance projects and Full-time roles!'
    }
  };

  function streamAnswer(topicKey) {
    var item = KNOWLEDGE_BASE[topicKey] || KNOWLEDGE_BASE.objectives;
    var lang = window.__currentLang || 'vi';
    var fullText = item[lang];

    if (typingTimer) clearInterval(typingTimer);
    if (!cmdAnswerText) return;

    cmdAnswerText.textContent = '';
    if (cmdJumpBtn) {
      cmdJumpBtn.setAttribute('data-jump-section', item.target);
    }

    var idx = 0;
    typingTimer = setInterval(function () {
      idx += 3;
      cmdAnswerText.textContent = fullText.slice(0, idx);
      if (idx >= fullText.length) {
        clearInterval(typingTimer);
      }
    }, 12);
  }

  function matchNaturalQuery(q) {
    var s = (q || '').toLowerCase();
    if (s.indexOf('kpi') !== -1 || s.indexOf('áp lực') !== -1 || s.indexOf('số lượng') !== -1 || s.indexOf('ngày') !== -1 || s.indexOf('pressure') !== -1) {
      return 'kpi';
    }
    if (s.indexOf('view') !== -1 || s.indexOf('triệu') !== -1 || s.indexOf('200') !== -1 || s.indexOf('live') !== -1 || s.indexOf('doanh thu') !== -1 || s.indexOf('viral') !== -1 || s.indexOf('case') !== -1 || s.indexOf('trend') !== -1 || s.indexOf('kể chuyện') !== -1 || s.indexOf('story') !== -1) {
      return 'viral';
    }
    if (s.indexOf('flow') !== -1 || s.indexOf('phim') !== -1 || s.indexOf('film') !== -1 || s.indexOf('ai') !== -1 || s.indexOf('tool') !== -1 || s.indexOf('tự động') !== -1 || s.indexOf('giagia') !== -1) {
      return 'workflow';
    }
    if (s.indexOf('mục tiêu') !== -1 || s.indexOf('điểm mạnh') !== -1 || s.indexOf('quan hệ') !== -1 || s.indexOf('học hỏi') !== -1 || s.indexOf('goal') !== -1) {
      return 'objectives';
    }
    if (s.indexOf('liên hệ') !== -1 || s.indexOf('sđt') !== -1 || s.indexOf('zalo') !== -1 || s.indexOf('email') !== -1 || s.indexOf('thuê') !== -1 || s.indexOf('contact') !== -1) {
      return 'contact';
    }
    return 'skills';
  }

  function toggleCmdModal(open) {
    if (!cmdModal) return;
    var isOpen = typeof open === 'boolean' ? open : !cmdModal.classList.contains('is-active');
    cmdModal.classList.toggle('is-active', isOpen);
    cmdModal.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    if (isOpen && cmdInput) {
      setTimeout(function () { cmdInput.focus(); }, 80);
    }
  }

  if (openCmdBtn) {
    openCmdBtn.addEventListener('click', function () {
      toggleCmdModal(true);
    });
  }
  if (closeCmdBtn) {
    closeCmdBtn.addEventListener('click', function () {
      toggleCmdModal(false);
    });
  }
  if (cmdModal) {
    cmdModal.addEventListener('click', function (e) {
      if (e.target === cmdModal) toggleCmdModal(false);
    });
  }

  for (var p = 0; p < promptBtns.length; p++) {
    promptBtns[p].addEventListener('click', function () {
      var topic = this.getAttribute('data-ai-topic');
      streamAnswer(topic);
    });
  }

  if (cmdInput) {
    cmdInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && this.value.trim()) {
        var matched = matchNaturalQuery(this.value.trim());
        streamAnswer(matched);
      }
    });
  }

  if (cmdJumpBtn) {
    cmdJumpBtn.addEventListener('click', function () {
      var targetSec = this.getAttribute('data-jump-section') || 'sec-objectives';
      toggleCmdModal(false);
      if (typeof window.__openPortfolioDossier === 'function') {
        window.__openPortfolioDossier(true, targetSec);
      }
    });
  }

  // Global keyboard shortcut: Ctrl+K or Cmd+K to open Smart AI Assistant
  window.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      toggleCmdModal();
    } else if (e.key === 'Escape' && cmdModal && cmdModal.classList.contains('is-active')) {
      toggleCmdModal(false);
    }
  });
})();
