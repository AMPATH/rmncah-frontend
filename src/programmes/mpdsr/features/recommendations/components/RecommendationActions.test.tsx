// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { makeRecommendation, makeUser } from '../../../test/fixtures';
import RecommendationActions from './RecommendationActions';

// The "What happens next" buttons on a recommendation page: which are enabled for whom.
function renderActions(...args: Parameters<typeof RecommendationActions>) {
  return render(
    <MemoryRouter>
      <RecommendationActions {...args[0]} />
    </MemoryRouter>
  );
}

const enabled = (name: string) => screen.getByRole('button', { name }).hasAttribute('disabled') === false;

describe('RecommendationActions', () => {
  afterEach(cleanup);

  it('lets the holder of open work mark it as done, and nothing else', () => {
    renderActions({
      recommendation: makeRecommendation({ status: 'Open', responsiblePersonId: 'u3' }),
      user: makeUser({ id: 'u3', role: 'FACILITY_REPORTER' }),
    });

    expect(enabled('Mark as done')).toBe(true);
    expect(enabled('Accept or escalate')).toBe(false);
    expect(enabled('Approve or reject')).toBe(false);
    expect(enabled('Reassign')).toBe(false);
  });

  it('explains why a button is disabled', () => {
    renderActions({
      recommendation: makeRecommendation({ status: 'Open', responsiblePersonId: 'u3' }),
      user: makeUser({ id: 'u3', role: 'FACILITY_REPORTER' }),
    });

    expect(screen.getByText('Only work marked as done can be approved or rejected.')).toBeTruthy();
  });

  it('lets the chair approve completed work', () => {
    renderActions({
      recommendation: makeRecommendation({ status: 'Pending approval', responsiblePersonId: 'u3' }),
      user: makeUser({ id: 'u4', role: 'FACILITY_CHAIR' }),
    });

    expect(enabled('Approve or reject')).toBe(true);
    expect(enabled('Mark as done')).toBe(false);
  });

  it('enables nothing when nobody is chosen', () => {
    renderActions({ recommendation: makeRecommendation(), user: null });

    for (const button of screen.getAllByRole('button')) {
      expect(button.hasAttribute('disabled')).toBe(true);
    }
  });
});
