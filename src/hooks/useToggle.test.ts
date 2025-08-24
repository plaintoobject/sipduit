import { act, renderHook } from '@testing-library/react';

import { useToggle } from './useToggle';

describe('useToggle Hook', () => {
  it('initializes with the correct value', () => {
    const { result } = renderHook(() => useToggle(false));
    const [value] = result.current;
    expect(value).toBe(false);
  });

  it('setTrue the toggle', () => {
    const { result } = renderHook(() => useToggle(false));
    const [, { setTrue }] = result.current;
    act(() => {
      setTrue();
    });
    const [value] = result.current;
    expect(value).toBe(true);
  });

  it('setFalse the toggle', () => {
    const { result } = renderHook(() => useToggle(true));
    const [, { setFalse }] = result.current;
    act(() => {
      setFalse();
    });
    const [value] = result.current;
    expect(value).toBe(false);
  });
});
