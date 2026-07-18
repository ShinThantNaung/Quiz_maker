"use client";

import type { QuizSettings } from "@/types/quiz";
import { Toggle } from "@/components/ui/Toggle";

interface Props {
  settings: QuizSettings;
  onChange: (patch: Partial<QuizSettings>) => void;
}

const TIMER_PRESETS = [15, 30, 60];

export function SettingsForm({ settings, onChange }: Props) {
  return (
    <div className="space-y-6">
      <section className="card p-5">
        <h2 className="mb-3 text-base font-semibold text-slate-800">Question Behaviour</h2>
        <div className="space-y-2">
          <Toggle
            label="Shuffle Questions"
            description="Randomize question order for each student."
            checked={settings.shuffleQuestions}
            onChange={(v) => onChange({ shuffleQuestions: v })}
          />
          <Toggle
            label="Shuffle MCQ Options"
            description="Randomize the order of multiple-choice options."
            checked={settings.shuffleOptions}
            onChange={(v) => onChange({ shuffleOptions: v })}
          />
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 text-base font-semibold text-slate-800">Timer</h2>
        <div className="space-y-2">
          <Toggle
            label="Enable Timer"
            description="Show a countdown while students take the quiz."
            checked={settings.enableTimer}
            onChange={(v) => onChange({ enableTimer: v })}
          />
          {settings.enableTimer && (
            <div className="rounded-lg border border-slate-200 p-3">
              <span className="label">Duration (minutes)</span>
              <div className="flex flex-wrap items-center gap-2">
                {TIMER_PRESETS.map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => onChange({ timerMinutes: min })}
                    className={
                      "rounded-lg border px-3 py-1.5 text-sm font-medium transition " +
                      (settings.timerMinutes === min
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50")
                    }
                  >
                    {min === 60 ? "1 Hour" : `${min} Min`}
                  </button>
                ))}
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  Custom
                  <input
                    type="number"
                    min={1}
                    className="input w-24 px-2 py-1.5"
                    value={settings.timerMinutes}
                    onChange={(e) =>
                      onChange({ timerMinutes: Math.max(1, Number(e.target.value) || 1) })
                    }
                  />
                </label>
              </div>
            </div>
          )}
          <Toggle
            label="Automatically Submit On Timeout"
            description="Submit and grade automatically when the timer reaches zero."
            checked={settings.autoSubmitOnTimeout}
            onChange={(v) => onChange({ autoSubmitOnTimeout: v })}
          />
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 text-base font-semibold text-slate-800">Results</h2>
        <div className="space-y-2">
          <Toggle
            label="Show Score"
            description="Display obtained marks out of total."
            checked={settings.showScore}
            onChange={(v) => onChange({ showScore: v })}
          />
          <Toggle
            label="Show Percentage"
            description="Display the percentage score."
            checked={settings.showPercentage}
            onChange={(v) => onChange({ showPercentage: v })}
          />
          <Toggle
            label="Show Correct Answers"
            description="Reveal the correct answer for each question after submitting."
            checked={settings.showCorrectAnswers}
            onChange={(v) => onChange({ showCorrectAnswers: v })}
          />
          <Toggle
            label="Allow Retrying Quiz"
            description="Let students reset and take the quiz again."
            checked={settings.allowRetry}
            onChange={(v) => onChange({ allowRetry: v })}
          />
        </div>
      </section>
    </div>
  );
}
