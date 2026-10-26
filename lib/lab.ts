/**
 * The hero's AI lab: one particle system that walks through how a model works, in six stages.
 * Embed (the skills as a 3D embedding space, the cursor is the query), Attend (attention streams between the
 * words of the tagline), Fire (a forward pass), Learn (a real network training live), Descend (optimizers on a
 * rotating loss terrain) and Generate (diffusion sampling a brain, whose neurons then fire). The same particles morph from one
 * stage to the next. Plain 2D canvas, no libraries. With `still`, every stage is a single settled frame.
 */

type Role = 'idle' | 'pt' | 'doc' | 'flow' | 'ring' | 'sig' | 'data' | 'edge' | 'ter' | 'gen';

interface Neuron {
  l: number;
  x: number;
  y: number;
  z: number;
  act: number;
  charge: number;
}

interface Synapse {
  a: Neuron;
  b: Neuron;
  w: number;
}

interface Sample {
  u: number;
  v: number;
  c: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  tx: number;
  ty: number;
  tz: number;
  size: number;
  tsize: number;
  col: number;
  alpha: number;
  talpha: number;
  k: number;
  ph: number;
  role: Role;
  // Embed
  cluster: number;
  label: string;
  bx: number;
  by: number;
  bz: number;
  // Attend and Fire
  a: number;
  b: number;
  s: number;
  sp: number;
  node: Neuron | null;
  ang: number;
  busy: boolean;
  edge: Synapse | null;
  // Learn
  d: Sample | null;
  // Descend
  gi: number;
  gj: number;
  // Generate
  x0: number;
  y0: number;
  nx: number;
  ny: number;
  nz: number;
}

interface Stage {
  title: string;
  enter(): void;
  camera(): [number, number];
  update?(dt: number): void;
  under?(): void;
  over?(): void;
  tap?(x: number, y: number): void;
  hud(): string;
}

export interface Lab {
  destroy(): void;
}

const TAU = Math.PI * 2;
const INK = '#111318';
/** Deep strengths of sky, grape, mint, an orange, iris and rose, then ink and a quiet grey. */
const HUES = ['#0171a3', '#853dc2', '#0a7d51', '#c2410c', '#4556d9', '#b51c79', INK, '#a3a9b6'];
const FOV = 3.2;
const DURATION = [4.5, 4, 4, 4.5, 5, 5];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const gauss = () => {
  let u = 0;
  let v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
};
const mono = (px: number) => `600 ${px}px 'Atkinson Hyperlegible Mono', ui-monospace, monospace`;
const sans = (px: number) => `700 ${px}px 'Atkinson Hyperlegible Next', system-ui, sans-serif`;

const DOCS: [string, number][] = [
  ['RAG', 0], ['FAISS', 0], ['vector search', 0], ['RAGAS', 0], ['Legal Bot', 0], ['citations', 0],
  ['LangGraph', 1], ['agents', 1], ['LangChain', 1], ['tool calling', 1], ['research assistant', 1],
  ['QLoRA', 2], ['Gemma 4', 2], ['PEFT', 2], ['fine-tuning', 2], ['Hugging Face', 2],
  ['YOLO', 3], ['OpenCV', 3], ['TensorRT', 3], ['computer vision', 3],
  ['Azure ML', 4], ['MLflow', 4], ['Docker', 4], ['FastAPI', 4], ['Kubernetes', 4],
  ['AI, but Simple', 5], ['28 episodes', 5], ['Hinglish', 5], ['teaching', 5],
];
const TOPICS = ['retrieval', 'agents', 'fine-tuning', 'vision', 'MLOps', 'teaching'];
const WORDS = ['I', 'build', 'AI', 'that', 'shows', 'its', 'work'];

/** A 2-h-h-1 tanh network with a sigmoid output, trained full batch with Adam. Small enough to train every frame. */
function createNet(h: number) {
  const r = (k: number) => (Math.random() * 2 - 1) * k;
  const p = {
    W1: Float64Array.from({ length: h * 2 }, () => r(1.3)),
    b1: new Float64Array(h),
    W2: Float64Array.from({ length: h * h }, () => r(0.6)),
    b2: new Float64Array(h),
    W3: Float64Array.from({ length: h }, () => r(0.6)),
    b3: new Float64Array(1),
  };
  const keys = Object.keys(p) as (keyof typeof p)[];
  const zeros = () => Object.fromEntries(keys.map((k) => [k, new Float64Array(p[k].length)])) as typeof p;
  const g = zeros();
  const m = zeros();
  const v = zeros();
  const a1 = new Float64Array(h);
  const a2 = new Float64Array(h);
  const d1 = new Float64Array(h);
  const d2 = new Float64Array(h);
  let step = 0;
  const forward = (x: number, y: number) => {
    for (let i = 0; i < h; i++) a1[i] = Math.tanh(p.W1[i * 2] * x + p.W1[i * 2 + 1] * y + p.b1[i]);
    for (let i = 0; i < h; i++) {
      let z = p.b2[i];
      for (let j = 0; j < h; j++) z += p.W2[i * h + j] * a1[j];
      a2[i] = Math.tanh(z);
    }
    let o = p.b3[0];
    for (let i = 0; i < h; i++) o += p.W3[i] * a2[i];
    return 1 / (1 + Math.exp(-o));
  };
  const train = (data: Sample[], lr: number) => {
    keys.forEach((k) => g[k].fill(0));
    let loss = 0;
    let right = 0;
    for (const s of data) {
      const y = forward(s.u, s.v);
      loss -= s.c ? Math.log(y + 1e-9) : Math.log(1 - y + 1e-9);
      right += y > 0.5 === !!s.c ? 1 : 0;
      const dO = y - s.c;
      g.b3[0] += dO;
      for (let i = 0; i < h; i++) {
        g.W3[i] += dO * a2[i];
        d2[i] = dO * p.W3[i] * (1 - a2[i] * a2[i]);
      }
      for (let i = 0; i < h; i++) {
        g.b2[i] += d2[i];
        for (let j = 0; j < h; j++) g.W2[i * h + j] += d2[i] * a1[j];
      }
      for (let j = 0; j < h; j++) {
        let acc = 0;
        for (let i = 0; i < h; i++) acc += d2[i] * p.W2[i * h + j];
        d1[j] = acc * (1 - a1[j] * a1[j]);
        g.b1[j] += d1[j];
        g.W1[j * 2] += d1[j] * s.u;
        g.W1[j * 2 + 1] += d1[j] * s.v;
      }
    }
    step++;
    const n = data.length;
    for (const k of keys) {
      const w = p[k];
      for (let i = 0; i < w.length; i++) {
        const gi = g[k][i] / n;
        m[k][i] = 0.9 * m[k][i] + 0.1 * gi;
        v[k][i] = 0.999 * v[k][i] + 0.001 * gi * gi;
        w[i] -= (lr * (m[k][i] / (1 - 0.9 ** step))) / (Math.sqrt(v[k][i] / (1 - 0.999 ** step)) + 1e-8);
      }
    }
    return { loss: loss / n, acc: right / n };
  };
  return { forward, train };
}

