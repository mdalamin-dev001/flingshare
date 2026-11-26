// ====== CONFIG ======
const SIGNAL = "wss://flingshare-worker.text-me-md-alamin.workers.dev/ws";
// ====================

const DEBUG = location.search.includes("debug");
const CHUNK = 60 * 1024;
const SLICE = 1024 * 1024;
const HIGH = 8 * 1024 * 1024;
const LOW = 1024 * 1024;
const ICE = { iceServers: [{ urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] }] };

// ---------- languages ----------
const I18N = {
  en: {
    tagline: "Files go straight to the other device. Nothing is uploaded.",
    send: "Send", sendSub: "Show a code for the other device",
    recv: "Receive", recvSub: "Enter a code or scan a QR",
    how: "How it works",
    h1: "The sender taps Send and gets a 6-digit code and QR.",
    h2: "The receiver enters the code or scans the QR.",
    h3: "Pick files. They travel directly between the two devices.",
    wifi: "Works best when both devices are on the same Wi-Fi.",
    back: "Back", disconnect: "Disconnect",
    stCode: "Code", stConnect: "Connect", stTransfer: "Transfer",
    shareCode: "Share this code",
    waiting: "Waiting for the other device…", connecting: "Connecting…",
    keepSend: "Keep this page open until the other device connects.",
    shareLink: "Share link", linkCopied: "Link copied",
    enterCode: "Enter the code", connect: "Connect",
    orScan: "Or scan the sender’s QR code with your camera.",
    codeLen: "The code has 6 digits.",
    notFound: "Code not found. Check it and try again.",
    noServer: "Could not reach the server.",
    connected: "Connected",
    keepXfer: "Keep this page open. Do not switch apps or tabs, lock the screen or close the page until every file says Done.",
    choose: "Choose files", chooseSub: "Photos, videos, APKs, ZIPs, anything",
    idle: "No files yet. Tap “Choose files” to start.",
    sending: "Sending", receiving: "Receiving", sent: "Sent", received: "Received",
    save: "Save file", failed: "Failed",
    left: "The other device left", disc: "Disconnected",
    failConn: "Could not connect. Put both devices on the same Wi-Fi and try again.",
    retry: "Start over",
    allDone: "All files are done. You can close this page now.",
    summary: "{d} of {n} files done",
    hiddenWarn: "You left this page. Transfers may have paused, so stay on this page.",
  },
  bn: {
    tagline: "ফাইল সরাসরি অন্য ডিভাইসে যায়। কিছু আপলোড হয় না।",
    send: "পাঠান", sendSub: "অন্য ডিভাইসের জন্য কোড দেখান",
    recv: "গ্রহণ করুন", recvSub: "কোড লিখুন বা QR স্ক্যান করুন",
    how: "কীভাবে কাজ করে",
    h1: "প্রেরক “পাঠান” চেপে ৬ সংখ্যার কোড ও QR পায়।",
    h2: "প্রাপক কোড লেখে অথবা QR স্ক্যান করে।",
    h3: "ফাইল বাছাই করুন। ফাইল সরাসরি দুই ডিভাইসের মধ্যে যায়।",
    wifi: "দুই ডিভাইস একই Wi-Fi-তে থাকলে সবচেয়ে ভালো কাজ করে।",
    back: "পিছনে", disconnect: "সংযোগ বিচ্ছিন্ন করুন",
    stCode: "কোড", stConnect: "সংযোগ", stTransfer: "ফাইল পাঠানো",
    shareCode: "এই কোডটি শেয়ার করুন",
    waiting: "অন্য ডিভাইসের জন্য অপেক্ষা করছি…", connecting: "সংযোগ হচ্ছে…",
    keepSend: "অন্য ডিভাইস সংযুক্ত না হওয়া পর্যন্ত এই পেজ খোলা রাখুন।",
    shareLink: "লিংক শেয়ার করুন", linkCopied: "লিংক কপি হয়েছে",
    enterCode: "কোড লিখুন", connect: "সংযুক্ত হন",
    orScan: "অথবা প্রেরকের QR কোড ক্যামেরা দিয়ে স্ক্যান করুন।",
    codeLen: "কোডটি ৬ সংখ্যার।",
    notFound: "কোডটি পাওয়া যায়নি। দেখে আবার চেষ্টা করুন।",
    noServer: "সার্ভারে পৌঁছানো যাচ্ছে না।",
    connected: "সংযুক্ত",
    keepXfer: "পেজটি খোলা রাখুন। সব ফাইলে “সম্পন্ন” না দেখা পর্যন্ত অন্য অ্যাপ বা ট্যাবে যাবেন না, স্ক্রিন লক করবেন না, পেজ বন্ধ করবেন না।",
    choose: "ফাইল বাছাই করুন", chooseSub: "ছবি, ভিডিও, APK, ZIP, যেকোনো ফাইল",
    idle: "এখনো কোনো ফাইল নেই। শুরু করতে “ফাইল বাছাই করুন” চাপুন।",
    sending: "পাঠানো হচ্ছে", receiving: "গ্রহণ হচ্ছে", sent: "পাঠানো হয়েছে", received: "গ্রহণ হয়েছে",
    save: "ফাইল সেভ করুন", failed: "ব্যর্থ",
    left: "অন্য ডিভাইস চলে গেছে", disc: "সংযোগ বিচ্ছিন্ন",
    failConn: "সংযোগ হয়নি। দুই ডিভাইস একই Wi-Fi-তে রেখে আবার চেষ্টা করুন।",
    retry: "নতুন করে শুরু করুন",
    allDone: "সব ফাইল সম্পন্ন। এখন পেজ বন্ধ করতে পারেন।",
    summary: "{n}টির মধ্যে {d}টি ফাইল সম্পন্ন",
    hiddenWarn: "আপনি পেজ ছেড়ে গিয়েছিলেন। স্থানান্তর থেমে থাকতে পারে, তাই এই পেজেই থাকুন।",
  },
};
let lang = "en";
try { lang = localStorage.getItem("fling-lang") || ((navigator.language || "").startsWith("bn") ? "bn" : "en"); } catch {}
const t = (k, v = {}) => (I18N[lang][k] || I18N.en[k] || k).replace(/\{(\w+)\}/g, (_, x) => v[x]);
const $ = (id) => document.getElementById(id);

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-t]").forEach((el) => (el.textContent = t(el.dataset.t)));
  $("lang").textContent = lang === "bn" ? "EN" : "বাং";
  refresh();
}

