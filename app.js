// ====== CONFIG: put your Worker URL here (keep the /ws at the end) ======
const SIGNAL = "wss://flingshare-worker.text-me-md-alamin.workers.dev/ws";
// =========================================================================

const CHUNK = 60 * 1024;      // payload per DataChannel message (+4 byte header)
const SLICE = 1024 * 1024;    // read from disk 1 MB at a time
const HIGH = 8 * 1024 * 1024; // pause sending above this buffered amount
const LOW = 1024 * 1024;      // resume below this
const ICE = { iceServers: [{ urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] }] };

const $ = (id) => document.getElementById(id);
let ws, pc, dc, role, room, wake, connTimer, drainRes;
let nextId = 1, sending = false;
const queue = [];
const incoming = new Map();

// ---------- helpers ----------
function show(id) {
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === id));
}
function fmtSize(n) {
  const u = ["B", "KB", "MB", "GB"]; let i = 0;
  while (n >= 1024 && i < 3) { n /= 1024; i++; }
  return n.toFixed(i ? 1 : 0) + " " + u[i];
}
function chip(text, cls = "") { const c = $("chip"); c.textContent = text; c.className = "chip " + cls; }
function randomCode() { return String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000)); }

async function lockScreen() {
  try { wake = await navigator.wakeLock?.request("screen"); } catch {}
}
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && dc && dc.readyState === "open") lockScreen();
});

function reset() {
  clearTimeout(connTimer);
  try { ws && ws.close(); } catch {}
  try { dc && dc.close(); } catch {}
  try { pc && pc.close(); } catch {}
  try { wake && wake.release(); } catch {}
  ws = pc = dc = wake = null;
  queue.length = 0; sending = false; incoming.clear();
  $("list").innerHTML = ""; $("btnPick").disabled = true;
  $("recvError").textContent = "";
  history.replaceState(null, "", location.pathname);
  show("home");
}

// ---------- signaling ----------
function openSignal(code, r) {
  return new Promise((resolve, reject) => {
    ws = new WebSocket(`${SIGNAL}?room=${code}&role=${r}`);
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error(r === "guest" ? "Code not found. Check it and try again." : "Could not reach the server."));
    ws.onmessage = onSignal;
  });
}

async function onSignal(e) {
  const m = JSON.parse(e.data);
  if (m.type === "peer-joined" && role === "host") {
    $("sendStatus").textContent = "Connecting…";
    armTimer();
    await startHost();
  } else if (m.type === "sdp") {
    if (m.sdp.type === "offer" && role === "guest") await answerOffer(m.sdp);
    else if (m.sdp.type === "answer" && role === "host") await pc.setRemoteDescription(m.sdp);
  } else if (m.type === "peer-left" && (!dc || dc.readyState !== "open")) {
    chip("The other device left", "bad");
  }
}

function armTimer() {
  clearTimeout(connTimer);
  connTimer = setTimeout(() => {
    if (!dc || dc.readyState !== "open") {
      const msg = "Could not connect. Put both devices on the same Wi-Fi and try again.";
      $("sendStatus").textContent = msg; chip(msg, "bad");
    }
  }, 20000);
}

function gathered() {
  return new Promise((res) => {
    if (pc.iceGatheringState === "complete") return res();
    const t = setTimeout(res, 3000);
    pc.addEventListener("icegatheringstatechange", () => {
      if (pc.iceGatheringState === "complete") { clearTimeout(t); res(); }
    });
  });
}

function makePC() {
  pc = new RTCPeerConnection(ICE);
  pc.ondatachannel = (e) => setupChannel(e.channel);
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "failed") chip("Connection failed", "bad");
  };
}

async function startHost() {
  makePC();
  setupChannel(pc.createDataChannel("fling"));
  await pc.setLocalDescription();
  await gathered(); // all candidates in one message, so signaling stays tiny
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
    clearTimeout(connTimer);
    try { ws && ws.close(); } catch {} // signaling is no longer needed
    show("xferView");
    chip("Connected", "ok");
    $("btnPick").disabled = false;
    lockScreen();
  };
  dc.onclose = () => { chip("Disconnected", "bad"); $("btnPick").disabled = true; drainRes && drainRes(); };
  dc.onmessage = onData;
}

