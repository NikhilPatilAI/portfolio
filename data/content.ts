// One source of truth for the site, Quick view, /resume, metadata and, later, the Ask Nikhil assistant.
// Every number traces to the metrics ledger in data/profile-research.md (section 10). Never add one that doesn't.
// Copy marked // DRAFT was written by Claude from your sources. Rewrite it in your own voice.
// Privacy: no phone, address, date of birth, salary or notice period anywhere in this file. No SmartCart details.

export type Hue = 'chili' | 'mango' | 'sun' | 'lime' | 'mint' | 'sea' | 'sky' | 'iris' | 'grape' | 'rose';

export type ReceiptId =
  | 'legal-precision'
  | 'legal-verifier'
  | 'rag-hit'
  | 'rag-faith'
  | 'gemma-data'
  | 'gemma-acc'
  | 'grphte-wf'
  | 'grphte-tests'
  | 'eps';

export type GlossId = 'rag' | 'hit' | 'qlora';

/** Inline rich text: plain strings, numbers that open a receipt, and terms with a plain-words gloss. */
export type Segment = string | { receipt: ReceiptId; text: string } | { gloss: GlossId; text: string };

export const site = {
  name: 'Nikhil Patil',
  role: 'AI/ML Engineer',
  tagline: { before: 'I build AI that ', highlight: 'shows its work', after: '.' },
  // Your own words, from your GitHub profile README.
  oneLiner: 'I build generative AI that keeps working after the demo, and I teach AI from first principles to Indian students.',
  location: 'Mumbai, IN',
  timeZone: 'Asia/Kolkata',
  email: 'nikhilsatyawanpatil@gmail.com',
  experience: 'About 1.6 years of experience',
  // TODO: ask Nikhil for the custom domain. Until then NEXT_PUBLIC_SITE_URL or the Vercel URL is used.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000'),
  lastUpdated: '2026-10-23',
  // DRAFT
  description: 'Nikhil Patil is an AI/ML engineer in Mumbai who builds RAG systems, LLM agents and fine-tuned models with published benchmarks, and hosted the Hinglish AI podcast AI, but Simple.',
} as const;

/** Section labels and headings on the Story page. */
export const sections = {
  work: { tag: 'Selected work', title: 'Things I built, with receipts.', sub: 'Every number opens its proof. Each project has its own color.' },
  // DRAFT
  about: { tag: 'About', title: 'Evidence over adjectives.' },
  // DRAFT
  experience: { tag: 'Experience', title: 'Where I have built things.', sub: 'About 1.6 years across an AI startup, a contract and an internship.' },
  stack: { tag: 'Stack', title: 'The tools I reach for.', sub: 'Grouped by what they do. Blues are LLMs and agents, greens are computer vision, and warm colors are MLOps.' },
  teaching: { tag: 'Teaching' },
  // DRAFT
  beyond: { tag: 'Beyond code', title: 'Off the keyboard.' },
  contact: { tag: 'Contact', title: "Let's talk." },
};

/** Words on the two crossing ribbons. They repeat what the Stack section lists. */
export const ribbonWords = ['Verified RAG', 'Multi-agent systems', 'Fine-tuning', 'Computer vision', 'Edge AI', 'MLOps on Azure', 'Teaching AI in Hinglish'] as const;

export const socials = {
  linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nikhilsatyawanpatil/', hue: 'sky' as Hue },
  github: { label: 'GitHub', href: 'https://github.com/NikhilPatilAI', hue: 'lime' as Hue },
  instagram: { label: 'Instagram', href: 'https://www.instagram.com/nikhilpatil.ai/', hue: 'rose' as Hue },
  podcast: { label: 'Podcast', href: 'https://open.spotify.com/show/6xxWrNSItSJwd5UBznvQNw', hue: 'mint' as Hue },
};

export interface Receipt {
  n: number;
  fig: string;
  what: string;
  how: string;
  source: string;
  href?: string;
}

/** The proof behind each number. Opened from the numbered buttons in the copy. */
export const receipts: Record<ReceiptId, Receipt> = {
  'legal-precision': {
    n: 1,
    fig: '89% precision',
    what: '41 of 46 answers were fully correct on a blind random test set, frozen before the run.',
    how: 'It answers only above a 0.70 confidence threshold tuned on a separate dev set. That covers 49% of in-scope questions; the rest get official sources instead of a guess.',
    source: 'legal-bot · README › Results · docs/results/',
    href: 'https://github.com/NikhilPatilAI/legal-bot#results',
  },
  'legal-verifier': {
    n: 2,
    fig: '0.8% of false claims accepted',
    what: '6 of 706 falsified claims got through, on laws the verifier was never tuned on (95% CI 0.4 to 1.8%).',
    how: 'The same check rejected 1.7% of true claims (6 of 362).',
    source: 'legal-bot · README › Results',
    href: 'https://github.com/NikhilPatilAI/legal-bot#results',
  },
  'rag-hit': {
    n: 3,
    fig: '95.5% Hit Rate@10',
    what: 'In 191 of 200 title-to-article queries, the right Wikipedia article was in the top 10 results.',
    how: 'FAISS IndexFlatIP over 50,511 chunks. Chroma HNSW scored 76.5% on the same labels.',
    source: 'agentic-ai-research-assistant · docs/50K_RETRIEVAL_BENCHMARK.md',
    href: 'https://github.com/NikhilPatilAI/agentic-ai-research-assistant/blob/HEAD/docs/50K_RETRIEVAL_BENCHMARK.md',
  },
  'rag-faith': {
    n: 4,
    fig: '0.93 faithfulness',
    what: 'RAGAS 0.1.21 on 20 source-grounded cases; all 20 completed.',
    how: 'The same free model generated and judged the answers, so the judge is not independent.',
    source: 'agentic-ai-research-assistant · evaluation/results/opencode_zen/e2e_rag_local_20260824T080419Z_report.md',
    href: 'https://github.com/NikhilPatilAI/agentic-ai-research-assistant/blob/HEAD/evaluation/results/opencode_zen/e2e_rag_local_20260824T080419Z_report.md',
  },
  'gemma-data': {
    n: 5,
    fig: '5,000 scripts',
    what: 'Technology Shorts scripts in five styles, split 4,500 / 250 / 250.',
    how: 'Grouped by source video, so no video or script appears in two splits.',
    source: 'gemma4-e2b-tech-shorts-finetuning · README › Dataset pipeline',
    href: 'https://github.com/NikhilPatilAI/gemma4-e2b-tech-shorts-finetuning',
  },
  'gemma-acc': {
    n: 6,
    fig: '73.4% token accuracy',
    what: 'Mean token accuracy on the validation set after one epoch (282 steps), with validation loss 1.3985.',
    how: 'Token accuracy measures format and style, not factual accuracy.',
    source: 'gemma4-e2b-tech-shorts-finetuning · README › Results',
    href: 'https://github.com/NikhilPatilAI/gemma4-e2b-tech-shorts-finetuning#results',
  },
  'grphte-wf': {
    n: 7,
    fig: '8 image workflows',
    what: 'Text-to-image, sketch-to-render, inpainting, variations, upscaling and diagrams, across a 15-tool canvas.',
    how: 'Azure OpenAI behind a multi-provider model registry.',
    source: 'Resume, checked against the private codebase',
    href: 'https://nikhilpatilai.github.io/grphte',
  },
  'grphte-tests': {
    n: 8,
    fig: '50 automated tests',
    what: '18 web tests on node:test, 29 FastAPI tests on pytest, 3 infrastructure tests.',
    how: 'The code is private. Ask for a walkthrough.',
    source: 'Private repository, counted on 28 Sep 2026',
  },
  eps: {
    n: 9,
    fig: '28 episodes',
    what: 'Released between 23 Nov 2025 and 31 May 2026, about one a week.',
    how: 'Hinglish, two to six minutes each, about 1 hour 51 minutes in all.',
    source: 'Spotify · AI, but Simple',
    href: 'https://open.spotify.com/show/6xxWrNSItSJwd5UBznvQNw',
  },
};

