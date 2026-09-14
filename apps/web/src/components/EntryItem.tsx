import { Link } from "react-router-dom";
import { PartOfSpeechLabels } from "@kamusi/core";
import { ApiLemma } from "../lib/api";

interface EntryItemProps {
  lemma: ApiLemma;
}

export function EntryItem({ lemma }: EntryItemProps) {
  return (
    <div className="py-6 border-b border-emerald-100 last:border-b-0 group">
      <Link
        to={`/entries/${lemma.id}`}
        className="block group-hover:opacity-80 transition-opacity"
      >
        <div className="flex items-baseline gap-3 mb-2">
          {/* Lemma Title: Deep Emerald Green */}
          <h2 className="text-2xl font-bold text-emerald-800 tracking-tight">
            {lemma.word}
          </h2>

          {/* Part of Speech: Steel Blue */}
          <span className="text-sm italic text-blue-600 font-medium">
            {PartOfSpeechLabels[lemma.partOfSpeech] || lemma.partOfSpeech}
          </span>
        </div>

        {/* Senses List */}
        <div className="space-y-4">
          {lemma.senses?.map((sense, idx) => (
            <div key={idx} className="pl-1">
              {/* Definition: Soft Charcoal Black */}
              <p className="text-lg text-slate-900 leading-relaxed mb-1">
                {sense.definition}
              </p>

              {/* Examples: Muted Golden-Amber */}
              {sense.examples && sense.examples.length > 0 && (
                <ul className="space-y-1 pl-4 border-l-2 border-amber-200">
                  {sense.examples.map((ex, exIdx) => (
                    <li
                      key={exIdx}
                      className="text-md italic text-amber-800 opacity-90"
                    >
                      {ex.sentence}
                      {ex.note && (
                        <span className="ml-2 text-sm text-slate-500 not-italic">
                          — {ex.note}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Link>
    </div>
  );
}
