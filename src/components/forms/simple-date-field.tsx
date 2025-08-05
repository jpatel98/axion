import React from 'react'
import { ValidatedInput, ValidatedInputProps } from './validated-input'

export interface SimpleDateFieldProps extends Omit<ValidatedInputProps, 'type'> {
  value?: string
  onChange?: (value: string) => void
}

// Simple date field that avoids all timezone issues by using a text input
export const SimpleDateField: React.FC<SimpleDateFieldProps> = ({
  value = '',
  onChange,
  ...props
}) => {
  return (
    <ValidatedInput
      type="text"
      pattern="\d{4}-\d{2}-\d{2}"
      placeholder="YYYY-MM-DD"
      value={value}
      onChange={onChange}
      {...props}
      inputProps={{
        style: { 
          // Make it look like a date input
          fontFamily: 'monospace',
        },
        maxLength: 10,
      }}
    />
  )
}