// ---------- state ----------
let ws, pc, dc, role, room, wake, connTimer, drainRes, leftAt = 0, toastTimer;
let nextId = 1, sending = false;
const queue = [];
const incoming = new Map();
const stats = { total: 0, done: 0 };

// ---------- helpers ----------
function log(m) {
  if (!DEBUG) return;
  let el = $("dbg");
  if (!el) {
    el = document.createElement("pre"); el.id = "dbg";
    el.style.cssText = "font:11px/1.4 monospace;white-space:pre-wrap;color:#888;margin:20px 0 0";
    $("app").appendChild(el);
  }
  el.textContent += m + "\n";
}
function fmtSize(n) {
  const u = ["B", "KB", "MB", "GB"]; let i = 0;
  while (n >= 1024 && i < 3) { n /= 1024; i++; }
  return n.toFixed(i ? 1 : 0) + " " + u[i];
}
function randomCode() { return String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000)); }
function chip(text, cls = "") { const c = $("chip"); c.textContent = text; c.className = "chip " + cls; }
function toast(text) {
  const el = $("toast"); el.textContent = text; el.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (el.hidden = true), 7000);
}
function setStep(n) {
  $("steps").hidden = n === 0;
  [...$("steps").children].forEach((li, i) => {
    li.classList.toggle("done", i + 1 < n);
    li.classList.toggle("active", i + 1 === n);
  });
}
function show(id) {
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === id));
}
function open_() { return !!(dc && dc.readyState === "open"); }

