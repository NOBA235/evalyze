import React from 'react';
import { Clock, Cpu, CheckCircle2, CheckCheck } from 'lucide-react';

const config = {
  submitted:        { label: 'Submitted',       icon: Clock,        cls: 'status-submitted'        },
  evaluating:       { label: 'Evaluating',      icon: Cpu,          cls: 'status-evaluating', pulse: true },
  ai_checked:       { label: 'AI Checked',      icon: CheckCircle2, cls: 'status-ai_checked'       },
  teacher_approved: { label: 'Approved',         icon: CheckCheck,   cls: 'status-teacher_approved' },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = config[status] || config.submitted;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <Icon size={11} className={cfg.pulse ? 'animate-pulse' : ''} />
      {cfg.label}
    </span>
  );
}
