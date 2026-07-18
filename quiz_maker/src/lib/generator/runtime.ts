// Student-side runtime, embedded verbatim into the generated HTML file.
// Written with String.raw so regex backslashes survive, and using string
// concatenation (no backticks, no ${}) so nothing is interpolated at build time.
// It reads window.__QUIZ__ and drives rendering, the timer, and grading.

export const GENERATED_RUNTIME = String.raw`
(function () {
  "use strict";

  var DATA = window.__QUIZ__;
  var S = DATA.settings;

  var elTimer = document.getElementById("timer");
  var elInfo = document.getElementById("info");
  var elQuestions = document.getElementById("questions");
  var elForm = document.getElementById("quiz-form");
  var elResults = document.getElementById("results");

  var order = [];
  var submitted = false;
  var timerId = null;
  var remaining = 0;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function norm(s) {
    return String(s == null ? "" : s).trim().replace(/\s+/g, " ").toLowerCase();
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Build display order, applying shuffle settings and freezing option order.
  function buildOrder() {
    var qs = DATA.questions.slice();
    if (S.shuffleQuestions) qs = shuffle(qs);
    order = qs.map(function (q) {
      var item = { q: q, options: null };
      if (q.type === "mcq") {
        item.options = S.shuffleOptions ? shuffle(q.options) : q.options.slice();
      }
      return item;
    });
  }

  function renderInfo() {
    var m = DATA.meta;
    var html = "";
    html += '<div class="quiz-head">';
    html += "<h1>" + esc(m.title || "Quiz") + "</h1>";
    var bits = [];
    if (m.subject) bits.push("<span><strong>Subject:</strong> " + esc(m.subject) + "</span>");
    if (m.teacher) bits.push("<span><strong>Teacher:</strong> " + esc(m.teacher) + "</span>");
    if (m.duration) bits.push("<span><strong>Duration:</strong> " + esc(m.duration) + "</span>");
    bits.push("<span><strong>Total Marks:</strong> " + esc(DATA.totalMarks) + "</span>");
    bits.push("<span><strong>Questions:</strong> " + DATA.questions.length + "</span>");
    html += '<div class="quiz-meta">' + bits.join("") + "</div>";
    if (m.instructions) html += '<div class="instructions">' + esc(m.instructions) + "</div>";
    html += "</div>";
    elInfo.innerHTML = html;
  }

  function renderQuestion(item, index) {
    var q = item.q;
    var html = "";
    html += '<div class="card q-card" id="qc_' + q.id + '">';
    html += '<div class="q-head"><span class="q-num">' + (index + 1) + "</span>";
    html += '<span class="q-marks">' + q.marks + (q.marks === 1 ? " mark" : " marks") + "</span></div>";

    if (q.type === "fill-blank") {
      html += '<p class="q-prompt">' + renderBlankPrompt(q) + "</p>";
      html += '<div class="blank-inputs">';
      for (var b = 0; b < q.blanks.length; b++) {
        html += '<div class="blank-row">';
        if (q.blanks.length > 1) html += "<label>Blank " + (b + 1) + "</label>";
        html += '<input type="text" autocomplete="off" data-qid="' + q.id + '" data-bi="' + b + '" placeholder="Type your answer" />';
        html += "</div>";
      }
      html += "</div>";
    } else {
      html += '<p class="q-prompt">' + esc(q.prompt) + "</p>";
      html += '<div class="options">';
      if (q.type === "mcq") {
        for (var i = 0; i < item.options.length; i++) {
          var opt = item.options[i];
          html += '<label class="option" data-qid="' + q.id + '" data-oid="' + opt.id + '">';
          html += '<input type="radio" name="q_' + q.id + '" value="' + esc(opt.id) + '" />';
          html += "<span>" + esc(opt.text) + "</span></label>";
        }
      } else {
        html += '<label class="option" data-qid="' + q.id + '" data-oid="true">';
        html += '<input type="radio" name="q_' + q.id + '" value="true" /><span>True</span></label>';
        html += '<label class="option" data-qid="' + q.id + '" data-oid="false">';
        html += '<input type="radio" name="q_' + q.id + '" value="false" /><span>False</span></label>';
      }
      html += "</div>";
    }
    html += "</div>";
    return html;
  }

  // Replace each ___ marker with an inline underline placeholder.
  function renderBlankPrompt(q) {
    var parts = esc(q.prompt).split(/_{3,}/);
    var out = parts[0];
    for (var i = 1; i < parts.length; i++) {
      out += "<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>" + parts[i];
    }
    return out;
  }

  function renderQuestions() {
    var html = "";
    for (var i = 0; i < order.length; i++) html += renderQuestion(order[i], i);
    elQuestions.innerHTML = html;
  }

  // ----- Grading -----

  function gradeQuestion(item) {
    var q = item.q;
    var res = { status: "unanswered", earned: 0, correctText: "" };

    if (q.type === "mcq") {
      var sel = elForm.querySelector('input[name="q_' + q.id + '"]:checked');
      var correctOpt = null;
      for (var i = 0; i < q.options.length; i++) {
        if (q.options[i].id === q.correctOptionId) correctOpt = q.options[i];
      }
      res.correctText = correctOpt ? correctOpt.text : "";
      if (!sel) { res.status = "unanswered"; }
      else if (sel.value === q.correctOptionId) { res.status = "correct"; res.earned = q.marks; }
      else { res.status = "wrong"; }
    } else if (q.type === "true-false") {
      var selTf = elForm.querySelector('input[name="q_' + q.id + '"]:checked');
      res.correctText = q.correctAnswer ? "True" : "False";
      if (!selTf) { res.status = "unanswered"; }
      else if ((selTf.value === "true") === q.correctAnswer) { res.status = "correct"; res.earned = q.marks; }
      else { res.status = "wrong"; }
    } else {
      var inputs = elForm.querySelectorAll('input[data-qid="' + q.id + '"]');
      var anyFilled = false;
      var allCorrect = true;
      for (var b = 0; b < q.blanks.length; b++) {
        var val = inputs[b] ? inputs[b].value : "";
        if (val.trim()) anyFilled = true;
        var accepted = q.blanks[b].acceptedAnswers.map(norm);
        if (accepted.indexOf(norm(val)) === -1) allCorrect = false;
      }
      res.correctText = q.blanks.map(function (bl) {
        return bl.acceptedAnswers[0] || "";
      }).join(", ");
      if (!anyFilled) { res.status = "unanswered"; }
      else if (allCorrect) { res.status = "correct"; res.earned = q.marks; }
      else { res.status = "wrong"; }
    }
    return res;
  }

  function highlightOptions(item, res) {
    var q = item.q;
    if (q.type === "fill-blank") return;
    var labels = elForm.querySelectorAll('.option[data-qid="' + q.id + '"]');
    var correctOid = q.type === "mcq" ? q.correctOptionId : (q.correctAnswer ? "true" : "false");
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      var oid = label.getAttribute("data-oid");
      var input = label.querySelector("input");
      if (S.showCorrectAnswers && oid === correctOid) label.classList.add("correct");
      if (input && input.checked && oid !== correctOid) label.classList.add("wrong");
    }
  }

  function feedbackHtml(res) {
    var cls = res.status;
    var labelText = res.status === "correct" ? "Correct" : (res.status === "wrong" ? "Wrong" : "Unanswered");
    var html = '<div class="feedback ' + cls + '">';
    html += '<span class="label">' + labelText + "</span>";
    if (res.status === "correct") {
      html += " &nbsp; +" + res.earned + (res.earned === 1 ? " mark" : " marks");
    } else if (S.showCorrectAnswers && res.correctText) {
      html += '<div class="answer">Correct answer: <strong>' + esc(res.correctText) + "</strong></div>";
    }
    html += "</div>";
    return html;
  }

  function grade() {
    var obtained = 0;
    var correct = 0, wrong = 0, unanswered = 0;

    for (var i = 0; i < order.length; i++) {
      var item = order[i];
      var res = gradeQuestion(item);
      obtained += res.earned;
      if (res.status === "correct") correct++;
      else if (res.status === "wrong") wrong++;
      else unanswered++;

      var card = document.getElementById("qc_" + item.q.id);
      if (card) {
        card.classList.add("g-" + res.status);
        highlightOptions(item, res);
        card.insertAdjacentHTML("beforeend", feedbackHtml(res));
      }
    }
    return { obtained: obtained, correct: correct, wrong: wrong, unanswered: unanswered };
  }

  function renderResults(tally) {
    var total = DATA.totalMarks || 0;
    var pct = total > 0 ? Math.round((tally.obtained / total) * 100) : 0;
    var html = '<div class="card result-score">';
    html += "<h2>Your Score</h2>";
    if (S.showScore) html += '<div class="big">' + tally.obtained + " / " + total + "</div>";
    if (S.showPercentage) html += '<div class="pct">' + pct + "%</div>";
    html += '<div class="result-tallies">';
    html += '<span class="tally ok">Correct: ' + tally.correct + "</span>";
    html += '<span class="tally bad">Wrong: ' + tally.wrong + "</span>";
    html += '<span class="tally warn">Unanswered: ' + tally.unanswered + "</span>";
    html += "</div>";
    if (S.allowRetry) {
      html += '<div style="margin-top:18px"><button type="button" class="btn secondary" id="retry-btn">Retry Quiz</button></div>';
    }
    html += "</div>";
    elResults.innerHTML = html;

    var retry = document.getElementById("retry-btn");
    if (retry) retry.addEventListener("click", reset);
  }

  function disableForm() {
    var inputs = elForm.querySelectorAll("input");
    for (var i = 0; i < inputs.length; i++) inputs[i].disabled = true;
    var submitBtn = document.getElementById("submit-btn");
    if (submitBtn) submitBtn.classList.add("hidden");
  }

  function submit() {
    if (submitted) return;
    submitted = true;
    stopTimer();
    var tally = grade();
    renderResults(tally);
    disableForm();
    if (elResults.scrollIntoView) elResults.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ----- Timer -----

  function fmt(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function tick() {
    remaining--;
    if (remaining <= 0) {
      remaining = 0;
      elTimer.textContent = "⏱ 00:00";
      stopTimer();
      if (S.autoSubmitOnTimeout) submit();
      return;
    }
    elTimer.textContent = "⏱ " + fmt(remaining);
    if (remaining <= 60) elTimer.classList.add("low");
  }

  function startTimer() {
    if (!S.enableTimer) { elTimer.classList.add("hidden"); return; }
    remaining = Math.max(1, Math.round(S.timerMinutes * 60));
    elTimer.classList.remove("hidden", "low");
    elTimer.textContent = "⏱ " + fmt(remaining);
    timerId = setInterval(tick, 1000);
  }

  function stopTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  // ----- Lifecycle -----

  function reset() {
    submitted = false;
    elResults.innerHTML = "";
    buildOrder();
    renderQuestions();
    var submitBtn = document.getElementById("submit-btn");
    if (submitBtn) submitBtn.classList.remove("hidden");
    startTimer();
    if (window.scrollTo) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function init() {
    buildOrder();
    renderInfo();
    renderQuestions();
    elForm.addEventListener("submit", function (e) {
      e.preventDefault();
      submit();
    });
    startTimer();
  }

  init();
})();
`;
