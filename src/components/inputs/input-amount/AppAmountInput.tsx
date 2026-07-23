import React, { useState } from 'react';
import { Platform, TextInputSelectionChangeEvent } from 'react-native';
import AppTextInput, { AppTextInputProps } from '../AppTextInput';

export interface AppAmountInputProps extends AppTextInputProps {}

const AppAmountInput = ({
  onChangeValue,
  value: valueProp,
  ...props
}: AppAmountInputProps) => {
  const [innerValue, setInnerValue] = useState('');
  const [prev, setPrev] = useState('');
  const [selection, setSelection] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : innerValue;

  const setValueSafe = (val: string) => {
    if (!isControlled) {
      setInnerValue(val);
    }
    setPrev(val);
    onChangeValue?.(val);
  };

  const sanitize = (text: string, prevValue: string) => {
    let v = (text || '').replace(/,/g, '.').replace(/[^0-9.]/g, '');
    if (v.startsWith('.')) v = '0' + v;
    const firstDot = v.indexOf('.');
    if (firstDot !== -1) {
      v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
    }
    if (firstDot !== -1) {
      const [intPart, decPart = ''] = v.split('.');
      if (decPart.length > 2) {
        v = intPart + '.' + decPart.slice(0, 2);
      }
    }
    if (
      v.endsWith('.') &&
      /\.\d$/.test(prevValue) &&
      v === prevValue.slice(0, -1)
    ) {
      v = v.slice(0, -1);
    }
    if (v !== '' && !v.startsWith('0.')) {
      const [intPart, decPart] = v.split('.');
      const cleanInt = intPart.replace(/^0+(?=\d)/, '');
      v =
        decPart !== undefined
          ? `${cleanInt || '0'}.${decPart}`
          : cleanInt || '0';
    }

    return v;
  };

  const handleSelectionChange = (e: TextInputSelectionChangeEvent) => {
    setSelection(e.nativeEvent.selection);
  };

  const handleChange = (text: string) => {
    const formatted = sanitize(text, prev);
    setValueSafe(formatted);
  };

  const handleBlur = () => {
    if (value === '' || value === '.') {
      setValueSafe('');
      return;
    }
    const num = Number(value);
    if (Number.isNaN(num)) {
      setValueSafe('');
      return;
    }
    const fixed = num.toFixed(2);
    setValueSafe(fixed);
  };

  const handleFocus = () => {
    let newValue = value;
    if (newValue.endsWith('.00')) {
      newValue = newValue.split('.')[0];
    } else if (/\.\d0$/.test(newValue)) {
      const [intPart, decimalPart] = newValue.split('.');
      newValue = `${intPart}.${decimalPart[0]}`;
    }
    if (newValue !== value) {
      setValueSafe(newValue);
    }
  };

  return (
    <AppTextInput
      {...props}
      iconLeft="sol"
      maxLength={10}
      value={value}
      onChangeValue={handleChange}
      placeholder="0.00"
      keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
      onBlur={handleBlur}
      onFocus={handleFocus}
      selection={selection}
      onSelectionChange={handleSelectionChange}
    />
  );
};

export default AppAmountInput;
