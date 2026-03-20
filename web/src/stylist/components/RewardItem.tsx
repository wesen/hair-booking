interface RewardItemProps {
  pts: number;
  name: string;
  desc: string;
}

export function RewardItem({ pts, name, desc }: RewardItemProps) {
  return (
    <div data-part="reward-item">
      <div data-part="reward-cost">{pts} pts</div>
      <div>
        <div data-part="reward-name">{name}</div>
        <div data-part="reward-desc">{desc}</div>
      </div>
    </div>
  );
}
