import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useDebounce from './useDebounce';

describe('useDebounce', () => {
  vi.useFakeTimers();

  it('debounces the value properly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'a', delay: 300 }
      }
    );

    // Initially, it should return the default value immediately
    expect(result.current).toBe('a');

    // Change the value
    rerender({ value: 'b', delay: 300 });
    
    // Fast forward time, but not enough
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    // Value should still be 'a'
    expect(result.current).toBe('a');
    
    // Fast forward past the delay
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    // Value should now be 'b'
    expect(result.current).toBe('b');
  });
});