function refresh() {
  const n = stats.total, d = stats.done;
  $("summary").textContent = n ? t("summary", { d, n }) : "";
  $("empty").hidden = n > 0 || !open_();
  const all = n > 0 && d === n && !queue.length && !sending;
  $("done").hidden = !all;
  if (!document.title.includes("%")) document.title = all ? "✓ FlingShare" : "FlingShare";
}

function fail(key) {
  clearTimeout(connTimer);
  chip(t(key), "bad");
  $("sendStatus").textContent = t(key);
  $("retry").hidden = false;
  $("retrySend").hidden = false;
  $("btnShare").hidden = true;
}

async function lockScreen() { try { wake = await navigator.wakeLock?.request("screen"); } catch {} }

function reset() {
  clearTimeout(connTimer);
  try { ws && ws.close(); } catch {}
  try { dc && dc.close(); } catch {}
  try { pc && pc.close(); } catch {}
  try { wake && wake.release(); } catch {}
  ws = pc = dc = wake = null;
  queue.length = 0; sending = false; incoming.clear();
  stats.total = stats.done = 0;
  $("list").innerHTML = ""; $("btnPick").disabled = true;
  $("recvError").textContent = ""; $("codeInput").value = "";
  $("retry").hidden = true; $("retrySend").hidden = true; $("btnShare").hidden = false;
  $("qr").style.display = ""; $("qr").innerHTML = ""; $("codeTiles").innerHTML = "";
  document.title = "FlingShare";
  history.replaceState(null, "", location.pathname);
  setStep(0); show("home"); refresh();
}

// ---------- leaving the page ----------
window.addEventListener("beforeunload", (e) => {
  if (ws || dc) { e.preventDefault(); e.returnValue = ""; }
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") { if (ws || dc) leftAt = Date.now(); }
  else {
    if (open_()) lockScreen();
    if (leftAt && Date.now() - leftAt > 2000 && (ws || dc)) toast(t("hiddenWarn"));
    leftAt = 0;
  }
});

// ---------- signaling ----------
function openSignal(code, r) {
  return new Promise((resolve, reject) => {
    ws = new WebSocket(`${SIGNAL}?room=${code}&role=${r}`);
    ws.onopen = () => { log("signal open " + r); resolve(); };
    ws.onerror = () => reject(new Error(t(r === "guest" ? "notFound" : "noServer")));
    ws.onmessage = onSignal;
  });
}

async function onSignal(e) {
  const m = JSON.parse(e.data);
  log("signal: " + m.type + (m.sdp ? " " + m.sdp.type : ""));
  if (m.type === "peer-joined" && role === "host") {
    setStep(2);
    $("sendStatus").textContent = t("connecting");
    armTimer();
    await startHost();
  } else if (m.type === "sdp") {
    if (m.sdp.type === "offer" && role === "guest") await answerOffer(m.sdp);
    else if (m.sdp.type === "answer" && role === "host") await pc.setRemoteDescription(m.sdp);
  } else if (m.type === "peer-left" && !open_()) {
    fail("left");
  }
}

function armTimer() {
  clearTimeout(connTimer);
  connTimer = setTimeout(() => { if (!open_()) fail("failConn"); }, 20000);
}

function gathered() {
  return new Promise((res) => {
    if (pc.iceGatheringState === "complete") return res();
    const timer = setTimeout(res, 3000);
    pc.addEventListener("icegatheringstatechange", () => {
      if (pc.iceGatheringState === "complete") { clearTimeout(timer); res(); }
    });
  });
}

function makePC() {
  pc = new RTCPeerConnection(ICE);
  pc.ondatachannel = (e) => setupChannel(e.channel);
  pc.oniceconnectionstatechange = () => log("ice: " + pc.iceConnectionState);
  pc.onconnectionstatechange = () => { if (pc.connectionState === "failed") fail("failConn"); };
}

