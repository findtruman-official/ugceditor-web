import React from 'react';
import ReactContentEditable, { Props } from 'react-contenteditable';

export const useRefCallback = <T extends any[]>(
  value: ((...args: T) => void) | undefined,
  deps?: React.DependencyList,
): ((...args: T) => void) => {
  const ref = React.useRef(value);

  React.useEffect(() => {
    ref.current = value;
  }, deps ?? [value]);

  return React.useCallback((...args: T) => {
    ref.current?.(...args);
  }, []);
};

export default function ContentEditable({
  ref,
  onChange,
  onInput,
  onBlur,
  onKeyPress,
  onKeyDown,
  ...props
}: Props) {
  const onChangeRef = useRefCallback(onChange);
  const onInputRef = useRefCallback(onInput);
  const onBlurRef = useRefCallback(onBlur);
  const onKeyPressRef = useRefCallback(onKeyPress);
  const onKeyDownRef = useRefCallback(onKeyDown);

  return (
    <ReactContentEditable
      {...props}
      onChange={onChangeRef}
      onInput={onInputRef}
      onBlur={onBlurRef}
      onKeyPress={onKeyPressRef}
      onKeyDown={onKeyDownRef}
    />
  );
}
