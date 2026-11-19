// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { makeRecommendation, makeUser } from '../../../test/fixtures';
import RecommendationActions from './RecommendationActions';

function renderActions(...args: Parameters<typeof RecommendationActions>) {
  return render(
    <MemoryRouter>
      <RecommendationActions {...args[0]} />
    </MemoryRouter>
  );
}

const buttonNames = () => screen.queryAllByRole('button').map((button) => button.textContent);

describe('RecommendationActions', () => {
  afterEach(cleanup);

  it('shows the holder of open work only what they can do', () => {
    renderActions({
      recommendation: makeRecommendation({ status: 'Open', responsiblePersonId: 'u3' }),
      user: makeUser({ id: 'u3', role: 'FACILITY_REPORTER' }),
    });

    expect(buttonNames()).toContain('Mark as done');
    expect(buttonNames()).not.toContain('Approve or reject');
    expect(buttonNames()).not.toContain('Reassign');
    expect(buttonNames()).not.toContain('Accept or escalate');
  });

  it('shows the chair only the approval for completed work', () => {
    renderActions({
      recommendation: makeRecommendation({ status: 'Pending approval', responsiblePersonId: 'u3' }),
      user: makeUser({ id: 'u4', role: 'FACILITY_CHAIR' }),
    });

    expect(buttonNames()).toContain('Approve or reject');
    expect(buttonNames()).not.toContain('Mark as done');
  });

  it('says who it is waiting on when the user has nothing to do', () => {
    renderActions({
      recommendation: makeRecommendation({ status: 'Pending acceptance', responsiblePersonId: 'u6' }),
      user: makeUser({ id: 'u7', role: 'COUNTY_SURVEILLANCE_LEAD', level: 'county' }),
      holderName: 'Peter Kiplagat',
    });

    expect(buttonNames()).toEqual([]);
    expect(screen.getByText('Waiting for Peter Kiplagat to accept it.')).toBeTruthy();
  });

  it('shows no buttons when nobody is chosen', () => {
    renderActions({ recommendation: makeRecommendation(), user: null });

    expect(buttonNames()).toEqual([]);
  });
});
