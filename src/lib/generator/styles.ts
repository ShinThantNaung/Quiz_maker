// CSS embedded verbatim into the generated offline HTML file.
// No external fonts, CDNs, or assets — everything is self-contained.

export const GENERATED_CSS = `
*, *::before, *::after { box-sizing: border-box; }
:root {
  --bg: #f1f5f9;
  --card: #ffffff;
  --ink: #0f172a;
  --muted: #64748b;
  --line: #e2e8f0;
  --brand: #2563eb;
  --brand-dark: #1d4ed8;
  --ok: #16a34a;
  --ok-bg: #dcfce7;
  --bad: #dc2626;
  --bad-bg: #fee2e2;
  --warn: #d97706;
  --warn-bg: #fef3c7;
}
html, body { margin: 0; padding: 0; }
body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: var(--bg);
  color: var(--ink);
  line-height: 1.55;
  -webkit-text-size-adjust: 100%;
}
.wrap { max-width: 780px; margin: 0 auto; padding: 24px 16px 80px; }
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 22px;
  margin-bottom: 18px;
  box-shadow: 0 1px 2px rgba(15,23,42,.04);
}
.quiz-head h1 { margin: 0 0 6px; font-size: 26px; line-height: 1.2; }
.quiz-meta { display: flex; flex-wrap: wrap; gap: 8px 18px; color: var(--muted); font-size: 14px; margin-top: 8px; }
.quiz-meta span strong { color: var(--ink); font-weight: 600; }
.instructions { margin-top: 14px; padding: 12px 14px; background: var(--brand); background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; color: #1e3a8a; font-size: 14px; white-space: pre-wrap; }
.q-num { display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 26px; padding: 0 8px; border-radius: 999px; background: var(--brand); color: #fff; font-size: 13px; font-weight: 700; }
.q-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.q-marks { font-size: 12px; font-weight: 600; color: var(--muted); background: #f1f5f9; border-radius: 999px; padding: 3px 10px; white-space: nowrap; }
.q-prompt { font-size: 16px; font-weight: 500; margin: 0 0 14px; white-space: pre-wrap; }
.options { display: flex; flex-direction: column; gap: 10px; }
.option {
  display: flex; align-items: center; gap: 12px;
  border: 1px solid var(--line); border-radius: 10px;
  padding: 11px 14px; cursor: pointer; transition: background .12s, border-color .12s;
  font-size: 15px;
}
.option:hover { border-color: var(--brand); background: #f8fafc; }
.option input { width: 18px; height: 18px; accent-color: var(--brand); flex: none; margin: 0; }
.option.correct { border-color: var(--ok); background: var(--ok-bg); }
.option.wrong { border-color: var(--bad); background: var(--bad-bg); }
.blank-inputs { display: flex; flex-direction: column; gap: 10px; }
.blank-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.blank-row label { font-size: 13px; color: var(--muted); min-width: 64px; }
input[type="text"] {
  font: inherit; padding: 10px 12px; border: 1px solid var(--line);
  border-radius: 10px; width: 100%; max-width: 340px; background: #fff; color: var(--ink);
}
input[type="text"]:focus { outline: 2px solid var(--brand); outline-offset: 1px; border-color: var(--brand); }
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  font: inherit; font-weight: 600; cursor: pointer;
  border: none; border-radius: 10px; padding: 12px 22px;
  background: var(--brand); color: #fff; transition: background .12s;
}
.btn:hover { background: var(--brand-dark); }
.btn.secondary { background: #fff; color: var(--brand); border: 1px solid var(--brand); }
.btn.secondary:hover { background: #eff6ff; }
.submit-bar { text-align: center; margin-top: 6px; }
.submit-bar .btn { min-width: 200px; font-size: 16px; }
.timer {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: #0f172a; color: #fff; padding: 10px; border-radius: 12px;
  font-variant-numeric: tabular-nums; font-weight: 700; font-size: 18px; margin-bottom: 16px;
}
.timer.low { background: var(--bad); }
.result-score { text-align: center; }
.result-score .big { font-size: 44px; font-weight: 800; margin: 4px 0; }
.result-score .pct { font-size: 22px; font-weight: 700; color: var(--brand); }
.result-tallies { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 14px; }
.tally { border-radius: 10px; padding: 8px 14px; font-size: 14px; font-weight: 600; }
.tally.ok { background: var(--ok-bg); color: var(--ok); }
.tally.bad { background: var(--bad-bg); color: var(--bad); }
.tally.warn { background: var(--warn-bg); color: var(--warn); }
.feedback { margin-top: 8px; padding: 10px 12px; border-radius: 10px; font-size: 14px; }
.feedback.correct { background: var(--ok-bg); color: #166534; }
.feedback.wrong { background: var(--bad-bg); color: #991b1b; }
.feedback.unanswered { background: var(--warn-bg); color: #92400e; }
.feedback .label { font-weight: 700; }
.feedback .answer { margin-top: 4px; }
.q-card.g-correct { border-left: 4px solid var(--ok); }
.q-card.g-wrong { border-left: 4px solid var(--bad); }
.q-card.g-unanswered { border-left: 4px solid var(--warn); }
.hidden { display: none !important; }
.footer-note { text-align: center; color: var(--muted); font-size: 12px; margin-top: 24px; }
@media (max-width: 480px) {
  .wrap { padding: 16px 12px 60px; }
  .card { padding: 16px; }
  .quiz-head h1 { font-size: 22px; }
}
`;