/** Plain-words explanations for terms of art. */
export const glosses: Record<GlossId, { term: string; text: string }> = {
  rag: { term: 'RAG', text: 'The AI looks things up in trusted documents first, then answers only from what it found.' },
  hit: { term: 'Hit Rate@10', text: 'Out of every 100 searches, how many put the right source somewhere in the first 10 results.' },
  qlora: { term: 'QLoRA', text: 'A cheap way to teach a big model new habits: freeze it, squeeze it to 4 bits, and train small add-on weights.' },
};

export interface FlowStep {
  label: string;
  detail?: string;
  /** Where the flow leaves this step early, for example "outside legal areas: decline". */
  exit?: string;
}

export interface CaseStudy {
  summary: string;
  tldr: { problem: string; built: string; result: string };
  context: string[];
  constraints: string[];
  role: string;
  flow: { lanes: { name: string; steps: FlowStep[] }[]; note?: string };
  decisions: { title: string; body: string }[];
  results: { value: string; label: string; detail?: string }[];
  resultsSource: { label: string; href?: string };
  limits: string[];
  differently: string[];
  stack: string[];
  links: { label: string; href: string }[];
}

export interface Project {
  slug: string;
  title: string;
  fullTitle: string;
  hue: Hue;
  status: string;
  date: string;
  href: string;
  kicker: Segment[];
  line: Segment[];
  cardStack: string[];
  /** One plain sentence for Quick view and /resume. */
  outcome: string;
  resumeBullets: string[];
  caseStudy: CaseStudy;
}