// ---------- UI rows ----------
function addRow(name, size, dir) {
  const li = document.createElement("li");
  li.innerHTML = `<div class="row1"><span class="name"></span><span class="dir">${dir === "out" ? "Sending" : "Receiving"}</span></div>
    <div class="bar"><i></i></div><div class="meta"><span class="a"></span><span class="b"></span></div>`;
  li.querySelector(".name").textContent = name;
  $("list").prepend(li);
  const bar = li.querySelector("i"), a = li.querySelector(".a"), b = li.querySelector(".b"), d = li.querySelector(".dir");
  a.textContent = "0 / " + fmtSize(size);
  return {
    update(done, speed) {
      bar.style.width = (size ? (done / size) * 100 : 100) + "%";
      a.textContent = fmtSize(done) + " / " + fmtSize(size);
      b.textContent = speed ? fmtSize(speed) + "/s" : "";
    },
    finish(url) {
      bar.style.width = "100%"; bar.classList.add("done");
      d.textContent = dir === "out" ? "Sent" : "Received"; b.textContent = "";
      if (url) {
        const s = document.createElement("a");
        s.className = "save"; s.textContent = "Save file"; s.href = url; s.download = name;
        li.appendChild(s);
      }
    },
    fail(msg) { d.textContent = msg; b.textContent = ""; },
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
      if (dc.bufferedAmount > HIGH) await drain(); // backpressure: keeps phones from freezing
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
  dc.send(JSON.stringify({ t: "end", id }));
  row.finish();
}

async function pump() {
  if (sending) return;
  sending = true;
  while (queue.length) {
    const job = queue.shift();
    try { await sendFile(job); } catch { job.row.fail("Failed"); break; }
  }
  sending = false;
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
      incoming.set(m.id, { name: m.name, size: m.size, parts: [], got: 0, t: performance.now(), b: 0, speed: 0, row: addRow(m.name, m.size, "in") });
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
  if (now - s.t > 500) { s.speed = ((s.got - s.b) / (now - s.t)) * 1000; s.t = now; s.b = s.got; s.row.update(s.got, s.speed); }
}

// ---------- flows ----------
async function startSend() {
  role = "host";
  show("sendView");
  $("sendStatus").textContent = "Waiting for the other device…";
  for (let i = 0; i < 3; i++) {
    room = randomCode();
    try { await openSignal(room, "host"); break; }
    catch (err) { if (i === 2) { $("sendStatus").textContent = err.message; return; } }
  }
  $("codeTiles").innerHTML = room.split("").map((c) => `<i>${c}</i>`).join("");
  const link = location.origin + location.pathname + "#" + room;
  try {
    const q = qrcode(0, "M"); q.addData(link); q.make();
    $("qr").innerHTML = q.createSvgTag({ cellSize: 6, margin: 0, scalable: true });
  } catch { $("qr").style.display = "none"; }
  $("btnShare").onclick = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "FlingShare", text: "Open this to receive my files", url: link });
      else { await navigator.clipboard.writeText(link); $("btnShare").textContent = "Link copied"; }
    } catch {}
  };
}

async function join(code) {
  role = "guest";
  show("xferView");
  chip("Connecting…");
  armTimer();
  try { await openSignal(code, "guest"); }
  catch (err) { clearTimeout(connTimer); show("recvView"); $("recvError").textContent = err.message; }
}

// ---------- wiring ----------
$("btnSend").onclick = startSend;
$("btnRecv").onclick = () => { show("recvView"); $("codeInput").focus(); };
document.querySelectorAll("[data-back]").forEach((b) => (b.onclick = reset));
$("codeInput").oninput = (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6); $("recvError").textContent = ""; };
$("btnJoin").onclick = () => {
  const c = $("codeInput").value;
  if (c.length !== 6) { $("recvError").textContent = "The code has 6 digits."; return; }
  join(c);
};
$("btnPick").onclick = () => $("picker").click();
$("picker").onchange = (e) => { enqueue([...e.target.files]); e.target.value = ""; };
window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => { e.preventDefault(); if (dc && dc.readyState === "open") enqueue([...e.dataTransfer.files]); });

const hash = location.hash.slice(1);
if (/^\d{6}$/.test(hash)) join(hash);
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
