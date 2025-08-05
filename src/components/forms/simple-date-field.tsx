import React from 'react'
import { ValidatedInput, ValidatedInputProps } from './validated-input'

export interface SimpleDateFieldProps extends Omit<ValidatedInputProps, 'type'> {
  value?: string
  onChange?: (value: string) => void
}

// Style object defined outside component to prevent unnecessary re-renders
const dateInputStyle = { 
  fontFamily: 'monospace',
}

// Input props object defined outside component for performance
const dateInputProps = {
  style: dateInputStyle,
  maxLength: 10,
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
      inputProps={dateInputProps}
    />
  )
}