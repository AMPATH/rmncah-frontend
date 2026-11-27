// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import NoAccess from './NoAccess';

describe('NoAccess', () => {
  afterEach(cleanup);

  it('says when the signed-in account has no MPDSR role', () => {
    render(<NoAccess noRole />);
    expect(screen.getByText('Your account has no MPDSR role yet')).toBeTruthy();
  });

  it('explains a missing permission', () => {
    render(<NoAccess />);
    expect(screen.getByText("You don't have access to this page")).toBeTruthy();
  });

  it('tells a deactivated user so', () => {
    render(<NoAccess deactivated />);
    expect(screen.getByText('This account is deactivated')).toBeTruthy();
  });
});