export const projects: Project[] = [
  {
    slug: 'legal-bot',
    title: 'Legal Bot',
    fullTitle: 'Legal Bot: verified RAG for Indian law',
    hue: 'sky',
    status: 'Open source',
    date: 'Sep 2026',
    href: 'https://github.com/NikhilPatilAI/legal-bot',
    kicker: ['Verified ', { gloss: 'rag', text: 'RAG' }, ' for Indian law'],
    // DRAFT
    line: [
      'Built on 5,082 official legal PDFs, it answers only from those sources and cites the exact page. A checker blocks made-up facts. On a blind test it reached ',
      { receipt: 'legal-precision', text: '89% precision' },
      ', and only ',
      { receipt: 'legal-verifier', text: '0.8% of false claims' },
      ' got through.',
    ],
    cardStack: ['TypeScript', 'Azure OpenAI', 'SQLite FTS5', 'Docker'],
    // DRAFT
    outcome: 'Answers Indian law questions only from official PDFs and checks every claim: 89% precision on a blind test, 0.8% of false claims accepted.',
    // DRAFT
    resumeBullets: [
      'Built retrieval-augmented question answering over a corpus of 5,082 official Indian legal PDFs, citing the exact document and page for every answer.',
      'Designed a deterministic claim verifier (numbers, negation, shall/may, citations, quotations) that accepted 0.8% of falsified claims (6/706) on laws it was never tuned on.',
      'Raised blind-set precision from 83% to 89% (41/46) with a 0.70 confidence threshold tuned on the dev set; refused 15/15 out-of-scope questions at ₹0.04 to ₹0.11 per question.',
    ],
    caseStudy: {
      // DRAFT
      summary: 'Retrieval over official Indian legal texts that cites the exact page, checks every claim, and withholds answers it cannot prove.',
      // DRAFT
      tldr: {
        problem: 'General chatbots answer legal questions fluently, but they invent section numbers, turn "shall" into "may" and quote law that was amended years ago.',
        built: 'A retrieval system over official Indian legal PDFs that cites the exact document and page, checks each claim against the cited text, and withholds any answer that fails.',
        result: '89% precision on a blind random test, 0.8% of falsified claims accepted on laws the checker never saw, and 15 of 15 out-of-scope questions refused.',
      },
      // DRAFT
      context: [
        'The rule I built around is simple: no evidence, no answer.',
        'I developed it against a private corpus of 5,082 official PDFs from sources such as India Code, CBIC, IP India, MCA, SEBI, IBBI and RBI. The public repo bundles four Acts, so anyone can build the index and ask questions in a few minutes.',
      ],
      // DRAFT
      constraints: [
        'Law changes, so every answer has to point to its source document and page.',
        'A wrong legal answer is worse than none, so the system must be allowed to decline.',
        'Each question had to cost paise, not rupees.',
      ],
      // DRAFT
      role: 'Solo. I designed, built, tested and documented it, from PDF ingestion to the API and the web UI.',
      flow: {
        lanes: [
          {
            name: 'Ingestion',
            steps: [
              { label: 'Manifest of official URLs' },
              { label: 'SHA-256 content-addressed IDs' },
              { label: 'Text extraction with pdf.js' },
              { label: 'Page chunks' },
              { label: 'SQLite FTS5 index', detail: 'BM25 ranking' },
            ],
          },
          {
            name: 'Answering',
            steps: [
              { label: 'Question' },
              { label: 'Scope guard', detail: 'Is this a covered legal area?', exit: 'No: decline before any search' },
              { label: 'Retrieve', detail: 'BM25, instrument routing, heading ranking, newest version' },
              { label: 'Connected provisions', detail: 'Definitions and cross-references' },
              { label: 'Compose', detail: 'Quoted extract, or a short answer from Azure OpenAI' },
              { label: 'Claim verifier', detail: 'Numbers, negation, shall or may, citations, quotations', exit: 'Contradicted: withhold' },
              { label: 'Confidence gate', detail: 'Threshold 0.70, tuned on the dev set', exit: 'Below it: sources only' },
              { label: 'Answer with citations and checks' },
            ],
          },
        ],
      },
      // DRAFT
      decisions: [
        {
          title: 'A deterministic checker, not an LLM judge',
          body: 'The verifier splits each drafted answer into claims and checks numbers, negation, "shall" against "may", section citations and quotations against the cited text. It is cheap, repeatable and testable. On laws it was never tuned on, it accepted 0.8% of falsified claims.',
        },
        {
          title: 'Precision over coverage',
          body: 'Every verified answer gets a confidence score. Answering only above 0.70, a threshold chosen on the dev set alone, lifted blind precision from 83% to 89%. The cost is coverage: the system answers about half of in-scope questions and returns official sources for the rest.',
        },
        {
          title: 'Hybrid search measured, then left off',
          body: 'BM25 plus embeddings with rank fusion found the right document 13 of 14 times, against 14 of 14 for BM25 alone, at ten times the latency. So it stays off by default.',
        },
        {
          title: 'Decline before searching',
          body: 'Questions outside the covered legal areas, like passports or foreign law, are refused before any search or model call. That held for 15 of 15 on both random test sets.',
        },
      ],
      results: [
        { value: '89%', label: 'precision on a blind random set', detail: '41 of 46 answers fully correct, 95% CI 77 to 95%' },
        { value: '0.8%', label: 'falsified claims accepted on unseen laws', detail: '6 of 706, 95% CI 0.4 to 1.8%' },
        { value: '15/15', label: 'out-of-scope questions refused', detail: 'on both random test sets' },
        { value: '₹0.04 to ₹0.11', label: 'per question with Azure OpenAI', detail: 'at list price' },
        { value: '150', label: 'tests in CI', detail: 'plus both free evaluations and a Docker smoke test' },
      ],
      resultsSource: { label: 'Every number comes from a file in docs/results/ in the repo', href: 'https://github.com/NikhilPatilAI/legal-bot#results' },
      limits: [
        'The test samples are small: 94 and 89 answerable questions.',
        'Answering only when confident trades coverage for precision: about half of in-scope questions get sources instead of an answer.',
        'Expected facts were checked verbatim against the source; they are not lawyer-reviewed.',
      ],
      // DRAFT
      differently: [
        'Widen the legal-area router first, tuned on the dev set and measured on a new frozen set, because most unanswered questions stop there.',
        'Host a demo on the free extract composer, so anyone can try it without an API key.',
        'Grow the blind sets well past 94 questions, so the confidence intervals tighten.',
      ],
      stack: ['TypeScript', 'Node 22', 'Fastify', 'SQLite FTS5 (BM25)', 'pdf.js', 'Azure OpenAI', 'Docker', 'Vitest'],
      links: [
        { label: 'Repository', href: 'https://github.com/NikhilPatilAI/legal-bot' },
        { label: 'Results', href: 'https://github.com/NikhilPatilAI/legal-bot#results' },
      ],
    },
  },
  {
    slug: 'agentic-rag',
    title: 'Agentic RAG',
    fullTitle: 'Agentic AI Research Assistant',
    hue: 'grape',
    status: 'Open source',
    date: 'Jul 2026',
    href: 'https://github.com/NikhilPatilAI/agentic-ai-research-assistant',
    kicker: ['Four agents that research, retrieve, fact-check and write'],
    // DRAFT
    line: [
      'A LangGraph pipeline with published benchmarks. The right source article lands in the top 10 results ',
      { receipt: 'rag-hit', text: '95.5% of the time' },
      ' (',
      { gloss: 'hit', text: 'Hit Rate@10' },
      '), and its answers score ',
      { receipt: 'rag-faith', text: '0.93 faithfulness' },
      '.',
    ],
    cardStack: ['LangGraph', 'FAISS', 'RAGAS', 'FastAPI'],
    // DRAFT
    outcome: 'A LangGraph research pipeline with published benchmarks: the right source in the top 10 results 95.5% of the time, and 0.93 RAGAS faithfulness.',
    // DRAFT
    resumeBullets: [
      'Built a LangGraph research assistant whose agents run web research and local retrieval in parallel, check the evidence and stream the answer over WebSockets.',
      'Benchmarked 200 queries over 50,511 Wikipedia chunks: FAISS IndexFlatIP reached 95.5% Hit Rate@10 and 0.885 MRR, against 76.5% for Chroma HNSW.',
      'Scored 0.93 faithfulness, 0.82 answer relevancy, 0.985 context precision and 0.95 context recall on 20 RAGAS cases; added a Redis semantic cache that answers repeats in 112 ms at p50.',
    ],
    caseStudy: {
      // DRAFT
      summary: 'A LangGraph research pipeline measured in the open: a 200-query retrieval benchmark, a RAGAS evaluation, and an honest list of what did not work.',
      // DRAFT
      tldr: {
        problem: 'Most RAG demos stop at basic document Q&A and never measure retrieval. I wanted the current GenAI stack end to end, with numbers I could defend.',
        built: 'A LangGraph pipeline that researches the web, retrieves from a local index, checks the evidence and writes the answer, with semantic caching, token streaming, tracing and experiment tracking.',
        result: 'The right Wikipedia article in the top 10 for 95.5% of 200 queries over 50,511 chunks, 0.93 faithfulness on 20 RAGAS cases, and cached answers in 112 ms.',
      },
      // DRAFT
      context: [
        'I built it alone to work through the whole modern GenAI stack instead of a single document Q&A demo.',
        'Generation runs on LLaMA 3.3 70B through Groq, with Tavily for web search and all-MiniLM-L6-v2 embeddings for local retrieval.',
      ],
      // DRAFT
      constraints: [
        'Free and low-cost model tiers with daily rate limits.',
        'Every claim had to trace to a results file in the repo.',
      ],
      // DRAFT
      role: 'Solo: architecture, retrieval benchmark, evaluation harness, API, Docker and Kubernetes files.',
      flow: {
        lanes: [
          {
            name: 'Answering',
            steps: [
              { label: 'Query' },
              { label: 'Redis semantic cache', exit: 'Safe hit: answer in 112 ms' },
              { label: 'Input guardrails' },
              { label: 'LangGraph parallel evidence node', detail: 'Web research with Tavily, and local retrieval at the same time' },
              { label: 'Local retrieval', detail: 'FAISS or Chroma, one backend chosen by config, then a reranking policy' },
              { label: 'Evidence check' },
              { label: 'Synthesis on Groq', detail: 'Real provider tokens streamed' },
              { label: 'HTTP or WebSocket response' },
            ],
          },
        ],
        note: 'LangSmith traces every run, and MLflow records the experiments.',
      },
      // DRAFT
      decisions: [
        {
          title: 'Exact search beat approximate search',
          body: 'On 200 title-to-article queries over 50,511 chunks, exact FAISS IndexFlatIP found the right article in the top 10 95.5% of the time, while Chroma\'s HNSW index managed 76.5%. FAISS was slower at p95, 9.34 ms against 3.21 ms, a fair price at this scale.',
        },
        {
          title: 'Cache before you compute',
          body: 'A Redis semantic cache answers repeated questions in 112 ms at p50, against about 3.5 seconds for a local RAG answer.',
        },
        {
          title: 'Real streaming only',
          body: 'The WebSocket endpoint streams the provider\'s actual tokens. Cached answers say they came from the cache instead of pretending to generate.',
        },
        {
          title: 'Two claims, kept apart',
          body: 'The retrieval benchmark and the RAGAS evaluation measure different things, so I report them separately, and I state that the same model generated and judged the RAGAS answers.',
        },
      ],
      results: [
        { value: '95.5%', label: 'Hit Rate@10 with FAISS IndexFlatIP', detail: '191 of 200 queries; Chroma HNSW scored 76.5%' },
        { value: '0.885', label: 'MRR on the same benchmark', detail: 'Chroma HNSW: 0.727' },
        { value: '0.93', label: 'RAGAS faithfulness', detail: '20 of 20 cases; answer relevancy 0.82, context precision 0.985, context recall 0.95' },
        { value: '112 ms', label: 'p50 for a cached answer', detail: 'local RAG takes about 3.5 s at p50' },
      ],
      resultsSource: { label: 'Benchmarks and evaluation reports in the repo', href: 'https://github.com/NikhilPatilAI/agentic-ai-research-assistant/blob/HEAD/docs/50K_RETRIEVAL_BENCHMARK.md' },
      limits: [
        'Sub-3-second full answers were not achieved: the full web workflow takes about 27 seconds at p50.',
        'The cache benchmark ran into Groq\'s daily rate limits, so its numbers are not cited.',
        'Cohere reranking was not measured, and the Kubernetes manifests are written but no cluster was deployed.',
      ],
      // DRAFT
      differently: [
        'Fix CI first. A red check on the latest commit undercuts every number in the README.',
        'Use a different model as the RAGAS judge, so the evaluation is independent.',
        'Rerun the cache benchmark on a paid tier, so it can count.',
      ],
      stack: ['LangGraph', 'LangChain', 'LLaMA 3.3 70B on Groq', 'Tavily', 'FAISS', 'ChromaDB', 'Redis', 'RAGAS', 'LangSmith', 'MLflow', 'NeMo Guardrails', 'FastAPI', 'WebSockets', 'Docker', 'Kubernetes manifests'],
      links: [
        { label: 'Repository', href: 'https://github.com/NikhilPatilAI/agentic-ai-research-assistant' },
        { label: '50K retrieval benchmark', href: 'https://github.com/NikhilPatilAI/agentic-ai-research-assistant/blob/HEAD/docs/50K_RETRIEVAL_BENCHMARK.md' },
      ],
    },
  },
  {
    slug: 'gemma-shorts',
    title: 'Gemma Shorts',
    fullTitle: 'Gemma 4 E2B fine-tuned for tech Shorts',
    hue: 'mint',
    status: 'Open source',
    date: 'Jul 2026',
    href: 'https://github.com/NikhilPatilAI/gemma4-e2b-tech-shorts-finetuning',
    kicker: ['Teaching a small model to write tech Shorts with ', { gloss: 'qlora', text: 'QLoRA' }],
    // DRAFT
    line: [
      'Fine-tuned in a Colab notebook on ',
      { receipt: 'gemma-data', text: '5,000 scripts' },
      ', split so no video leaks into testing. After one epoch it reached ',
      { receipt: 'gemma-acc', text: '73.4% token accuracy' },
      '.',
    ],
    cardStack: ['PyTorch', 'PEFT', 'TRL', 'Hugging Face'],
    // DRAFT
    outcome: 'Fine-tuned Gemma 4 E2B with QLoRA on 5,000 scripts in a leak-free split: 73.4% token accuracy and 1.3985 validation loss after one epoch.',
    // DRAFT
    resumeBullets: [
      'Fine-tuned google/gemma-4-E2B-it with 4-bit QLoRA (NF4, rank 16) on 5,000 technology Shorts scripts in five controllable styles.',
      'Built a leak-free 4,500 / 250 / 250 split grouped by source video, with JSON validation and deduplication; removed unused vision and audio towers before LoRA injection.',
      'Reached 1.3985 validation loss and 73.4% mean token accuracy after one epoch (282 steps) on a Google Colab GPU.',
    ],
    caseStudy: {
      // DRAFT
      summary: 'A small Gemma 4 model taught to write structured tech Shorts scripts with 4-bit QLoRA, on a leak-free split, in one Colab notebook.',
      // DRAFT
      tldr: {
        problem: 'I wanted a small, cheap model that writes short tech scripts in a fixed structure: a hook, timed beats, a payoff, a call to action and hashtags.',
        built: 'A Colab notebook that fine-tunes google/gemma-4-E2B-it with 4-bit QLoRA on 5,000 scripts in five styles, from data checks to a saved adapter.',
        result: 'After one epoch, validation loss reached 1.3985 and mean token accuracy 73.4%, and the model learned the target format and timing controls.',
      },
      // DRAFT
      context: [
        'The training data came from collected YouTube Shorts transcripts and metadata, rewritten into five styles: proof-first explainer, contrarian warning, developer lesson, founder story and listicle breakdown.',
        'The adapter teaches structure and style. Facts come from a verified brief in the prompt.',
      ],
      // DRAFT
      constraints: [
        'One Google Colab GPU runtime.',
        'The dataset can\'t be published, because the transcripts carry source-platform obligations.',
      ],
      // DRAFT
      role: 'Solo: data pipeline, training notebook and evaluation.',
      flow: {
        lanes: [
          {
            name: 'Data',
            steps: [
              { label: 'Shorts transcripts and metadata' },
              { label: 'Five controllable styles' },
              { label: 'Validation and deduplication', detail: 'Required fields, unique IDs, unique scripts' },
              { label: 'Split grouped by source video', detail: '4,500 / 250 / 250, zero shared videos' },
              { label: 'Conversational JSONL' },
            ],
          },
          {
            name: 'Training',
            steps: [
              { label: 'google/gemma-4-E2B-it in 4-bit NF4' },
              { label: 'Vision and audio towers removed', detail: 'The task is text only' },
              { label: 'LoRA on text projections', detail: 'Rank 16, alpha 32' },
              { label: 'Completion-only loss', detail: '1 epoch, 282 steps, effective batch 16' },
              { label: 'PEFT adapter', detail: 'Used with a verified fact brief in the prompt' },
            ],
          },
        ],
      },
      // DRAFT
      decisions: [
        {
          title: 'Split by video, not by row',
          body: 'All variants of one source video stay in the same split, so no video or script leaks from training into testing: 1,079, 59 and 61 unique videos across train, validation and test.',
        },
        {
          title: 'Drop what a text task doesn\'t need',
          body: 'The corpus is text only, so the notebook removes Gemma 4\'s vision and audio towers before adding LoRA, and attaches adapters only to the quantized text projections.',
        },
        {
          title: 'Learn the reply, not the prompt',
          body: 'Loss is computed on the assistant\'s reply only, so training spends its capacity on writing scripts.',
        },
        {
          title: 'Format, not facts',
          body: 'Fine-tuning teaches structure and style. Current tech facts come from a verified brief in the prompt, which substantially reduced unsupported claims in testing.',
        },
      ],
      results: [
        { value: '73.4%', label: 'mean token accuracy on validation', detail: '73.08% at step 100, 73.39% at step 200' },
        { value: '1.3985', label: 'validation loss after 282 steps', detail: '1.4192 at step 100, 1.3990 at step 200' },
        { value: '5,000', label: 'scripts in a leak-free split', detail: '4,500 / 250 / 250' },
        { value: 'About 4 h 16 min', label: 'to train one epoch on Colab' },
      ],
      resultsSource: { label: 'Training log in the repo README', href: 'https://github.com/NikhilPatilAI/gemma4-e2b-tech-shorts-finetuning#results' },
      limits: [
        'Token accuracy measures format and style, not factuality or audience engagement.',
        'The templates are mechanical, so hooks and calls to action can repeat.',
        'There is no base-model score beside 1.3985 yet.',
      ],
      // DRAFT
      differently: [
        'Score the base model on the same validation set, so the loss and accuracy have a baseline.',
        'Show base and fine-tuned outputs side by side for the same prompt.',
        'Publish the adapter with a model card, after checking the Gemma terms.',
      ],
      stack: ['Python', 'PyTorch', 'Hugging Face Transformers', 'PEFT', 'TRL', 'QLoRA (NF4)', 'Google Colab'],
      links: [{ label: 'Repository', href: 'https://github.com/NikhilPatilAI/gemma4-e2b-tech-shorts-finetuning' }],
    },
  },
  {
    slug: 'grphte-ai',
    title: 'GRPHTE AI',
    fullTitle: 'GRPHTE AI: a GenAI design platform on Azure',
    hue: 'mango',
    status: 'Contract · live demo',
    date: 'Jul to Oct 2026',
    href: 'https://nikhilpatilai.github.io/grphte',
    kicker: ['A production GenAI design platform on Azure'],
    // DRAFT
    line: [
      'I built it on contract for the founder. It runs ',
      { receipt: 'grphte-wf', text: '8 image workflows' },
      ' behind a durable job queue, with telemetry and ',
      { receipt: 'grphte-tests', text: '50 automated tests' },
      '.',
    ],
    cardStack: ['FastAPI', 'Next.js', 'PostgreSQL', 'Container Apps'],
    // DRAFT
    outcome: 'Built on contract for the founder: 8 image workflows behind a durable job queue on Azure, with telemetry and 50 automated tests.',
    // DRAFT
    resumeBullets: [
      'Built a production GenAI design platform on Azure: 8 image workflows across a 15-tool canvas on Azure OpenAI, behind a multi-provider model registry.',
      'Designed a durable job queue on PostgreSQL with transactional credit reservation, idempotency keys, compare-and-swap claims across replicas, 3 retry attempts and refunds.',
      'Deployed on Azure Container Apps with private Blob Storage over managed identity, telemetry in Log Analytics, and 50 automated tests.',
    ],
    caseStudy: {
      // DRAFT
      summary: 'A GenAI design platform on Azure: eight image workflows, a durable job queue on PostgreSQL, private storage, telemetry and 50 tests.',
      // DRAFT
      tldr: {
        problem: 'A design startup needed a platform where prompts, sketches and reference images go in and client-ready renders come out, reliably, for paying users.',
        built: 'The platform end to end: a Next.js web app, an internal FastAPI service that owns every AI call, a durable job queue on PostgreSQL, private storage and an Azure deployment.',
        result: '8 image workflows across a 15-tool canvas, live on Azure Container Apps, with 50 automated tests and telemetry on every generation.',
      },
      // DRAFT
      context: [
        'GRPHTE Creative Labs is a design startup. I worked with its founder on a contract from July to October 2026, alongside my full-time role.',
        'The founder agreed to this case study. The code is private, so this page shows the decisions, not the source.',
      ],
      // DRAFT
      constraints: [
        'Paid generations, so a job must never run twice or charge twice.',
        'Azure end to end: Azure OpenAI through AI Foundry, Container Apps and Blob Storage.',
      ],
      // DRAFT
      role: 'Contract AI engineer. I designed and built the platform: API, job queue, storage, deployment, telemetry and tests.',
      flow: {
        lanes: [
          {
            name: 'Request',
            steps: [
              { label: 'Next.js web app' },
              { label: 'Internal FastAPI service', detail: 'JWT and OAuth, hashed API keys, rate limits' },
              { label: 'Job queue on PostgreSQL', detail: 'Credit reservation, idempotency key, compare-and-swap claims', exit: 'After 3 failed attempts: refund' },
              { label: 'Model registry', detail: 'Providers switched through environment variables' },
              { label: 'Azure OpenAI image workflows', detail: '8 workflows across a 15-tool canvas' },
              { label: 'Private Blob Storage', detail: 'Raw REST with managed identity, immutable writes' },
              { label: 'Telemetry and evaluation', detail: 'Log Analytics records, score gates' },
            ],
          },
        ],
        note: 'Deployed on Azure Container Apps with Azure Container Registry, PostgreSQL and Prisma migrations.',
      },
      // DRAFT
      decisions: [
        {
          title: 'A queue in Postgres, not a broker',
          body: 'Jobs live in PostgreSQL. Credits are reserved in a transaction, a compound unique key makes retries idempotent, and replicas claim jobs with compare-and-swap. That is one less service to run, and every state change sits in one database.',
        },
        {
          title: 'Raw REST with managed identity',
          body: 'Blob Storage is called over REST with the container\'s managed identity and cached tokens, instead of the Azure SDK. Writes are immutable, and reads are checked against the owner.',
        },
        {
          title: 'Keep images the moment they exist',
          body: 'Azure\'s image URLs expire in about 24 hours, so every result is copied into private storage as soon as it is generated.',
        },
        {
          title: 'Every model behind one switch',
          body: 'All AI calls go through FastAPI and a model registry. Models change through environment variables, and a lint rule blocks provider SDK imports anywhere else.',
        },
      ],
      results: [
        { value: '8', label: 'image workflows', detail: 'Text-to-image, sketch-to-render, inpainting, variations, upscaling and diagrams' },
        { value: '15', label: 'tools on the canvas' },
        { value: '50', label: 'automated tests', detail: '18 web, 29 API, 3 infrastructure' },
        { value: '3', label: 'retry attempts per job', detail: 'then a refund on terminal failure' },
      ],
      resultsSource: { label: 'Resume, checked against the private codebase on 28 Sep 2026' },
      limits: [
        'No public outcome numbers yet, such as generation latency, because they need the founder\'s OK.',
      ],
      // DRAFT
      differently: [
        'Agree on two or three public outcome numbers with the founder from day one, so the work can be shown with evidence.',
        'Write the architecture up as it is built, since the code itself can\'t be shared.',
      ],
      stack: ['Next.js', 'FastAPI', 'Azure OpenAI (AI Foundry)', 'PostgreSQL', 'Prisma', 'Azure Blob Storage', 'Azure Container Apps', 'Azure Container Registry', 'Log Analytics', 'pytest', 'node:test'],
      links: [{ label: 'Live demo', href: 'https://nikhilpatilai.github.io/grphte' }],
    },
  },
];

