export interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function formatDateField(value: string) {
  return value ? value.split('-').reverse().join('/') : 'DD/MM/AAAA';
}
