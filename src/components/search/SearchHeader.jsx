import SearchField from '../ui/SearchField.jsx';

export default function SearchHeader({
  title,
  description,
  value,
  onSearchChange,
  placeholder,
  ariaLabel,
}) {
  return (
    <>
      <div className="sr-only">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className="sticky top-0 z-30 -mx-5 bg-canvas/95 px-5 py-3 backdrop-blur md:-mx-8 md:px-8">
        <SearchField
          variant="filled"
          className="mx-auto w-full"
          value={value}
          onChange={event => onSearchChange(event.target.value)}
          placeholder={placeholder}
          ariaLabel={ariaLabel}
        />
      </div>
    </>
  );
}