export interface Role {
  role: string;
  org: string;
  place?: string;
  start: string;
  end: string;
  hue: Hue;
  summary: string;
  bullets: string[];
  link?: string;
}

export const experience: Role[] = [
  {
    role: 'AI/ML Engineer',
    org: 'Ind-Zone Tech Pvt. Ltd.',
    place: 'Mumbai',
    start: 'Jun 2025',
    end: 'Present',
    hue: 'sky',
    // Approved default (Nikhil, 23 Oct), from the wording on your LinkedIn About. No product details.
    summary: 'ML models trained and deployed for a retail automation product, with training pipelines in Azure Machine Learning and MLflow.',
    bullets: [],
  },
  {
    role: 'AI Engineer (Contract)',
    org: 'GRPHTE AI',
    start: 'Jul 2026',
    end: 'Oct 2026',
    hue: 'mango',
    // DRAFT
    summary: 'Built a production GenAI design platform on Azure: 8 image workflows, a durable job queue on PostgreSQL and 50 automated tests.',
    // DRAFT, the same facts as the GRPHTE AI case study
    bullets: [
      'Built a production GenAI design platform on Azure: 8 image workflows across a 15-tool canvas on Azure OpenAI, behind a multi-provider model registry.',
      'Designed a durable job queue on PostgreSQL with transactional credit reservation, idempotency keys, compare-and-swap claims across replicas, 3 retry attempts and refunds.',
      'Deployed on Azure Container Apps with private Blob Storage over managed identity, telemetry in Log Analytics, and 50 automated tests.',
    ],
    link: '/work/grphte-ai',
  },
  {
    role: 'AI Business Intelligence Analyst (Intern)',
    org: 'DataTalks',
    place: 'Mumbai',
    start: 'Jan 2025',
    end: 'Apr 2025',
    hue: 'mint',
    // DRAFT, from your resume bullets
    summary: 'Classification, regression and clustering models in Azure ML Studio with experiment tracking, SQL on Azure PostgreSQL, and Power BI dashboards for KPI tracking.',
    // DRAFT, from your resume bullets
    bullets: [
      'Built classification, regression and clustering models in Azure ML Studio with experiment tracking, preprocessing, feature engineering and train/test splits.',
      'Queried Azure PostgreSQL with SQL and built Power BI dashboards for KPI tracking, cleaning data with Power Query.',
    ],
  },
];

