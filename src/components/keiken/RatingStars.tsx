'use client';

interface RatingStarsProps {
  rating: number | null;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function RatingStars({ rating, onChange, readonly = false, size = 'md' }: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const starSize = sizeClasses[size];

  const handleClick = (starIndex: number, isHalf: boolean) => {
    if (readonly || !onChange) return;
    const newRating = isHalf ? starIndex + 0.5 : starIndex + 1;
    onChange(newRating);
  };

  const renderStar = (index: number) => {
    const filled = rating !== null && rating >= index + 1;
    const halfFilled = rating !== null && rating >= index + 0.5 && rating < index + 1;

    return (
      <div key={index} className={`relative ${readonly ? '' : 'cursor-pointer'}`}>
        {/* Background star (empty) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${starSize} text-gray-600`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>

        {/* Half star overlay */}
        {halfFilled && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${starSize} text-yellow-400 absolute top-0 left-0`}
            viewBox="0 0 20 20"
            fill="currentColor"
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}

        {/* Full star overlay */}
        {filled && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${starSize} text-yellow-400 absolute top-0 left-0`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}

        {/* Click areas for half and full star */}
        {!readonly && (
          <>
            <button
              type="button"
              className="absolute top-0 left-0 w-1/2 h-full opacity-0"
              onClick={() => handleClick(index, true)}
              aria-label={`Rate ${index + 0.5} stars`}
            />
            <button
              type="button"
              className="absolute top-0 right-0 w-1/2 h-full opacity-0"
              onClick={() => handleClick(index, false)}
              aria-label={`Rate ${index + 1} stars`}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map(index => renderStar(index))}
      {rating !== null && <span className="ml-2 text-sm text-gray-400">({rating})</span>}
    </div>
  );
}
