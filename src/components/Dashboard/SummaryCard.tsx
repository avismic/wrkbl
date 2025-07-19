import { TrendingUp, TrendingDown } from 'lucide-react';

export const SummaryCard = ({ title, value, icon, change }) => {
  const isPositive = change >= 0;
  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.iconWrapper}>{icon}</div>
      <div className={cardStyles.content}>
        <h3 className={cardStyles.title}>{title}</h3>
        <p className={cardStyles.value}>{value}</p>
        <div className={`${cardStyles.change} ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{Math.abs(change)}% from last month</span>
        </div>
      </div>
    </div>
  );
};

const cardStyles = {
    card: "bg-white p-5 rounded-xl shadow-sm flex items-start gap-4",
    iconWrapper: "bg-green-100 text-green-600 p-3 rounded-full",
    content: "flex-1",
    title: "text-sm font-medium text-gray-500",
    value: "text-3xl font-bold text-gray-800 my-1",
    change: "flex items-center gap-1 text-xs font-medium",
};