import { Icon } from '@/components/Icons';

export function Stars({
  value,
  size = 16,
  showEmpty = true,
}: {
  value: number;
  size?: number;
  showEmpty?: boolean;
}) {
  const rounded = Math.round(value);

  return (
    <span
      className="inline-flex items-center gap-0.5 align-middle"
      aria-label={`Note : ${value} sur 5`}
    >
      {[1, 2, 3, 4, 5].map((index) => {
        if (!showEmpty && index > rounded) return null;
        return (
          <Icon
            key={index}
            name="star"
            size={size}
            className={
              index <= rounded
                ? 'fill-amber-400 text-amber-400'
                : 'text-line'
            }
          />
        );
      })}
    </span>
  );
}
