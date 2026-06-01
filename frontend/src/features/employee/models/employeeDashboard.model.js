export const KPI_PRESENTATION = [
  {
    key: 'qualityScore',
    label: 'Calidad',
    color: '#00e5ff'
  },
  {
    key: 'deliveryScore',
    label: 'Entrega',
    color: '#1dd1a1'
  },
  {
    key: 'bugFixRate',
    label: 'Correccion de Bugs',
    color: '#feca57'
  },
  {
    key: 'collaborationScore',
    label: 'Colaboracion',
    color: '#a29bfe'
  },
  {
    key: 'innovationScore',
    label: 'Innovacion',
    color: '#ff6b6b'
  }
];

export function getScoreStatus(score) {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'regular';
  return 'low';
}
