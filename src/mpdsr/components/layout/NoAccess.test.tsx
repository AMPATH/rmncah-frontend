// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import NoAccess from './NoAccess';

describe('NoAccess', () => {
  afterEach(cleanup);

  it('asks to choose a user when nobody is signed in', () => {
    render(<NoAccess signedIn={false} />);
    expect(screen.getByText('Choose a user first')).toBeTruthy();
  });

  it('explains a missing permission', () => {
    render(<NoAccess signedIn />);
    expect(screen.getByText("You don't have access to this page")).toBeTruthy();
  });

  it('tells a deactivated user so', () => {
    render(<NoAccess signedIn deactivated />);
    expect(screen.getByText('This account is deactivated')).toBeTruthy();
  });
});