export const education = [
  { degree: 'Master of Computer Applications (MCA)', school: 'NMITD, University of Mumbai', start: '2023', end: '2025', grade: 'CGPA 8.07' },
  { degree: 'Bachelor of Computer Applications (BCA)', school: 'Tilak Maharashtra Vidyapeeth, Mumbai', start: '2020', end: '2023', grade: 'CGPA 8.44' },
];

export const certifications = [
  { name: 'Machine Learning Specialization', issuer: 'DeepLearning.AI, on Coursera', date: 'Oct 2025' },
  { name: 'Career Essentials in Generative AI', issuer: 'Microsoft and LinkedIn', date: '2024' },
  { name: 'Data Science Using Python', issuer: 'NPTEL', date: '2024' },
];

export interface ToolGroup {
  id: string;
  title: string;
  hue: Hue;
  note: string;
  tools: string[];
}

export const stack: ToolGroup[] = [
  {
    id: 'llm',
    title: 'LLMs and agents',
    hue: 'iris',
    note: 'Shipped in Legal Bot, Agentic RAG and Gemma Shorts.',
    tools: ['LangGraph', 'LangChain', 'RAG', 'FAISS', 'ChromaDB', 'RAGAS', 'QLoRA', 'PEFT', 'TRL', 'Hugging Face Transformers', 'Azure OpenAI', 'NeMo Guardrails', 'LangSmith', 'Redis semantic cache'],
  },
  {
    id: 'cv',
    title: 'Computer vision and edge AI',
    hue: 'lime',
    // DRAFT
    note: 'For detection and fast inference on small devices.',
    tools: ['YOLO', 'OpenCV', 'TensorRT', 'ONNX', 'Quantization'],
  },
  {
    id: 'ops',
    title: 'MLOps and cloud',
    hue: 'sun',
    note: 'Shipped in GRPHTE AI, Legal Bot and Agentic RAG.',
    tools: ['Azure ML', 'MLflow', 'Docker', 'Kubernetes manifests', 'GitHub Actions', 'FastAPI', 'Azure Container Apps', 'PostgreSQL'],
  },
];

