interface KpiCardProps {
  value: string | number;
  label: string;
  alert?: boolean;
}

function KpiCard({ value, label, alert = false }: KpiCardProps) {
  return (
    <div className={alert ? 'kpi-card kpi-card--alert' : 'kpi-card'}>
      <p className={alert ? 'kpi-card__value kpi-card__value--alert' : 'kpi-card__value'}>{value}</p>
      <p className="kpi-card__label">{label}</p>
    </div>
  );
}

export default KpiCard;