async function startHost() {
  makePC();
  setupChannel(pc.createDataChannel("fling"));
  await pc.setLocalDescription();
  await gathered();
  ws.send(JSON.stringify({ type: "sdp", sdp: pc.localDescription }));
}

async function answerOffer(sdp) {
  makePC();
  await pc.setRemoteDescription(sdp);
  await pc.setLocalDescription();
  await gathered();
  ws.send(JSON.stringify({ type: "sdp", sdp: pc.localDescription }));
}

function setupChannel(ch) {
  dc = ch;
  dc.binaryType = "arraybuffer";
  dc.bufferedAmountLowThreshold = LOW;
  dc.onopen = () => {
    log("datachannel open");
    clearTimeout(connTimer);
    try { ws && ws.close(); } catch {}
    show("xferView"); setStep(3);
    chip(t("connected"), "ok");
    $("btnPick").disabled = false;
    refresh(); lockScreen();
  };
  dc.onclose = () => {
    $("btnPick").disabled = true;
    const all = stats.total > 0 && stats.done === stats.total;
    chip(t("disc"), all ? "" : "bad");
    if (!all) $("retry").hidden = false;
    drainRes && drainRes();
  };
  dc.onmessage = onData;
}

// ---------- rows ----------
function addRow(name, size, dir) {
  stats.total++; refresh();
  const li = document.createElement("li");
  li.innerHTML = `<div class="row1"><span class="name"></span><span class="dir"></span></div>
    <div class="bar"><i></i></div><div class="meta"><span class="a"></span><span class="b"></span></div>`;
  li.querySelector(".name").textContent = name;
  const bar = li.querySelector("i"), a = li.querySelector(".a"), b = li.querySelector(".b"), d = li.querySelector(".dir");
  d.textContent = t(dir === "out" ? "sending" : "receiving");
  a.textContent = "0 / " + fmtSize(size);
  $("list").prepend(li);
  return {
    update(done, speed) {
      const pct = size ? Math.floor((done / size) * 100) : 100;
      bar.style.width = pct + "%";
      a.textContent = fmtSize(done) + " / " + fmtSize(size);
      b.textContent = speed ? fmtSize(speed) + "/s" : "";
      document.title = pct + "% · FlingShare";
    },
    finish(url) {
      bar.style.width = "100%"; bar.classList.add("done");
      d.textContent = "✓ " + t(dir === "out" ? "sent" : "received"); b.textContent = "";
      if (url) {
        const s = document.createElement("a");
        s.className = "save"; s.textContent = t("save"); s.href = url; s.download = name;
        li.appendChild(s);
      }
      stats.done++; document.title = "FlingShare"; refresh();
    },
    fail() { d.textContent = t("failed"); b.textContent = ""; },
  };
}

// ---------- sending ----------
function drain() { return new Promise((r) => { drainRes = () => { drainRes = null; r(); }; dc.onbufferedamountlow = drainRes; }); }

async function sendFile(job) {
  const { id, file, row } = job;
  dc.send(JSON.stringify({ t: "meta", id, name: file.name, size: file.size }));
  let off = 0, lastT = performance.now(), lastB = 0, speed = 0;
  while (off < file.size) {
    const buf = await file.slice(off, off + SLICE).arrayBuffer();
    for (let p = 0; p < buf.byteLength; p += CHUNK) {
      if (dc.readyState !== "open") throw new Error("closed");
      if (dc.bufferedAmount > HIGH) await drain();
      const len = Math.min(CHUNK, buf.byteLength - p);
      const pkt = new Uint8Array(4 + len);
      new DataView(pkt.buffer).setUint32(0, id);
      pkt.set(new Uint8Array(buf, p, len), 4);
      dc.send(pkt);
    }
    off += buf.byteLength;
    const now = performance.now();
    if (now - lastT > 500) { speed = ((off - lastB) / (now - lastT)) * 1000; lastT = now; lastB = off; }
    row.update(off, speed);
  }
  if (!file.size) row.update(0, 0);
  dc.send(JSON.stringify({ t: "end", id }));
  row.finish();
}

