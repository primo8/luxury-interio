import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
  showCount?: boolean;
  count?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 13,
  showCount = false,
  count = 0,
}) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= rating ? '#f4a261' : '#e0d8e8'}
          color={star <= rating ? '#f4a261' : '#e0d8e8'}
        />
      ))}
      {showCount && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginLeft: '4px' }}>
          ({count})
        </span>
      )}
    </div>
  );
};
