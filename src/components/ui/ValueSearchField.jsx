import SharedSearchField from './SearchField.jsx';

export default function SearchField({ value, onChange, placeholder = '검색' }) {
  return (
    <SharedSearchField
      variant="filled"
      value={value}
      onChange={event => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}