async function pump() {
  if (sending) return;
  sending = true;
  while (queue.length) {
    const job = queue.shift();
    try { await sendFile(job); } catch { job.row.fail(); break; }
  }
  sending = false; refresh();
}

function enqueue(files) {
  for (const file of files) queue.push({ id: nextId++, file, row: addRow(file.name, file.size, "out") });
  pump();
}

// ---------- receiving ----------
function onData(e) {
  if (typeof e.data === "string") {
    const m = JSON.parse(e.data);
    if (m.t === "meta") {
      incoming.set(m.id, { size: m.size, parts: [], got: 0, t: performance.now(), b: 0, row: addRow(m.name, m.size, "in") });
    } else if (m.t === "end") {
      const s = incoming.get(m.id); if (!s) return;
      const url = URL.createObjectURL(new Blob(s.parts));
      s.parts = []; s.row.finish(url); incoming.delete(m.id);
    }
    return;
  }
  const id = new DataView(e.data).getUint32(0);
  const s = incoming.get(id); if (!s) return;
  s.parts.push(e.data.slice(4));
  s.got += e.data.byteLength - 4;
  const now = performance.now();
  if (now - s.t > 500) { s.row.update(s.got, ((s.got - s.b) / (now - s.t)) * 1000); s.t = now; s.b = s.got; }
}

// ---------- flows ----------
async function startSend() {
  role = "host";
  show("sendView"); setStep(1);
  $("sendStatus").textContent = t("waiting");
  for (let i = 0; i < 3; i++) {
    room = randomCode();
    try { await openSignal(room, "host"); break; }
    catch (err) { if (i === 2) { fail("noServer"); return; } }
  }
  $("codeTiles").innerHTML = room.split("").map((c) => `<i>${c}</i>`).join("");
  const link = location.origin + location.pathname + "#" + room;
  try {
    const q = qrcode(0, "M"); q.addData(link); q.make();
    $("qr").innerHTML = q.createSvgTag({ cellSize: 6, margin: 0, scalable: true });
  } catch { $("qr").style.display = "none"; }
  $("btnShare").onclick = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "FlingShare", url: link });
      else { await navigator.clipboard.writeText(link); $("btnShare").textContent = t("linkCopied"); }
    } catch {}
  };
}

async function join(code) {
  role = "guest";
  show("xferView"); setStep(2);
  chip(t("connecting"));
  armTimer();
  try { await openSignal(code, "guest"); }
  catch (err) {
    clearTimeout(connTimer); ws = null;
    show("recvView"); setStep(1); $("recvError").textContent = err.message;
  }
}

// ---------- wiring ----------
$("lang").onclick = () => {
  lang = lang === "bn" ? "en" : "bn";
  try { localStorage.setItem("fling-lang", lang); } catch {}
  applyLang();
};
$("btnSend").onclick = startSend;
$("btnRecv").onclick = () => { show("recvView"); setStep(1); $("codeInput").focus(); };
document.querySelectorAll("[data-back]").forEach((b) => (b.onclick = reset));
$("retry").onclick = reset;
$("retrySend").onclick = reset;
$("codeInput").oninput = (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6); $("recvError").textContent = ""; };
$("codeInput").onkeydown = (e) => { if (e.key === "Enter") $("btnJoin").click(); };
$("btnJoin").onclick = () => {
  const c = $("codeInput").value;
  if (c.length !== 6) { $("recvError").textContent = t("codeLen"); return; }
  join(c);
};
$("btnPick").onclick = () => $("picker").click();
$("picker").onchange = (e) => { enqueue([...e.target.files]); e.target.value = ""; };
window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => { e.preventDefault(); if (open_()) enqueue([...e.dataTransfer.files]); });

applyLang();
const hash = location.hash.slice(1);
if (/^\d{6}$/.test(hash)) join(hash);
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