/** Shorter list for Quick view and /resume. */
export const topSkills = ['Python', 'PyTorch', 'RAG', 'LangGraph', 'LangChain', 'QLoRA and PEFT', 'Hugging Face Transformers', 'FAISS', 'RAGAS', 'Azure OpenAI', 'Azure ML', 'MLflow', 'Docker', 'FastAPI', 'YOLO', 'OpenCV'];

// DRAFT. Three lines; the middle one is your own sentence from your GitHub README.
export const about = [
  'I\'m an AI/ML engineer in Mumbai. I build systems that show their evidence: answers that cite their sources, evaluations anyone can rerun, and numbers with a file behind them.',
  site.oneLiner,
  'At Ind-Zone I train and deploy ML models for a retail automation product. Outside it, I publish open-source LLM projects and take on production work by contract.',
];

// TODO: ask Nikhil for a portrait photo. Until then the About section shows a monogram.
export const portrait: { src: string; alt: string } | null = null;

export const beyond = [
  {
    title: 'Smart India Hackathon 2024',
    meta: 'Sole coordinator',
    hue: 'sun' as Hue,
    // Resume wording (research Q11: no claim about scope).
    body: 'Organized events, mentored teams and worked with faculty across departments.',
  },
  {
    title: 'AI content in Hindi and Hinglish',
    meta: 'Podcast and reels',
    hue: 'iris' as Hue,
    // DRAFT
    body: 'Beyond the podcast, I post Hindi-language AI reels on Instagram at @aibutsimple.studio.',
    href: 'https://www.instagram.com/aibutsimple.studio/',
  },
  {
    title: 'Three languages',
    meta: 'English, Hindi, Marathi',
    hue: 'mint' as Hue,
    // DRAFT
    body: 'I work in English and Hindi, and Marathi is my first language.',
  },
];

