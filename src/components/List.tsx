import * as React from 'react';

interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => React.Key;
  className?: string;
  itemClassName?: string;
  animate?: boolean;
  staggerDelay?: number;
}

export function List<T>({
  items = [],
  renderItem,
  keyExtractor = (_item, index) => index,
  className = '',
  itemClassName = '',
  animate = false,
  staggerDelay = 50,
}: ListProps<T>) {
  if (!items.length) return null;

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={keyExtractor(item, index)}
          className={`${itemClassName} ${
            animate ? 'transition-all duration-200 ease-out' : ''
          }`}
          style={
            animate
              ? {
                  transitionDelay: `${index * staggerDelay}ms`,
                }
              : {}
          }
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
