import * as Icons from 'lucide-react';

function toPascalCase(str) {
  return (str || '')
    .split(/[-_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

export default function LucideIcon({ name, size = 18, color = '#003366', strokeWidth = 1.5 }) {
  const Icon = Icons[toPascalCase(name)] || Icons.Code2;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}
