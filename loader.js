javascript:(function(){
  if(window.__QX_HUD__){
    window.__QX_HUD__.show();
    return;
  }

  var D = document, W = window;

  // ১. ক্যানভাস DEMO ওয়াটারমার্ক হুক (HTML5 Canvas Filter)
  if(!W.__qx_canvas_hooked__){
    W.__qx_canvas_hooked__ = true;
    try {
      var _fillText = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth){
        if(typeof text === 'string' && text.trim().toUpperCase() === 'DEMO'){
          return;
        }
        return maxWidth !== undefined ? _fillText.call(this, text, x, y, maxWidth) : _fillText.call(this, text, x, y);
      };
      var _strokeText = CanvasRenderingContext2D.prototype.strokeText;
      CanvasRenderingContext2D.prototype.strokeText = function(text, x, y, maxWidth){
        if(typeof text === 'string' && text.trim().toUpperCase() === 'DEMO'){
          return;
        }
        return maxWidth !== undefined ? _strokeText.call(this, text, x, y, maxWidth) : _strokeText.call(this, text, x, y);
      };
    } catch(e){}
  }

  // ২. গ্লোবাল সিএসএস ওয়াটারমার্ক ও নোটিশ কিলার
  var style = D.getElementById('__qx_free_css__') || D.createElement('style');
  style.id = '__qx_free_css__';
  style.textContent = [
    '[class*="watermark"], .chart-watermark, .chart__watermark, [data-watermark], [class*="demo-watermark"] { display: none !important; opacity: 0 !important; visibility: hidden !important; }',
    '.leaderboard-empty, .leaderboard-notice, [class*="leaderboard"] [class*="alert"], [class*="leaderboard"] [class*="warning"] { display: none !important; }',
    '.icon-academic { display: none !important; }'
  ].join('\n');
  D.head.appendChild(style);

  // ডিফল্ট স্টেট
  var state = {
    name: 'MATRIXTRADER',
    profit: 398000,
    flag: 'flag-bd',
    hideWatermark: true,
    initialBalance: null,
    tradePnL: 0
  };

  // ৩. ডিপ স্ক্যানার (Iframe এবং Shadow DOM সাপোর্ট)
  function deepWalk(root, fn, depth){
    if(!root || depth > 5) return;
    try { fn(root); } catch(e){}
    try {
      var nodes = root.querySelectorAll('*');
      for(var i = 0; i < nodes.length; i++){
        if(nodes[i].shadowRoot) deepWalk(nodes[i].shadowRoot, fn, depth + 1);
      }
    } catch(e){}
    try {
      var frames = root.querySelectorAll('iframe, frame');
      for(var j = 0; j < frames.length; j++){
        var doc = null;
        try { doc = frames[j].contentDocument; } catch(e){}
        if(doc) deepWalk(doc, fn, depth + 1);
      }
    } catch(e){}
  }

  // ৪. কোর ট্রান্সফরমেশন ইঞ্জিন
  function applyMask(){
    deepWalk(D, function(ctx){
      // ক্যান্ডেল চার্টের DEMO টেক্সট রিমুভ
      if(state.hideWatermark){
        var els = ctx.querySelectorAll('svg text, text, div, span, p');
        for(var i = 0; i < els.length; i++){
          var el = els[i];
          if(el.children.length === 0){
            var t = (el.textContent || '').trim().toUpperCase();
            if(t === 'DEMO' || t === 'DEMO ACCOUNT' || t === 'DEMO TRADING'){
              if(!el.closest('input, button, select, a, [role="button"], #qx-free-panel')){
                el.style.setProperty('display', 'none', 'important');
                el.textContent = '';
              }
            }
          }
        }
      }

      // অ্যাকাউন্ট সিলেক্টরে 'Demo' পরিবর্তন করে 'Live Account'
      var labels = ctx.querySelectorAll('.v2KPX, [class*="account-select"], [class*="user-balance"]');
      labels.forEach(function(l){
        if(l.textContent && l.textContent.indexOf('Demo') !== -1){
          l.textContent = l.textContent.indexOf('Account') !== -1 ? 'Live Account' : 'Live';
          l.style.color = '#00c853';
          var w = l.closest('.Xlyoi') || l.closest('[class*="profile"]') || l.parentElement;
          if(w){
            var u = w.querySelector('use');
            if(u) u.setAttribute('xlink:href', '/profile/images/spritemap.svg#icon-profile-level-vip');
            var s = w.querySelector('svg.icon-academic');
            if(s){
              s.classList.remove('icon-academic');
              s.classList.add('icon-profile-level-vip');
            }
          }
        }
      });

      // প্রোফাইল আইকন VIP তে রূপান্তর
      var icon = ctx.querySelector('.Xlyoi use');
      if(icon) icon.setAttribute('xlink:href', '/profile/images/spritemap.svg#icon-profile-level-vip');

      // লিডারবোর্ড আপডেট
      var lb = ctx.querySelector('[class*="leaderboard"], .modal-leaderboard, [class*="tournament"]');
      if(lb){
        lb.querySelectorAll('[class*="notice"], [class*="alert"], [class*="warning"], p').forEach(function(n){
          var txt = (n.textContent || '').toLowerCase();
          if(txt.indexOf('demo') !== -1) n.style.setProperty('display', 'none', 'important');
        });

        var curProfit = state.profit + state.tradePnL;
        var profitStr = '+$' + curProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // এক নম্বর র‍্যাংকে আপনার নাম ও পতাকা বসানো
        var row = lb.querySelector('[class*="item"]:first-child, [class*="row"]:first-child, [class*="leaderboard-item"]:first-child, [class*="current-user"], [class*="my-position"]');
        if(row){
          var nameEl = row.querySelector('[class*="name"], [class*="user-name"], [class*="login"], [class*="nickname"]');
          if(nameEl) nameEl.textContent = state.name;

          var rankEl = row.querySelector('[class*="rank"], [class*="position"], [class*="place"]');
          if(rankEl) rankEl.textContent = '1';

          var profitEl = row.querySelector('[class*="profit"], [class*="amount"], [class*="sum"], b, strong');
          if(profitEl){
            profitEl.textContent = profitStr;
            profitEl.style.color = '#00c853';
          }

          var flagEl = row.querySelector('[class*="flag"]');
          if(flagEl){
            flagEl.className = 'flag ' + state.flag;
            var fu = flagEl.querySelector('use');
            if(fu) fu.setAttribute('xlink:href', '/profile/images/spritemap.svg#' + state.flag);
          }
        }

        // লিডারবোর্ড হেডার স্ট্যাটাস
        lb.querySelectorAll('[class*="statistic"] [class*="value"], [class*="header"] [class*="value"]').forEach(function(val){
          if(val.textContent.indexOf('$') !== -1 || val.textContent === '—' || val.textContent.indexOf('0.00') !== -1){
            val.textContent = profitStr;
            val.style.color = '#00c853';
          }
        });
      }
    }, 0);

    // পেজ টেক্সট ও URL মাস্কিং
    if(D.title.indexOf('Demo') !== -1) D.title = D.title.replace(/Demo/gi, 'Live');
    var w = D.createTreeWalker(D.body, NodeFilter.SHOW_TEXT, null, false), node;
    while(node = w.nextNode()){
      if(node.nodeValue && node.nodeValue.indexOf('Demo trading') !== -1){
        node.nodeValue = node.nodeValue.replace(/Demo trading/gi, 'Live trading');
      }
    }
    if(location.pathname.indexOf('demo') !== -1){
      history.replaceState(null, '', location.pathname.replace('demo', 'trade'));
    }
  }

  // ৫. স্ক্রিনে সরাসরি কন্ট্রোল প্যানেল বক্স (HUD UI) তৈরি
  var panel = D.createElement('div');
  panel.id = 'qx-free-panel';
  panel.setAttribute('style', 'position:fixed;top:18%;right:18px;z-index:2147483647;width:240px;background:#0d1520f5;border:1px solid #00e676;box-shadow:0 10px 30px #000c, 0 0 15px #00e67644;border-radius:12px;padding:12px;font-family:ui-monospace,Menlo,sans-serif;color:#fff;user-select:none;touch-action:none;');
  
  panel.innerHTML = [
    '<div id="qx-drag-handle" style="display:flex;align-items:center;justify-content:space-between;cursor:move;padding-bottom:8px;border-bottom:1px solid #1f2d3d;margin-bottom:8px;">',
    '  <div style="font-weight:800;font-size:12px;color:#00e676;display:flex;align-items:center;gap:6px;">⚡ QUOTEX FREE LIVE</div>',
    '  <button id="qx-min-btn" style="background:#1f2d3d;border:none;color:#fff;border-radius:4px;cursor:pointer;font-size:10px;padding:2px 6px;">✕</button>',
    '</div>',
    '<div id="qx-body">',
    '  <div style="font-size:10px;color:#8ba2b5;margin-bottom:2px;">LEADERBOARD NAME:</div>',
    '  <input id="qx-name-in" type="text" value="' + state.name + '" style="width:100%;box-sizing:border-box;background:#060b11;border:1px solid #233547;color:#00e676;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:bold;margin-bottom:8px;">',
    '  <div style="font-size:10px;color:#8ba2b5;margin-bottom:2px;">TODAY PROFIT ($):</div>',
    '  <input id="qx-profit-in" type="number" value="' + state.profit + '" style="width:100%;box-sizing:border-box;background:#060b11;border:1px solid #233547;color:#00e676;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:bold;margin-bottom:10px;">',
    '  <div style="display:flex;gap:6px;">',
    '    <button id="qx-apply-btn" style="flex:1;background:#00c853;border:none;color:#000;padding:6px;border-radius:6px;font-weight:800;font-size:11px;cursor:pointer;">APPLY NOW</button>',
    '    <button id="qx-wm-btn" style="background:#182533;border:1px solid #283d52;color:#dff7ee;padding:6px;border-radius:6px;font-size:10px;cursor:pointer;">HIDE WM</button>',
    '  </div>',
    '  <div id="qx-status" style="font-size:9px;color:#00e676;text-align:center;margin-top:8px;font-weight:bold;">● 100% UNLOCKED & ACTIVE</div>',
    '</div>'
  ].join('');

  D.body.appendChild(panel);

  // মিনিমাইজড ছোট ব্যাজ বাটন
  var miniPill = D.createElement('div');
  miniPill.id = 'qx-mini-pill';
  miniPill.setAttribute('style', 'display:none;position:fixed;top:20%;right:14px;z-index:2147483647;background:#00c853;color:#000;font-weight:800;font-size:10px;padding:6px 12px;border-radius:999px;box-shadow:0 6px 16px #000c;cursor:pointer;font-family:sans-serif;');
  miniPill.textContent = '⚡ LIVE MASK';
  D.body.appendChild(miniPill);

  // বোতামের ইভেন্ট হ্যান্ডলার
  D.getElementById('qx-min-btn').onclick = function(){
    panel.style.display = 'none';
    miniPill.style.display = 'block';
  };
  miniPill.onclick = function(){
    panel.style.display = 'block';
    miniPill.style.display = 'none';
  };

  D.getElementById('qx-apply-btn').onclick = function(){
    var nameIn = D.getElementById('qx-name-in').value;
    var profitIn = parseFloat(D.getElementById('qx-profit-in').value);
    if(nameIn) state.name = nameIn;
    if(!isNaN(profitIn)) state.profit = profitIn;
    applyMask();
    var st = D.getElementById('qx-status');
    st.textContent = '✔ UPDATED LIVE!';
    st.style.color = '#fff';
    setTimeout(function(){ st.textContent = '● 100% UNLOCKED & ACTIVE'; st.style.color = '#00e676'; }, 1500);
  };

  D.getElementById('qx-wm-btn').onclick = function(){
    state.hideWatermark = !state.hideWatermark;
    this.textContent = state.hideWatermark ? 'WM HIDDEN' : 'WM VISIBLE';
    this.style.color = state.hideWatermark ? '#00c853' : '#ff5252';
    applyMask();
  };

  // প্যানেল ড্র্যাগ করার মেকানিজম
  var isDragging = false, dragX = 0, dragY = 0;
  var dragHandle = D.getElementById('qx-drag-handle');
  dragHandle.onpointerdown = function(e){
    isDragging = true;
    var r = panel.getBoundingClientRect();
    dragX = e.clientX - r.left;
    dragY = e.clientY - r.top;
    try { dragHandle.setPointerCapture(e.pointerId); } catch(x){}
  };
  D.addEventListener('pointermove', function(e){
    if(!isDragging) return;
    panel.style.left = (e.clientX - dragX) + 'px';
    panel.style.top = (e.clientY - dragY) + 'px';
    panel.style.right = 'auto';
  });
  D.addEventListener('pointerup', function(){ isDragging = false; });

  setInterval(applyMask, 400);
  applyMask();

  window.__QX_HUD__ = {
    show: function(){ panel.style.display = 'block'; miniPill.style.display = 'none'; }
  };
})();
