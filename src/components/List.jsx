export function List({
  items = [],
  renderItem,
  keyExtractor = (item, index) => index,
  className = '',
  itemClassName = '',
  animate = false,
  staggerDelay = 50,
}) {
  if (!items.length) return null;

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={keyExtractor(item, index)}
          className={`${itemClassName} ${animate ? 'transition-all duration-200 ease-out' : ''}`}
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
