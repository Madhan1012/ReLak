export const SAMPLE_DATA = {
  name: 'Arjun Sharma',
  email: 'arjun.sharma@example.com',
  phone: '+91 98765 43210',
  address: 'Bengaluru, Karnataka',
  photo_url: null,
  summary:
    'Full-Stack Engineer with 4+ years building scalable distributed systems and AI-powered products. Proven track record of reducing latency by 40% and shipping production features across fintech and SaaS domains. Passionate about clean architecture and developer experience.',
  skills: ['Python', 'TypeScript', 'React', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'AWS', 'System Design'],
  experience: [
    {
      company: 'TechNova Systems',
      role: 'Senior Software Engineer',
      duration: '2022 — Present',
      highlights: [
        'Architected a microservices migration reducing p99 latency from 800ms to 120ms across 12 services.',
        'Led a team of 5 engineers to deliver a real-time analytics dashboard serving 50k daily active users.',
        'Designed and implemented a distributed job queue processing 2M+ events per day with zero data loss.',
        'Reduced cloud infrastructure costs by 35% through query optimisation and caching strategy.',
      ],
    },
    {
      company: 'FlowState Digital',
      role: 'Backend Developer',
      duration: '2020 — 2022',
      highlights: [
        'Built RESTful APIs in FastAPI serving 10k+ requests/min with 99.9% uptime.',
        'Implemented Kafka-based event streaming pipeline for real-time financial transaction processing.',
        'Automated CI/CD pipelines cutting deployment time from 45 minutes to under 8 minutes.',
      ],
    },
  ],
  projects: [
    {
      title: 'NeuralQuery — NL-to-SQL Engine',
      description:
        'Open-source natural language to SQL translator using fine-tuned LLaMA-3. Supports 12 SQL dialects and achieves 91% accuracy on the Spider benchmark. Used by 200+ developers.',
      technologies: ['Python', 'LLaMA-3', 'FastAPI', 'PostgreSQL', 'Docker'],
    },
    {
      title: 'VaultLedger — Fintech Reconciliation',
      description:
        'Automated bank reconciliation system processing ₹50Cr+ in daily transactions. Reduced manual reconciliation effort by 80% using ML-based anomaly detection.',
      technologies: ['Python', 'Pandas', 'Scikit-learn', 'React', 'AWS Lambda'],
    },
  ],
  education: [
    {
      institution: 'Indian Institute of Technology, Madras',
      degree: 'B.Tech Computer Science & Engineering',
      year: '2016 — 2020',
    },
  ],
  tech_stack_icons: ['database', 'brain', 'code-2', 'server', 'cloud', 'git-branch'],
  style_id: 2,
};
