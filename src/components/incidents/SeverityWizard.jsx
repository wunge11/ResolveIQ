/**
 * SeverityWizard.jsx
 * Wizard 3 pertanyaan untuk merekomendasikan severity insiden
 * berdasarkan matriks aturan bisnis.
 *
 * @param {object}   props
 * @param {Function} props.onRecommend - Callback ({ severity, reason }) saat rekomendasi selesai
 * @param {Function} props.onClose     - Callback tutup wizard
 */

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { recommendSeverity } from '../../utils/severity.js';
import Button from '../common/Button.jsx';
import Badge from '../common/Badge.jsx';
import { getSeverityColor } from '../../utils/severity.js';

const QUESTIONS = [
  {
    key:     'userScope',
    label:   'Berapa banyak pengguna yang terdampak?',
    options: [
      { value: 'all',   label: 'Semua pengguna (>50%)',          emoji: '🔴' },
      { value: 'major', label: 'Sebagian besar (10–50%)',         emoji: '🟠' },
      { value: 'minor', label: 'Sedikit (<10%)',                  emoji: '🟡' },
      { value: 'none',  label: 'Tidak ada / hanya internal',      emoji: '⚪' },
    ],
  },
  {
    key:     'serviceLevel',
    label:   'Seberapa parah gangguan pada layanan?',
    options: [
      { value: 'down',     label: 'Layanan mati total (tidak bisa diakses)', emoji: '🔴' },
      { value: 'degraded', label: 'Layanan terdegradasi (lambat/error sebagian)', emoji: '🟠' },
      { value: 'minor',    label: 'Gangguan kecil (fungsi minor)',             emoji: '🟡' },
      { value: 'cosmetic', label: 'Masalah tampilan / informasional',          emoji: '⚪' },
    ],
  },
  {
    key:     'workaround',
    label:   'Apakah ada workaround yang tersedia?',
    options: [
      { value: 'none',      label: 'Tidak ada workaround',               emoji: '🔴' },
      { value: 'limited',   label: 'Ada tapi terbatas / rumit',           emoji: '🟠' },
      { value: 'available', label: 'Tersedia dan mudah digunakan',        emoji: '🟢' },
    ],
  },
];

function SeverityWizard({ onRecommend, onClose }) {
  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState({ userScope: '', serviceLevel: '', workaround: '' });
  const [result,  setResult]  = useState(null);

  const currentQ = QUESTIONS[step];
  const isLastStep = step === QUESTIONS.length - 1;

  const handleSelect = (key, value) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    if (isLastStep) {
      // Semua pertanyaan terjawab — hitung rekomendasi
      const rec = recommendSeverity(newAnswers);
      setResult(rec);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleUse = () => {
    if (result) onRecommend(result);
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
      setResult(null);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({ userScope: '', serviceLevel: '', workaround: '' });
    setResult(null);
  };

  return (
    <div className="border border-brand-50 bg-brand-50 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-brand-600" aria-hidden="true" />
        <span className="text-sm font-semibold text-brand-700">Severity Wizard</span>
        {/* Progress dots */}
        <div className="flex gap-1 ml-auto" aria-label={`Langkah ${step + 1} dari ${QUESTIONS.length}`}>
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < step       ? 'bg-brand-600' :
                i === step     ? 'bg-brand-400' :
                                  'bg-slate-200'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {/* Hasil rekomendasi */}
      {result ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Rekomendasi Severity:</p>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
            <Badge className={getSeverityColor(result.severity)} size="md">
              {result.severity}
            </Badge>
            <p className="text-sm text-slate-600">{result.reason}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleUse} className="flex-1">
              Gunakan {result.severity}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Ulangi
            </Button>
          </div>
        </div>
      ) : (
        /* Pertanyaan */
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">{currentQ.label}</p>
          <div className="space-y-2">
            {currentQ.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSelect(currentQ.key, opt.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm text-left transition-all ${
                  answers[currentQ.key] === opt.value
                    ? 'border-brand-600 bg-white text-brand-700 font-medium'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-white'
                }`}
              >
                <span aria-hidden="true">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Navigasi */}
          {step > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
            >
              <ChevronLeft size={12} aria-hidden="true" /> Kembali
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SeverityWizard;
