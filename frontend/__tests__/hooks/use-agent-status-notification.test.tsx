import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useAgentStatusNotification } from '../../src/hooks/use-agent-status-notification';
import { sendNotification } from '../../src/services/notification';

import { vi } from 'vitest';

vi.mock('../../src/services/notification', () => ({
  sendNotification: vi.fn(),
}));

describe('useAgentStatusNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('sends notification when agent status changes from RUNNING to STOPPED', () => {
    // First render with RUNNING status
    const { rerender } = renderHook(
      ({ status }) => useAgentStatusNotification(status),
      { initialProps: { status: 'RUNNING' } }
    );

    // Change status to STOPPED
    rerender({ status: 'STOPPED' });

    expect(sendNotification).toHaveBeenCalledWith('OpenHands Agent', {
      body: 'The agent has finished its task',
      icon: '/android-chrome-192x192.png'
    });
  });

  it('does not send notification when agent status changes from STOPPED to RUNNING', () => {
    // First render with STOPPED status
    const { rerender } = renderHook(
      ({ status }) => useAgentStatusNotification(status),
      { initialProps: { status: 'STOPPED' } }
    );

    // Change status to RUNNING
    rerender({ status: 'RUNNING' });

    expect(sendNotification).not.toHaveBeenCalled();
  });

  it('does not send notification on initial render with STOPPED status', () => {
    renderHook(() => useAgentStatusNotification('STOPPED'));
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it('does not send notification when status remains the same', () => {
    const { rerender } = renderHook(
      ({ status }) => useAgentStatusNotification(status),
      { initialProps: { status: 'RUNNING' } }
    );

    // Re-render with same status
    rerender({ status: 'RUNNING' });

    expect(sendNotification).not.toHaveBeenCalled();
  });
});