export interface Episode {
  n: number;
  title: string;
  href: string;
  date: string;
  length: string;
  cover: string;
}

export const podcast = {
  name: 'AI, but Simple',
  // DRAFT
  about: 'A Hinglish podcast I created and host, explaining AI from first principles for Indian beginners and CS students.',
  total: 'about 1 hour 51 minutes',
  show: { href: 'https://open.spotify.com/show/6xxWrNSItSJwd5UBznvQNw', cover: '/podcast/show.jpg' },
  links: [
    { label: 'Spotify', href: 'https://open.spotify.com/show/6xxWrNSItSJwd5UBznvQNw', hue: 'mint' as Hue },
    { label: 'YouTube', href: 'https://www.youtube.com/channel/UCpakmXio90uAd4RBZqimG8Q', hue: 'chili' as Hue },
    { label: 'Instagram', href: 'https://www.instagram.com/aibutsimple.studio/', hue: 'grape' as Hue },
  ],
  // From your vault note Projects/AI but Simple Podcast.md. Titles are exactly as published.
  episodes: [
    { n: 1, title: 'How ChatGPT Actually Works? (Asli Sach)', href: 'https://open.spotify.com/episode/7xkS1PdSpberjx4SwN2u5o', date: '2025-11-23', length: '6:02' },
    { n: 2, title: 'A Brief History of AI (That Isn\'t Boring)', href: 'https://open.spotify.com/episode/5wNdpJ7XnFadmjIUaLJJm3', date: '2025-11-30', length: '5:48' },
    { n: 3, title: 'What Is Generative AI? (Beyond Chatbots)', href: 'https://open.spotify.com/episode/2M7nK88Ww47vrscqaBO5Tj', date: '2025-12-07', length: '5:32' },
    { n: 4, title: 'How AI Creates Images? (Nano banana, Dall-e, Midjourney Explained)', href: 'https://open.spotify.com/episode/1CMLsD2p2VcDY4hvaFcXPs', date: '2025-12-14', length: '3:55' },
    { n: 5, title: 'Prompt Engineering: How to Get Better Results from AI?', href: 'https://open.spotify.com/episode/3sE9qpfyaxy0PSiLYqd6VT', date: '2025-12-21', length: '3:21' },
    { n: 6, title: 'Why AI Sounds Confident Even When It\'s Wrong (Hallucinations Explained)', href: 'https://open.spotify.com/episode/1xE6gVZoIecIyBLGHKnAoY', date: '2025-12-28', length: '2:43' },
    { n: 7, title: 'Deepfakes & Voice Cloning (Asli Awaaz, Nakli Insaan?)', href: 'https://open.spotify.com/episode/70hZWXEyuCWKjuGMJiBsvH', date: '2026-01-04', length: '2:53' },
    { n: 8, title: 'How Computers See the World (Computer Vision & Face ID)', href: 'https://open.spotify.com/episode/1WHtax2NaZLV72wXq3UzeG', date: '2026-01-11', length: '2:00' },
    { n: 9, title: 'How AI Actually Learns', href: 'https://open.spotify.com/episode/2rUimHSNstXLyMfeobylBm', date: '2026-01-22', length: '3:28' },
    { n: 10, title: 'Can AI Remember You Context, Memory, and the Truth Behind the Illusion', href: 'https://open.spotify.com/episode/6qNe3GsvhwE5ljQyw2swPI', date: '2026-01-25', length: '3:02' },
    { n: 11, title: 'Neural Networks Explained: How Do AI Neurons Really Work?', href: 'https://open.spotify.com/episode/5qQ07cSEWdCaeBmCdsaH7q', date: '2026-02-01', length: '5:00' },
    { n: 12, title: 'Why GPUs Power Modern AI', href: 'https://open.spotify.com/episode/4utOrTydsO4Jxj3AHGZwfC', date: '2026-02-08', length: '4:22' },
    { n: 13, title: 'AI Agents: Your Next Digital Employee', href: 'https://open.spotify.com/episode/27VtrxMGNPbliFTGZzHWba', date: '2026-02-15', length: '4:25' },
    { n: 14, title: 'Robots & Humanoids', href: 'https://open.spotify.com/episode/0Va575uNW6wEZWCupbro1D', date: '2026-02-22', length: '4:46' },
    { n: 15, title: 'What Is AGI? The Day AI Becomes Smarter Than Us', href: 'https://open.spotify.com/episode/36n7xiOfWMPIoe0oMfcKFa', date: '2026-03-01', length: '4:30' },
    { n: 16, title: 'AI in Healthcare Can AI Save Your Life', href: 'https://open.spotify.com/episode/4Yw8I184tG1PUrJfSxDqO1', date: '2026-03-08', length: '3:46' },
    { n: 17, title: 'The AI Climate Revolution: From Predictions to Plastic-Eating Fish', href: 'https://open.spotify.com/episode/7DoOf0RaJ9nhSJe2gjr3Kc', date: '2026-03-15', length: '3:50' },
    { n: 18, title: 'AI and DNA What If AI Could Edit YOU?', href: 'https://open.spotify.com/episode/1zmUnv6ZNyiEqsoribezBg', date: '2026-03-22', length: '4:48' },
    { n: 19, title: 'Vibe Coding: Codex, Claude Code & The End of Traditional Coding', href: 'https://open.spotify.com/episode/2Ze96Y56hXSw6yuYoOsyC5', date: '2026-03-29', length: '4:21' },
    { n: 20, title: 'AI in Space', href: 'https://open.spotify.com/episode/42rrD2BxeucdH3XCL5VT2B', date: '2026-04-05', length: '3:21' },
    { n: 21, title: 'The Humanoid Revolution', href: 'https://open.spotify.com/episode/6RvgkSBXPk52wgpEyguDmG', date: '2026-04-12', length: '3:09' },
    { n: 22, title: 'AI in Gaming: You Won\'t Just Play, You\'ll Build', href: 'https://open.spotify.com/episode/1ozhTBFrD9w7FM8XBb2UHd', date: '2026-04-19', length: '3:46' },
    { n: 23, title: 'AI in Education', href: 'https://open.spotify.com/episode/2fDA8qBGSl0OMnPwTGXs0W', date: '2026-04-26', length: '3:23' },
    { n: 24, title: 'Multimodal AI When AI Can See, Hear, Speak, and Think', href: 'https://open.spotify.com/episode/6FmaFXMPUOsBXN3VBL8HOJ', date: '2026-05-03', length: '3:12' },
    { n: 25, title: 'Top AI and Creativity Will Machines Become Artists?', href: 'https://open.spotify.com/episode/0E0xD5Uy087Pz8S4ByntRa', date: '2026-05-10', length: '3:18' },
    { n: 26, title: 'Can We Trust AI Bias, Safety & The Black Box Problem', href: 'https://open.spotify.com/episode/3ankjfGMDNgE4I4gRONBWi', date: '2026-05-17', length: '4:01' },
    { n: 27, title: 'Can AI Become Your Best Friend', href: 'https://open.spotify.com/episode/0c9hknyAoOHEGUKp54SV9P', date: '2026-05-24', length: '3:27' },
    { n: 28, title: 'The AI Future You Need to Prepare For', href: 'https://open.spotify.com/episode/3o3IoYowd01fQfpzd1q6ai', date: '2026-05-31', length: '5:02' },
  ].map((e): Episode => ({ ...e, cover: `/podcast/ep${String(e.n).padStart(2, '0')}.jpg` })),
};