export function createLab({ root, canvas, hud, buttons, still = false }: { root: HTMLElement; canvas: HTMLCanvasElement; hud: HTMLElement; buttons: HTMLButtonElement[]; still?: boolean }): Lab | null {
  const context = canvas.getContext('2d');
  if (!context) return null;
  const ctx: CanvasRenderingContext2D = context;
  /** A white outline under canvas text, so labels stay readable where they cross dots and lines. */
  const halo = (text: string, x: number, y: number) => {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#fff';
    ctx.strokeText(text, x, y);
    ctx.restore();
  };
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0;
  let H = 0;
  let unit = 1;
  let phone = false;
  // The top of the stage buttons, and whether they sit at the top of the lab (phones) or along its bottom.
  let barTop = 0;
  let barAtTop = false;
  let T = 0;
  let born = 0;
  let grid: HTMLCanvasElement | null = null;
  const pointer = { x: 0, y: 0, inside: false, last: -10, tapped: -10 };
  const cam = { yaw: 0, pitch: 0 };
  const tilt = () => (pointer.inside ? (pointer.x / W - 0.5) * 0.5 : 0);

  function project(x: number, y: number, z: number): [number, number, number, number] {
    const cy = Math.cos(cam.yaw);
    const sy = Math.sin(cam.yaw);
    const cp = Math.cos(cam.pitch);
    const sp = Math.sin(cam.pitch);
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const y1 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;
    const k = FOV / (FOV + z2);
    // The drawing centres in the room the stage buttons leave: lower when they sit on top, higher on a phone's tall lab.
    return [W / 2 + x1 * unit * k, H * (barAtTop ? 0.6 : phone ? 0.42 : 0.47) + y1 * unit * k, k, z2];
  }

  /* ---------- Particles ---------- */
  let N = 0;
  const P: Particle[] = [];
  function makeParticles() {
    N = phone ? 520 : 900;
    P.length = 0;
    for (let i = 0; i < N; i++) {
      // Everything starts in one point at the centre, so the opening reads as a burst.
      const r = 0.02 * Math.random();
      const a = Math.random() * TAU;
      const b = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(b) * Math.cos(a);
      const y = r * Math.sin(b) * Math.sin(a);
      const z = r * Math.cos(b);
      P.push({
        x, y, z, vx: 0, vy: 0, vz: 0, tx: x, ty: y, tz: z, size: 1.6, tsize: 1.6, col: 7, alpha: 0, talpha: 0.5, k: 0.7 + Math.random() * 0.6, ph: Math.random() * TAU, role: 'idle',
        cluster: 0, label: '', bx: 0, by: 0, bz: 0, a: 0, b: 0, s: 0, sp: 0, node: null, ang: 0, busy: false, edge: null, d: null, gi: 0, gj: 0, x0: 0, y0: 0, nx: 0, ny: 0, nz: 0,
      });
    }
  }
  const park = (p: Particle) => {
    p.role = 'idle';
    p.talpha = 0;
    p.tsize = 1;
  };
  function physics(dt: number) {
    // The first two seconds ease in, so the opening burst is one slow, deliberate expansion.
    const ease = Math.min(1, 0.15 + (T - born) / 1.2);
    const stiff = 95 * ease * ease;
    const damp = Math.exp(-11 * dt);
    for (const p of P) {
      p.vx = (p.vx + (p.tx - p.x) * stiff * p.k * dt) * damp;
      p.vy = (p.vy + (p.ty - p.y) * stiff * p.k * dt) * damp;
      p.vz = (p.vz + (p.tz - p.z) * stiff * p.k * dt) * damp;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.size += (p.tsize - p.size) * Math.min(1, dt * 8);
      p.alpha += (p.talpha - p.alpha) * Math.min(1, dt * 5);
    }
  }
  /** Still mode: every particle sits exactly on its target. */
  function settle() {
    for (const p of P) {
      p.x = p.tx;
      p.y = p.ty;
      p.z = p.tz;
      p.vx = p.vy = p.vz = 0;
      p.size = p.tsize;
      p.alpha = p.talpha;
    }
  }
  const screenOf = (p: Particle) => project(p.x, p.y, p.z);
  function drawParticles() {
    const items: [number, number, number, number, Particle][] = [];
    for (const p of P) {
      if (p.alpha <= 0.02) continue;
      const [sx, sy, k, z] = screenOf(p);
      items.push([z, sx, sy, k, p]);
    }
    items.sort((a, b) => b[0] - a[0]);
    for (const [, sx, sy, k, p] of items) {
      ctx.globalAlpha = p.alpha * clamp(0.55 + k * 0.45, 0, 1);
      ctx.fillStyle = HUES[p.col];
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(0.6, p.size * k), 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- 01 · Embed: the skills and projects as a 3D embedding space; the cursor is the query ---------- */
  function embedStage(): Stage {
    let centers: [number, number, number][] = [];
    let links: [Particle, Particle][] = [];
    const q = { x: 0, y: 0 };
    let burst = -1;
    return {
      title: 'Embed',
      enter() {
        centers = TOPICS.map((_, c) => {
          const a = (c / 6) * TAU + 0.3;
          return [Math.cos(a) * 0.76, c % 2 ? -0.26 : 0.24, Math.sin(a) * 0.76];
        });
        P.forEach((p, i) => {
          const doc = i < DOCS.length;
          const c = doc ? DOCS[i][1] : i % 6;
          const [cx, cy, cz] = centers[c];
          const s = doc ? 0.08 : 0.14;
          Object.assign(p, { role: doc ? 'doc' : 'pt', cluster: c, label: doc ? DOCS[i][0] : '', bx: cx + gauss() * s, by: cy + gauss() * s * 0.8, bz: cz + gauss() * s, col: c, tsize: doc ? 4.8 : 2.1, talpha: doc ? 1 : 0.72 });
        });
        // A sparse nearest-neighbour graph inside each cluster, so the space reads as a network.
        links = [];
        for (let c = 0; c < 6; c++) {
          const group = P.filter((p) => p.role === 'pt' && p.cluster === c);
          for (const p of group) {
            let best: [Particle | null, number] = [null, 9];
            let second: [Particle | null, number] = [null, 9];
            for (const o of group) {
              if (o === p) continue;
              // Squared distances: the same ranking without a square root per pair.
              const dx = o.bx - p.bx;
              const dy = o.by - p.by;
              const dz = o.bz - p.bz;
              const d = dx * dx + dy * dy + dz * dz;
              if (d < best[1]) {
                second = best;
                best = [o, d];
              } else if (d < second[1]) second = [o, d];
            }
            if (best[0] && best[1] < 0.0081) links.push([p, best[0]]);
            if (second[0] && second[1] < 0.0081 && Math.random() < 0.5) links.push([p, second[0]]);
          }
        }
        q.x = W * 0.6;
        q.y = H * 0.45;
        burst = -1;
      },
      camera: () => [T * 0.18 + tilt(), 0.28 + (pointer.inside ? (pointer.y / H - 0.5) * 0.3 : 0)],
      update() {
        for (const p of P) {
          if (p.role !== 'pt' && p.role !== 'doc') continue;
          const b = 1 + 0.025 * Math.sin(T * 0.9 + p.ph);
          p.tx = p.bx * b;
          p.ty = p.by * b;
          p.tz = p.bz * b;
        }
      },
      under() {
        ctx.lineWidth = 1;
        for (const [a, b] of links) {
          const [ax, ay, ak] = screenOf(a);
          const [bx, by] = screenOf(b);
          ctx.globalAlpha = 0.16 * ak * a.alpha;
          ctx.strokeStyle = HUES[a.cluster];
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      },
      over() {
        const tx = pointer.inside ? pointer.x : W * (0.5 + 0.3 * Math.sin(T * 0.37));
        const ty = pointer.inside ? pointer.y : H * (0.45 + 0.24 * Math.sin(T * 0.53 + 1));
        q.x += (tx - q.x) * 0.2;
        q.y += (ty - q.y) * 0.2;
        ctx.font = mono(phone ? 10 : 12);
        centers.forEach(([cx, cy, cz], c) => {
          const [sx, sy, k] = project(cx, cy - 0.3, cz);
          ctx.globalAlpha = 0.45 + 0.4 * k;
          ctx.textAlign = 'center';
          halo(TOPICS[c].toUpperCase(), sx, sy);
          ctx.fillStyle = HUES[c];
          ctx.fillText(TOPICS[c].toUpperCase(), sx, sy);
          ctx.textAlign = 'left';
        });
        ctx.globalAlpha = 1;
        const top = P.filter((p) => p.role === 'doc' && p.alpha > 0.5)
          .map((p) => {
            const [sx, sy] = screenOf(p);
            return { p, sx, sy, d: Math.hypot(sx - q.x, sy - q.y) };
          })
          .sort((a, b) => a.d - b.d)
          .slice(0, 4);
        // Each match: a line from the query, and a numbered dot that matches its row in the results panel.
        top.forEach((d, i) => {
          ctx.strokeStyle = HUES[d.p.cluster];
          ctx.lineWidth = 2.4 - i * 0.4;
          ctx.globalAlpha = 0.9 - i * 0.15;
          ctx.beginPath();
          ctx.moveTo(q.x, q.y);
          ctx.lineTo(d.sx, d.sy);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.arc(d.sx, d.sy, 8, 0, TAU);
          ctx.fillStyle = HUES[d.p.cluster];
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#fff';
          ctx.stroke();
          ctx.font = mono(10);
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText(String(i + 1), d.sx, d.sy + 3.5);
          ctx.textAlign = 'left';
        });
        // The results panel, like a search engine's: rank, document and similarity, always in the same corner.
        const rowH = phone ? 17 : 20;
        ctx.font = mono(phone ? 11 : 12.5);
        const widest = Math.max(0, ...top.map((d, i) => ctx.measureText(`${i + 1}  ${d.p.label}`).width));
        const pw = Math.max(phone ? 178 : 220, widest + (phone ? 64 : 76));
        const ph = 26 + top.length * rowH;
        const px = 4;
        const py = (barAtTop ? H - 16 : barTop - 10) - ph;
        ctx.fillStyle = 'rgba(255,255,255,0.94)';
        ctx.strokeStyle = 'rgba(17,19,24,0.14)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(px, py, pw, ph, 12);
        ctx.fill();
        ctx.stroke();
        ctx.font = mono(phone ? 9.5 : 10.5);
        ctx.fillStyle = '#6b7080';
        ctx.fillText('TOP 4 · NEAREST TO QUERY', px + 12, py + 17);
        top.forEach((d, i) => {
          const y = py + 22 + (i + 1) * rowH - 5;
          ctx.font = mono(phone ? 11 : 12.5);
          ctx.fillStyle = HUES[d.p.cluster];
          ctx.fillText(`${i + 1}  ${d.p.label}`, px + 12, y);
          // Similarity from distance, 1 / (1 + d), with d in embedding units.
          const score = (1 / (1 + d.d / unit)).toFixed(2);
          ctx.fillStyle = INK;
          ctx.textAlign = 'right';
          ctx.fillText(score, px + pw - 12, y);
          ctx.textAlign = 'left';
        });
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 9, 0, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(q.x - 16, q.y);
        ctx.lineTo(q.x - 5, q.y);
        ctx.moveTo(q.x + 5, q.y);
        ctx.lineTo(q.x + 16, q.y);
        ctx.moveTo(q.x, q.y - 16);
        ctx.lineTo(q.x, q.y - 5);
        ctx.moveTo(q.x, q.y + 5);
        ctx.lineTo(q.x, q.y + 16);
        ctx.stroke();
        if (burst >= 0) {
          const k = (T - burst) / 0.6;
          if (k < 1) {
            ctx.globalAlpha = 1 - k;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(q.x, q.y, 10 + k * 150, 0, TAU);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      },
      tap() {
        burst = T;
      },
      hud: () => `embed · 6 topics · ${DOCS.length} documents\n${pointer.inside ? 'your cursor is the query' : 'query → its 4 nearest documents'}`,
    };
  }

  /* ---------- 02 · Attend: particles stream along attention weights between the words of the tagline ---------- */
  function attendStage(): Stage {
    const n = WORDS.length;
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    const dim = 8;
    const E = WORDS.map(() => Array.from({ length: dim }, rnd));
    // softmax(QKᵀ / √d) for three heads over seeded embeddings, with a different positional bias per head.
    const heads = [0, 1, 2].map((hd) => {
      const Wq = Array.from({ length: dim * dim }, rnd);
      const Wk = Array.from({ length: dim * dim }, rnd);
      const proj = (e: number[], M: number[]) => Array.from({ length: dim }, (_, i) => e.reduce((a, v, j) => a + v * M[i * dim + j], 0));
      const Q = E.map((e) => proj(e, Wq));
      const K = E.map((e) => proj(e, Wk));
      return Q.map((q, i) => {
        const sc = K.map((k, j) => (q.reduce((a, v, d) => a + v * k[d], 0) / Math.sqrt(dim)) * 1.6 - Math.abs(i - j) * [0.1, 0.8, 0][hd] + (hd === 2 && j === 2 ? 1.2 : 0));
        const mx = Math.max(...sc);
        const ex = sc.map((v) => Math.exp(v - mx));
        const z = ex.reduce((a, b) => a + b);
        return ex.map((v) => v / z);
      });
    });
    const colors = ['#4556d9', '#0a7d51', '#b51c79'];
    let focus = 2;
    let head = 0;
    let clock = 0;
    const ypos = (i: number) => -0.78 + (1.56 * i) / (n - 1);
    function assign() {
      const att = heads[head];
      const strong = Math.floor(N * 0.68);
      const cum: number[] = [];
      let acc = 0;
      att[focus].forEach((w) => cum.push((acc += w)));
      P.forEach((p, i) => {
        let a = focus;
        let b = 0;
        if (i < strong) {
          const r = Math.random() * acc;
          b = Math.max(0, cum.findIndex((c) => c >= r));
        } else {
          a = Math.floor(Math.random() * n);
          let r = Math.random();
          let j = 0;
          while (j < n - 1 && (r -= att[a][j]) > 0) j++;
          b = j;
        }
        Object.assign(p, { role: 'flow', a, b, s: Math.random(), sp: 0.28 + Math.random() * 0.22, col: [4, 2, 5][head], tsize: i < strong ? 2.6 : 1.6, talpha: i < strong ? 0.95 : 0.25 });
      });
    }
    return {
      title: 'Attend',
      enter() {
        focus = 2;
        head = 0;
        clock = 0;
        assign();
      },
      camera: () => [0.32 * Math.sin(T * 0.3) + tilt(), 0.08],
      update(dt) {
        if (pointer.inside) {
          let best = -1;
          let bd = 1e9;
          for (let i = 0; i < n; i++) {
            const [sx, sy] = project(-0.86, ypos(i), 0);
            const d = Math.hypot(sx - pointer.x, sy - pointer.y);
            if (d < bd) {
              bd = d;
              best = i;
            }
          }
          if (bd < 70 && best !== focus) {
            focus = best;
            assign();
          }
        } else if ((clock += dt) > 0.85) {
          clock = 0;
          focus = (focus + 1) % n;
          if (!focus) head = (head + 1) % 3;
          assign();
        }
        for (const p of P) {
          if (p.role !== 'flow') continue;
          p.s += dt * p.sp;
          if (p.s > 1) p.s -= 1;
          const s = p.s;
          const u = 1 - s;
          const ya = ypos(p.a);
          const yb = ypos(p.b);
          p.tx = u * u * u * -0.78 + 3 * u * u * s * -0.15 + 3 * u * s * s * 0.15 + s * s * s * 0.78;
          p.ty = u * u * u * ya + 3 * u * u * s * ya + 3 * u * s * s * yb + s * s * s * yb + Math.sin(p.ph + s * 6) * 0.008;
          p.tz = Math.sin(Math.PI * s) * 0.32 * ((p.b - p.a) / n) + Math.cos(p.ph) * 0.02;
        }
      },
      under() {
        const att = heads[head];
        ctx.strokeStyle = colors[head];
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            const w = att[i][j];
            if (w < 0.05) continue;
            ctx.globalAlpha = (i === focus ? 0.22 : 0.06) * Math.min(1, w * 3);
            ctx.lineWidth = i === focus ? 1 + w * 10 : 1;
            const [ax, ay] = project(-0.78, ypos(i), 0);
            const [bx, by] = project(0.78, ypos(j), 0);
            const mx = (ax + bx) / 2;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.bezierCurveTo(mx, ay, mx, by, bx, by);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      },
      over() {
        ctx.font = sans(phone ? 13 : 16);
        for (let i = 0; i < n; i++) {
          const [lx, ly] = project(-0.86, ypos(i), 0);
          const [rx, ry] = project(0.86, ypos(i), 0);
          ctx.textAlign = 'right';
          ctx.fillStyle = i === focus ? colors[head] : INK;
          ctx.fillText(WORDS[i], lx, ly + 5);
          ctx.textAlign = 'left';
          ctx.globalAlpha = 0.35 + heads[head][focus][i] * 0.65;
          ctx.fillStyle = INK;
          ctx.fillText(WORDS[i], rx, ry + 5);
          ctx.globalAlpha = 1;
        }
        ctx.textAlign = 'left';
        if (phone) return;
        ctx.font = mono(11);
        ctx.fillStyle = '#8a909c';
        const [qx, qy] = project(-0.86, -0.98, 0);
        const [kx, ky] = project(0.86, -0.98, 0);
        ctx.textAlign = 'right';
        ctx.fillText('QUERY', qx, qy);
        ctx.textAlign = 'left';
        ctx.fillText('KEY', kx, ky);
      },
      tap() {
        head = (head + 1) % 3;
        assign();
      },
      hud: () => `attend · head ${head + 1}/3 · query "${WORDS[focus]}"\nsoftmax(QKᵀ / √d), computed live`,
    };
  }

  /* ---------- 03 · Fire: a 4-7-7-4 network made of particles; signals travel along its weights ---------- */
  function fireStage(): Stage {
    let nodes: Neuron[] = [];
    let edges: Synapse[] = [];
    const out = ['RAG', 'agents', 'vision', 'fine-tuning'];
    const layerHue = [0, 4, 1, 5];
    let clock = 0;
    let count = 0;
    function fireNode(node: Neuron) {
      node.act = 1;
      if (node.l === 3) return;
      for (const e of edges) {
        if (e.a !== node || e.w <= -0.3) continue;
        const p = P.find((o) => o.role === 'sig' && !o.busy);
        if (!p) return;
        Object.assign(p, { busy: true, edge: e, s: 0, col: layerHue[e.b.l], tsize: 3.4, talpha: 1, x: e.a.x, y: e.a.y, z: e.a.z, vx: 0, vy: 0, vz: 0 });
      }
    }
    return {
      title: 'Fire',
      enter() {
        const sizes = [4, 7, 7, 4];
        // Narrower on phones, so the output labels fit inside the canvas.
        const x0 = phone ? -0.9 : -0.82;
        const span = phone ? 1.28 : 1.64;
        nodes = [];
        sizes.forEach((n, l) => {
          for (let i = 0; i < n; i++) nodes.push({ l, x: x0 + (span * l) / 3, y: -0.72 + (1.44 * (i + (7 - n) / 2)) / 6, z: l % 2 ? 0.12 : -0.12, act: 0, charge: 0 });
        });
        edges = [];
        for (const a of nodes) for (const b of nodes) if (b.l === a.l + 1) edges.push({ a, b, w: gauss() });
        const ring = 14;
        let i = 0;
        for (const node of nodes) for (let r = 0; r < ring; r++, i++) Object.assign(P[i], { role: 'ring', node, ang: (r / ring) * TAU, col: layerHue[node.l], tsize: 2.6, talpha: 0.9 });
        for (; i < N; i++) {
          park(P[i]);
          P[i].role = 'sig';
          P[i].busy = false;
        }
        clock = 0;
        count = 0;
      },
      camera: () => [0.38 * Math.sin(T * 0.27) + tilt(), 0.14],
      update(dt) {
        if ((clock += dt) > 0.26) {
          clock = 0;
          fireNode(nodes[Math.floor(Math.random() * 4)]);
        }
        if (pointer.inside) {
          for (const n of nodes) {
            const [sx, sy] = project(n.x, n.y, n.z);
            if (Math.hypot(sx - pointer.x, sy - pointer.y) < 34 && n.act < 0.3) fireNode(n);
          }
        }
        count = 0;
        for (const p of P) {
          if (p.role === 'ring' && p.node) {
            const n = p.node;
            const r = 0.05 * (1 + n.act * 0.6);
            p.tx = n.x + Math.cos(p.ang + T * 0.6) * r;
            p.ty = n.y + Math.sin(p.ang + T * 0.6) * r;
            p.tz = n.z;
            p.talpha = 0.4 + n.act * 0.6;
            p.tsize = 2.1 + n.act * 1.2;
          } else if (p.role === 'sig' && p.busy && p.edge) {
            count++;
            p.s += dt / 0.34;
            const e = p.edge;
            if (p.s >= 1) {
              p.busy = false;
              p.talpha = 0;
              e.b.charge += Math.max(0.25, e.w * 0.5);
              if (e.b.charge > 0.9) {
                e.b.charge = 0;
                fireNode(e.b);
              }
              continue;
            }
            p.tx = e.a.x + (e.b.x - e.a.x) * p.s;
            p.ty = e.a.y + (e.b.y - e.a.y) * p.s;
            p.tz = e.a.z + (e.b.z - e.a.z) * p.s;
            p.x = p.tx;
            p.y = p.ty;
            p.z = p.tz;
          }
        }
        for (const n of nodes) {
          n.act = Math.max(0, n.act - dt * 1.4);
          n.charge = Math.max(0, n.charge - dt * 0.3);
        }
      },
      under() {
        ctx.lineWidth = 1;
        for (const e of edges) {
          const [ax, ay] = project(e.a.x, e.a.y, e.a.z);
          const [bx, by] = project(e.b.x, e.b.y, e.b.z);
          ctx.strokeStyle = e.w > 0 ? 'rgba(17,19,24,0.13)' : 'rgba(17,19,24,0.05)';
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      },
      over() {
        for (const n of nodes) {
          const [sx, sy, k] = project(n.x, n.y, n.z);
          const r = 0.05 * (1 + n.act * 0.6) * unit * k;
          ctx.beginPath();
          ctx.arc(sx, sy, r * 0.82, 0, TAU);
          ctx.fillStyle = HUES[layerHue[n.l]];
          ctx.globalAlpha = 0.1 + n.act * 0.75;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        for (const p of P) {
          if (p.role !== 'sig' || !p.busy || !p.edge) continue;
          const e = p.edge;
          const s0 = Math.max(0, p.s - 0.16);
          const [ax, ay] = project(e.a.x + (e.b.x - e.a.x) * s0, e.a.y + (e.b.y - e.a.y) * s0, e.a.z + (e.b.z - e.a.z) * s0);
          const [bx, by] = screenOf(p);
          const grad = ctx.createLinearGradient(ax, ay, bx, by);
          grad.addColorStop(0, 'rgba(255,255,255,0)');
          grad.addColorStop(1, HUES[p.col]);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
        ctx.font = mono(phone ? 11 : 12);
        nodes
          .filter((n) => n.l === 3)
          .forEach((n, i) => {
            const [sx, sy] = project(n.x, n.y, n.z);
            ctx.fillStyle = n.act > 0.15 ? HUES[5] : '#7b8190';
            ctx.fillText(out[i], sx + (phone ? 13 : 18), sy + 4);
          });
      },
      tap() {
        nodes.filter((n) => n.l === 0).forEach(fireNode);
      },
      hud: () => `fire · forward pass 4 → 7 → 7 → 4\n${count} signals in flight`,
    };
  }

  /* ---------- 04 · Learn: a real 2-12-12-1 network trains on two moons; its decision boundary is made of particles ---------- */
  function learnStage(): Stage {
    let net = createNet(12);
    let epoch = 0;
    let stats = { loss: 0.69, acc: 0.5 };
    let data: Sample[] = [];
    const G = 44;
    const cells = new Float32Array(G * G);
    const field = document.createElement('canvas');
    field.width = field.height = G;
    const fctx = field.getContext('2d');
    const img = fctx ? fctx.createImageData(G, G) : null;
    const box = () => {
      const [x0, y0] = project(-0.92, -0.92, 0);
      const [x1, y1] = project(0.92, 0.92, 0);
      return { x0, y0, x1, y1 };
    };
    const toUV = (x: number, y: number) => {
      const b = box();
      return [((x - b.x0) / (b.x1 - b.x0)) * 2 - 1, ((y - b.y0) / (b.y1 - b.y0)) * 2 - 1];
    };
    return {
      title: 'Learn',
      enter() {
        net = createNet(12);
        epoch = 0;
        stats = { loss: 0.69, acc: 0.5 };
        data = [];
        const D = phone ? 70 : 110;
        for (let i = 0; i < D; i++) {
          const c = i % 2;
          const a = Math.PI * Math.random();
          const x = c ? 1 - Math.cos(a) : Math.cos(a);
          const y = c ? 0.45 - Math.sin(a) : Math.sin(a) - 0.05;
          data.push({ u: (x - 0.5) * 0.62 + gauss() * 0.05, v: -(y - 0.2) * 0.85 + gauss() * 0.06, c });
        }
        let i = 0;
        for (const d of data) Object.assign(P[i++], { role: 'data', d, col: d.c ? 0 : 1, tsize: 3.6, talpha: 1 });
        for (; i < N; i++) Object.assign(P[i], { role: 'edge', col: 6, tsize: 1.5, talpha: 0.85 });
      },
      camera: () => [0, 0],
      update() {
        for (let k = 0; k < 6; k++) {
          stats = net.train(data, 0.035);
          epoch++;
        }
        for (let j = 0; j < G; j++) {
          for (let i = 0; i < G; i++) {
            const y = net.forward((i / (G - 1)) * 2 - 1, (j / (G - 1)) * 2 - 1);
            const k = j * G + i;
            cells[k] = y;
            if (!img) continue;
            const c = Math.min(1, Math.abs(y - 0.5) * 2.2) * 0.42;
            const A = y > 0.5 ? [113, 200, 255] : [208, 169, 254];
            img.data[k * 4] = 255 + (A[0] - 255) * c;
            img.data[k * 4 + 1] = 255 + (A[1] - 255) * c;
            img.data[k * 4 + 2] = 255 + (A[2] - 255) * c;
            img.data[k * 4 + 3] = 255;
          }
        }
        if (fctx && img) fctx.putImageData(img, 0, 0);
        // Marching squares on the 0.5 level gives the decision boundary; edge particles spread evenly along it.
        const segs: [[number, number], [number, number], number][] = [];
        const L = (a: number, b: number) => (0.5 - a) / (b - a);
        const wpt = (i: number, j: number): [number, number] => [((i / (G - 1)) * 2 - 1) * 0.92, ((j / (G - 1)) * 2 - 1) * 0.92];
        for (let j = 0; j < G - 1; j++) {
          for (let i = 0; i < G - 1; i++) {
            const a = cells[j * G + i];
            const b = cells[j * G + i + 1];
            const c = cells[(j + 1) * G + i + 1];
            const e = cells[(j + 1) * G + i];
            const q: [number, number][] = [];
            if (a > 0.5 !== b > 0.5) q.push(wpt(i + L(a, b), j));
            if (b > 0.5 !== c > 0.5) q.push(wpt(i + 1, j + L(b, c)));
            if (e > 0.5 !== c > 0.5) q.push(wpt(i + L(e, c), j + 1));
            if (a > 0.5 !== e > 0.5) q.push(wpt(i, j + L(a, e)));
            if (q.length >= 2) segs.push([q[0], q[1], Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1])]);
          }
        }
        const total = segs.reduce((s, x) => s + x[2], 0) || 1;
        const edgeParts = P.filter((p) => p.role === 'edge');
        let si = 0;
        let acc = 0;
        edgeParts.forEach((p, n) => {
          const at = ((n + 0.5) / edgeParts.length) * total;
          while (si < segs.length - 1 && acc + segs[si][2] < at) acc += segs[si++][2];
          const sg = segs[si];
          if (!sg) return;
          const f = sg[2] ? (at - acc) / sg[2] : 0;
          p.tx = sg[0][0] + (sg[1][0] - sg[0][0]) * f;
          p.ty = sg[0][1] + (sg[1][1] - sg[0][1]) * f;
          p.tz = 0;
        });
        for (const p of P) {
          if (p.role !== 'data' || !p.d) continue;
          p.tx = p.d.u * 0.92;
          p.ty = p.d.v * 0.92;
          p.tz = 0;
        }
      },
      under() {
        const b = box();
        ctx.globalAlpha = clamp(P[0].alpha * 1.2, 0, 1);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(field, b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(17,19,24,0.12)';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
      },
      over() {
        if (!pointer.inside) return;
        const [u, v] = toUV(pointer.x, pointer.y);
        if (Math.abs(u) > 1 || Math.abs(v) > 1) return;
        const y = net.forward(u, v);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 11, 0, TAU);
        ctx.stroke();
        ctx.font = mono(12);
        ctx.fillStyle = INK;
        ctx.fillText(`p(blue) = ${y.toFixed(2)}`, pointer.x + 16, pointer.y + 4);
      },
      tap(x, y) {
        const [u, v] = toUV(x, y);
        if (Math.abs(u) > 1 || Math.abs(v) > 1) return;
        // A point the network currently gets wrong, so it has to learn again.
        const d = { u, v, c: net.forward(u, v) > 0.5 ? 0 : 1 };
        data.push(d);
        const p = P.find((o) => o.role === 'edge');
        if (p) Object.assign(p, { role: 'data', d, col: d.c ? 0 : 1, tsize: 5, talpha: 1 });
      },
      hud: () => `learn · epoch ${epoch.toLocaleString('en-IN')}\nloss ${stats.loss < 0.001 ? stats.loss.toExponential(1) : stats.loss.toFixed(3)} · accuracy ${Math.round(stats.acc * 100)}%`,
    };
  }

  /* ---------- 05 · Descend: a rotating 3D loss terrain of particles; SGD, Momentum and Adam race to the minimum ---------- */
  function descendStage(): Stage {
    const wells = [
      [0.35, 0.2, 0.32, 1.0],
      [-0.45, -0.25, 0.26, 0.75],
      [0.5, -0.6, 0.22, 0.55],
      [-0.2, 0.62, 0.25, 0.6],
    ];
    const f = (x: number, z: number) => {
      // The floor sits just above zero, so no optimizer ever reports a negative loss.
      let v = 0.72 + 0.07 * Math.sin(x * 4.5 + T * 0.4) * Math.cos(z * 3.6 - T * 0.3);
      for (const [cx, cz, r, d] of wells) {
        const dx = x - cx;
        const dz = z - cz;
        v -= d * Math.exp(-(dx * dx + dz * dz) / (2 * r * r)) * 0.62;
      }
      return v;
    };
    const height = (x: number, z: number) => 0.305 - f(x, z) * 0.85;
    let R = 24;
    let C = 34;
    const gx = (c: number) => -0.95 + (1.9 * c) / (C - 1);
    const gz = (r: number) => -0.95 + (1.9 * r) / (R - 1);
    type Ball = { name: string; color: string; mom: number; x: number; z: number; vx: number; vz: number; m: number[]; v: number[]; k: number; trail: [number, number][]; loss: number };
    let balls: Ball[] = [];
    const drop = (x: number, z: number) => {
      balls = (
        [
          ['SGD', '#0171a3', 0],
          ['Momentum', '#c2410c', 0.9],
          ['Adam', '#853dc2', 0],
        ] as [string, string, number][]
      ).map(([name, color, mom], i) => ({ name, color, mom, x: x + i * 0.05, z: z + i * 0.04, vx: 0, vz: 0, m: [0, 0], v: [0, 0], k: 0, trail: [], loss: f(x, z) }));
    };
    let terrain: Particle[] = [];
    return {
      title: 'Descend',
      enter() {
        R = phone ? 18 : 24;
        C = phone ? 26 : 34;
        let i = 0;
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++, i++) if (i < N) Object.assign(P[i], { role: 'ter', gi: r, gj: c, col: 6, tsize: 1.3, talpha: 0.75 });
        for (; i < N; i++) park(P[i]);
        terrain = P.filter((p) => p.role === 'ter');
        drop(-0.85, -0.8);
      },
      camera: () => [-0.5 + T * 0.14 + tilt(), 0.62],
      update() {
        for (const p of terrain) {
          const x = gx(p.gj);
          const z = gz(p.gi);
          p.tx = x;
          p.tz = z;
          p.ty = height(x, z);
        }
        const e = 1e-3;
        for (const b of balls) {
          for (let k = 0; k < 3; k++) {
            const gX = (f(b.x + e, b.z) - f(b.x - e, b.z)) / (2 * e);
            const gZ = (f(b.x, b.z + e) - f(b.x, b.z - e)) / (2 * e);
            b.k++;
            if (b.name === 'Adam') {
              const g = [gX, gZ];
              for (let i = 0; i < 2; i++) {
                b.m[i] = 0.9 * b.m[i] + 0.1 * g[i];
                b.v[i] = 0.999 * b.v[i] + 0.001 * g[i] * g[i];
              }
              const mh = b.m.map((m) => m / (1 - 0.9 ** b.k));
              const vh = b.v.map((v) => v / (1 - 0.999 ** b.k));
              b.vx = (0.006 * mh[0]) / (Math.sqrt(vh[0]) + 1e-8);
              b.vz = (0.006 * mh[1]) / (Math.sqrt(vh[1]) + 1e-8);
              b.x -= b.vx;
              b.z -= b.vz;
            } else {
              b.vx = b.mom * b.vx - 0.004 * gX;
              b.vz = b.mom * b.vz - 0.004 * gZ;
              b.x += b.vx;
              b.z += b.vz;
            }
            b.x = clamp(b.x, -0.95, 0.95);
            b.z = clamp(b.z, -0.95, 0.95);
          }
          b.loss = f(b.x, b.z);
          b.trail.push([b.x, b.z]);
          if (b.trail.length > 260) b.trail.shift();
        }
        if (balls.every((b) => Math.hypot(b.vx, b.vz) < 4e-4) && balls[0].k > 360) drop(Math.random() < 0.5 ? -0.85 : 0.85, (Math.random() * 2 - 1) * 0.8);
      },
      under() {
        ctx.lineWidth = 1;
        const fade = terrain[0] ? terrain[0].alpha : 0;
        for (let r = 0; r < R; r++) {
          ctx.beginPath();
          for (let c = 0; c < C; c++) {
            const p = terrain[r * C + c];
            if (!p) continue;
            const [sx, sy] = screenOf(p);
            if (c) ctx.lineTo(sx, sy);
            else ctx.moveTo(sx, sy);
          }
          const [, , k] = project(0, 0, gz(r));
          ctx.strokeStyle = `rgba(17,19,24,${(0.12 + 0.3 * k * k) * fade})`;
          ctx.stroke();
        }
      },
      over() {
        const placed: number[][] = [];
        for (const b of balls) {
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 3.2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          b.trail.forEach(([x, z], i) => {
            const [sx, sy] = project(x, height(x, z) - 0.015, z);
            if (i) ctx.lineTo(sx, sy);
            else ctx.moveTo(sx, sy);
          });
          ctx.stroke();
          const [sx, sy] = project(b.x, height(b.x, b.z) - 0.02, b.z);
          ctx.beginPath();
          ctx.arc(sx, sy, 7.5, 0, TAU);
          ctx.fillStyle = b.color;
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#fff';
          ctx.stroke();
        }
        // Labels go on last, so no ball or trail is drawn over another optimizer's name.
        ctx.font = mono(11);
        for (const b of balls) {
          const [sx, sy] = project(b.x, height(b.x, b.z) - 0.02, b.z);
          const label = `${b.name} ${b.loss.toFixed(2)}`;
          const lw = ctx.measureText(label).width;
          const lx = clamp(sx + 11, 4, W - lw - 4);
          let ly = sy - 9;
          while (placed.some(([x, y, w]) => lx < x + w && x < lx + lw && Math.abs(y - ly) < 13)) ly -= 13;
          placed.push([lx, ly, lw]);
          halo(label, lx, ly);
          ctx.fillStyle = b.color;
          ctx.fillText(label, lx, ly);
        }
      },
      tap(x, y) {
        let best: Particle | null = null;
        let bd = 1e9;
        for (const p of terrain) {
          const [sx, sy] = screenOf(p);
          const d = Math.hypot(sx - x, sy - y);
          if (d < bd) {
            bd = d;
            best = p;
          }
        }
        if (best) drop(gx(best.gj), gz(best.gi));
      },
      hud: () => {
        const best = balls.reduce((a, b) => (b.loss < a.loss ? b : a), balls[0]);
        return `descend · SGD vs Momentum vs Adam\nlowest loss ${best ? `${best.loss.toFixed(3)} · ${best.name}` : ''}`;
      },
    };
  }

  /* ---------- 06 · Generate: diffusion samples a brain out of 3D noise in 40 steps, then its neurons fire ---------- */
  function brainPoints(count: number) {
    // A side view of a brain facing left, in a 240 px box: cerebrum, cerebellum and brainstem, with the main folds.
    const cerebrum = new Path2D();
    cerebrum.moveTo(52, 132);
    cerebrum.bezierCurveTo(30, 112, 32, 70, 62, 52);
    cerebrum.bezierCurveTo(84, 36, 116, 30, 146, 34);
    cerebrum.bezierCurveTo(178, 38, 204, 60, 208, 92);
    cerebrum.bezierCurveTo(212, 116, 200, 134, 180, 138);
    cerebrum.bezierCurveTo(166, 141, 156, 140, 146, 146);
    cerebrum.bezierCurveTo(128, 156, 104, 158, 86, 152);
    cerebrum.bezierCurveTo(72, 148, 60, 142, 52, 132);
    cerebrum.closePath();
    const cerebellum = new Path2D();
    cerebellum.ellipse(170, 150, 32, 19, -0.12, 0, TAU);
    const stem = new Path2D();
    stem.moveTo(128, 148);
    stem.bezierCurveTo(133, 164, 134, 178, 131, 194);
    stem.lineTo(145, 194);
    stem.bezierCurveTo(147, 178, 147, 164, 145, 148);
    stem.closePath();
    const folds = new Path2D();
    const fold = (...c: number[]) => {
      folds.moveTo(c[0], c[1]);
      folds.bezierCurveTo(c[2], c[3], c[4], c[5], c[6], c[7]);
    };
    fold(66, 122, 92, 108, 122, 104, 156, 100); // lateral sulcus
    fold(128, 34, 122, 56, 132, 72, 118, 104); // central sulcus
    fold(56, 78, 72, 70, 82, 84, 98, 74);
    fold(48, 104, 66, 96, 78, 108, 100, 96);
    fold(84, 46, 92, 56, 104, 52, 108, 66);
    fold(66, 62, 76, 56, 86, 64, 94, 58);
    fold(104, 84, 112, 76, 106, 92, 116, 88);
    fold(146, 40, 144, 58, 160, 64, 152, 84);
    fold(176, 52, 168, 70, 186, 80, 178, 98);
    fold(196, 82, 184, 98, 200, 108, 190, 124);
    fold(160, 104, 168, 96, 176, 112, 186, 106);
    fold(80, 138, 100, 130, 122, 134, 142, 124);
    fold(144, 146, 158, 140, 182, 140, 198, 146); // cerebellum folia
    fold(146, 154, 162, 150, 184, 150, 198, 156);
    fold(152, 162, 166, 160, 182, 160, 192, 164);
    const S = 240;
    const off = document.createElement('canvas');
    off.width = off.height = S;
    const o = off.getContext('2d', { willReadFrequently: true });
    const out: [number, number, number, number][] = [];
    if (!o) return out;
    o.lineJoin = 'round';
    o.lineCap = 'round';
    o.lineWidth = 3.2;
    o.stroke(stem);
    o.stroke(cerebellum);
    o.stroke(cerebrum);
    o.stroke(folds);
    const line = o.getImageData(0, 0, S, S).data;
    o.clearRect(0, 0, S, S);
    o.fill(stem);
    o.fill(cerebellum);
    o.fill(cerebrum);
    const fill = o.getImageData(0, 0, S, S).data;
    const at = (d: Uint8ClampedArray, x: number, y: number) => d[(Math.floor(y) * S + Math.floor(x)) * 4 + 3];
    // The colors of a brain atlas: frontal, parietal, occipital and temporal lobes, cerebellum, brainstem.
    const lobe = (x: number, y: number) => {
      if (y > 156 && x > 124 && x < 150) return 4;
      if (Math.hypot((x - 170) / 32, (y - 150) / 19) < 1 && y > 136) return 5;
      if (y > 122 - ((x - 66) / 90) * 22 && x < 160) return 3;
      if (x < 128 - ((y - 34) / 70) * 10) return 0;
      return x < 172 ? 1 : 2;
    };
    for (let t = 0; out.length < count * 0.62 && t < 300000; t++) {
      const x = Math.random() * S;
      const y = Math.random() * S;
      if (at(line, x, y) > 120) out.push([(x / S) * 2 - 1, (y / S) * 2 - 1, lobe(x, y), 1]);
    }
    for (let t = 0; out.length < count && t < 300000; t++) {
      const x = Math.random() * S;
      const y = Math.random() * S;
      if (at(fill, x, y) > 120 && at(line, x, y) < 40) out.push([(x / S) * 2 - 1, (y / S) * 2 - 1, lobe(x, y), 0]);
    }
    return out;
  }

  function generateStage(): Stage {
    let step = 0;
    let level = 1;
    let clock = 0;
    return {
      title: 'Generate',
      enter() {
        const pts = brainPoints(N);
        P.forEach((p, i) => {
          if (i < pts.length) {
            const [x, y, lobe, edge] = pts[i];
            const base = edge ? 1.8 + Math.random() * 0.8 : 1.2 + Math.random() * 0.6;
            Object.assign(p, { role: 'gen', x0: x * 0.98, y0: y * 0.98, cluster: lobe, a: edge, sp: base, nx: gauss() * 0.7, ny: gauss() * 0.7, nz: gauss() * 0.7, col: 7, tsize: base, talpha: 0.9 });
          } else park(p);
        });
        step = 0;
        level = 1;
        clock = 0;
      },
      camera: () => [0.6 * Math.sin(T * 0.5) * level + (level === 0 ? 0.16 * Math.sin(T * 0.8) : 0), 0.1 * level],
      update(dt) {
        if (level > 0 && (clock += dt) > 0.045) {
          clock = 0;
          step++;
          level = Math.max(0, 1 - step / 40);
          for (const p of P) {
            if (p.role !== 'gen') continue;
            p.nx = 0.55 * p.nx + 0.84 * gauss() * 0.7;
            p.ny = 0.55 * p.ny + 0.84 * gauss() * 0.7;
            p.nz = 0.55 * p.nz + 0.84 * gauss() * 0.7;
          }
        }
        const ab = Math.cos((level * Math.PI) / 2) ** 2;
        const a = Math.sqrt(ab);
        const b = Math.sqrt(1 - ab);
        // Once sampled, a wave of thought sweeps front to back and single neurons flash.
        const wave = ((T * 0.55) % 1.5) - 0.25;
        for (const p of P) {
          if (p.role !== 'gen') continue;
          p.tx = a * p.x0 + b * p.nx;
          p.ty = a * p.y0 + b * p.ny;
          p.tz = b * p.nz;
          if (level > 0.15) {
            p.col = 7;
            continue;
          }
          p.col = p.cluster;
          const near = Math.max(0, 1 - Math.abs((p.x0 + 1) / 2 - wave) / 0.07);
          const spark = (T * 1.4 + p.ph * 5) % 3.2 < 0.07 ? 1 : 0;
          p.tsize = p.sp * (1 + near * 0.9 + spark * 1.6);
          p.talpha = p.a ? 0.95 : 0.5 + near * 0.45;
        }
      },
      tap() {
        step = 0;
        level = 1;
      },
      hud: () => (level > 0 ? `generate · sampling step ${step} / 40\nnoise level ${level.toFixed(2)}` : 'generate · a brain in 40 steps\nneurons firing · tap to resample'),
    };
  }

  /* ---------- The tour ---------- */
  const stages = [embedStage(), attendStage(), fireStage(), learnStage(), descendStage(), generateStage()];
  let si = 0;
  let clock = 0;
  let lastHud = '';

  function size() {
    const r = root.getBoundingClientRect();
    W = r.width;
    H = r.height;
    phone = W < 560;
    const bar = buttons[0]?.parentElement?.getBoundingClientRect();
    barTop = bar ? bar.top - r.top : H;
    barAtTop = barTop < H / 2;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    unit = Math.min(W * 0.44, H * 0.37);
    // A faint lab-notebook dot grid frames the stage.
    grid = document.createElement('canvas');
    grid.width = canvas.width;
    grid.height = canvas.height;
    const g = grid.getContext('2d');
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = '#dfe2ea';
    for (let y = 36; y < H - 40; y += 22) {
      for (let x = 11; x < W; x += 22) {
        const fade = Math.min(1, x / 60, (W - x) / 60, (y - 30) / 50, (H - 44 - y) / 50);
        if (fade <= 0) continue;
        g.globalAlpha = fade;
        g.fillRect(x, y, 1.6, 1.6);
      }
    }
  }

  function draw() {
    const st = stages[si];
    ctx.clearRect(0, 0, W, H);
    if (grid) ctx.drawImage(grid, 0, 0, W, H);
    st.under?.();
    drawParticles();
    st.over?.();
    const text = st.hud();
    if (text !== lastHud) hud.textContent = lastHud = text;
  }

  function aim(dt: number) {
    const [ty, tp] = stages[si].camera();
    // Turn the short way round, so a stage change never spins the view through several turns.
    const dy = ((((ty - cam.yaw + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
    cam.yaw += dy * Math.min(1, dt * 3);
    cam.pitch += (tp - cam.pitch) * Math.min(1, dt * 3);
  }

  function go(i: number) {
    si = i;
    clock = 0;
    stages[si].enter();
    buttons.forEach((b, j) => {
      b.classList.toggle('on', j === si);
      b.setAttribute('aria-pressed', String(j === si));
      b.style.setProperty('--p', '0%');
    });
    if (still) renderStill();
  }

  /** Reduced motion: run the stage forward three seconds off screen, then draw one settled frame. */
  function renderStill() {
    const st = stages[si];
    for (let k = 0; k < 180; k++) {
      T += 1 / 60;
      st.update?.(1 / 60);
    }
    const [ty, tp] = st.camera();
    cam.yaw = ty;
    cam.pitch = tp;
    settle();
    draw();
  }

  const at = (e: PointerEvent) => {
    const r = root.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const onMove = (e: PointerEvent) => {
    [pointer.x, pointer.y] = at(e);
    pointer.inside = true;
    pointer.last = T;
  };
  const onLeave = () => {
    pointer.inside = false;
  };
  const onDown = (e: PointerEvent) => {
    if ((e.target as Element).closest('button')) return;
    const [x, y] = at(e);
    pointer.last = T;
    pointer.tapped = T;
    stages[si].tap?.(x, y);
    if (still) renderStill();
  };
  const clicks = buttons.map((b, i) => {
    const fn = () => go(i);
    b.addEventListener('click', fn);
    return fn;
  });

  let visible = true;
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((x) => x.isIntersecting);
  });
  io.observe(root);
  const ro = new ResizeObserver(() => {
    const was = phone;
    size();
    if (was !== phone) {
      makeParticles();
      go(si);
    } else if (still) renderStill();
  });

  if (!still) {
    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave);
  }
  root.addEventListener('pointerdown', onDown);

  let raf = 0;
  let last = performance.now();
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    if (!visible) return;
    T += dt;
    // Stages advance on their own and never stall: at half speed while someone moves over the lab, held for four seconds after a tap.
    if (T - pointer.tapped >= 4) clock += T - pointer.last < 1.5 ? dt * 0.5 : dt;
    if (clock > DURATION[si]) go((si + 1) % stages.length);
    buttons[si]?.style.setProperty('--p', `${Math.min(100, (clock / DURATION[si]) * 100)}%`);
    aim(dt);
    stages[si].update?.(dt);
    physics(dt);
    draw();
  };
  // Start-up is split across frames, so no single task blocks the page: size and particles, then the first stage, then the loop.
  raf = requestAnimationFrame(() => {
    size();
    makeParticles();
    born = T;
    raf = requestAnimationFrame(() => {
      go(0);
      ro.observe(root);
      if (!still) raf = requestAnimationFrame(loop);
    });
  });

  return {
    destroy() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onDown);
      buttons.forEach((b, i) => b.removeEventListener('click', clicks[i]));
      ctx.clearRect(0, 0, W, H);
    },
  };
}
