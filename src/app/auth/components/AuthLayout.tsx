import type { ReactNode } from 'react';
import { Theme } from '@carbon/react';
import '../auth.scss';


function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Theme theme="g10" className="login">
      <section className="login__intro">
        <p className="login__eyebrow">AMPATH · RMNCAH PROGRAMMES</p>
        
      </section>
      <main className="login__panel">{children}</main>
    </Theme>
  );
}

export default AuthLayout;