// TODO: ask Nikhil. What you are building, learning and reading this month.
export const now = {
  updated: null as string | null,
  building: [] as string[],
  learning: [] as string[],
  reading: [] as string[],
};

/** The /resume page and /resume.pdf both read from here, so they never drift apart. */
export const resume = {
  // DRAFT
  summary: `AI/ML engineer with about 1.6 years of experience building retrieval-augmented generation, LangGraph agents and QLoRA fine-tunes with published benchmarks, plus ML training pipelines and MLOps on Azure. Creator and host of ${podcast.name}, a ${podcast.episodes.length}-episode Hinglish podcast that explains AI to beginners.`,
  // GRPHTE AI already appears under Experience.
  projects: projects.filter((p) => p.slug !== 'grphte-ai'),
  extraSkills: { title: 'Languages and tools', tools: ['Python', 'PyTorch', 'scikit-learn', 'SQL', 'TypeScript', 'Git', 'Linux'] },
  teaching: `Creator and host, ${podcast.name}: ${podcast.episodes.length} Hinglish episodes on AI for Indian beginners and CS students, Nov 2025 to May 2026.`,
};

/** The /links page: one tap from your Instagram bio to everything else. */
export const linkHub = [
  { label: 'Portfolio', href: '/', hue: 'sky' as Hue, note: 'Projects with receipts' },
  { label: 'Resume', href: '/resume', hue: 'mango' as Hue, note: 'Web page or PDF, no phone number' },
  { label: 'AI, but Simple on Spotify', href: 'https://open.spotify.com/show/6xxWrNSItSJwd5UBznvQNw', hue: 'mint' as Hue, note: '28 episodes in Hinglish' },
  { label: 'AI, but Simple on YouTube', href: 'https://www.youtube.com/channel/UCpakmXio90uAd4RBZqimG8Q', hue: 'chili' as Hue },
  { label: 'Podcast Instagram', href: 'https://www.instagram.com/aibutsimple.studio/', hue: 'grape' as Hue, note: '@aibutsimple.studio' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nikhilsatyawanpatil/', hue: 'iris' as Hue },
  { label: 'GitHub', href: 'https://github.com/NikhilPatilAI', hue: 'lime' as Hue },
  { label: 'Instagram', href: 'https://www.instagram.com/nikhilpatil.ai/', hue: 'rose' as Hue, note: '@nikhilpatil.ai' },
  // TODO: ask Nikhil for the latest Reel or Short to feature here.
];

export const nav = [
  { label: 'Work', href: '/#work', hue: 'sky' as Hue },
  { label: 'Stack', href: '/#stack', hue: 'mango' as Hue },
  { label: 'Teaching', href: '/#teaching', hue: 'iris' as Hue },
  { label: 'Contact', href: '/#contact', hue: 'grape' as Hue },
];

export function projectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/** Plain text for a rich segment list, used for metadata and the resume. */
export function plain(segments: Segment[]) {
  return segments.map((s) => (typeof s === 'string' ? s : s.text)).join('');
}
