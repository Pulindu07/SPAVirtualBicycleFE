import "./StatsCard.css";

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

export const StatsCard = ({ title, value, icon, color }: StatsCardProps) => {
  return (
    <div className="stats-card" style={{ borderTopColor: color }}>
      <div className="stats-icon" style={{ backgroundColor: `${color}20` }}>
        {icon}
      </div>
      <div className="stats-content">
        <h3 className="stats-title">{title}</h3>
        <p className="stats-value">{value}</p>
      </div>
    </div>
  );
};
