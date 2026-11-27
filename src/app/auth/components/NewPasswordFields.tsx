import { PasswordInput } from '@carbon/react';
import { CheckmarkFilled, CircleDash } from '@carbon/icons-react';
import { PASSWORD_MAX, PASSWORD_RULES, passwordIsValid } from '../utils/passwordRules';

interface Props {
  password: string;
  confirm: string;
  onPassword: (value: string) => void;
  onConfirm: (value: string) => void;
  tried: boolean;
  disabled: boolean;
  label?: string;
}


function NewPasswordFields({ password, confirm, onPassword, onConfirm, tried, disabled, label = 'New password' }: Props) {
  const tooLong = password.length > PASSWORD_MAX;
  const passwordBad = tried && !passwordIsValid(password);
  const confirmBad = tried && passwordIsValid(password) && confirm !== password;

  return (
    <>
      <PasswordInput
        id="new-password"
        labelText={label}
        autoComplete="new-password"
        placeholder="Enter a new password"
        size="md"
        hidePasswordLabel="Hide password"
        showPasswordLabel="Show password"
        tooltipAlignment="end"
        tooltipPosition="bottom"
        value={password}
        // The new password can't be copied out, so it has to be typed again below.
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onChange={(e) => onPassword(e.target.value)}
        invalid={passwordBad}
        invalidText={tooLong ? `Use at most ${PASSWORD_MAX} characters` : 'The password does not meet every rule below'}
        disabled={disabled}
      />

      <ul className="auth-rules" aria-label="Password rules">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          return (
            <li key={rule.label} className={met ? 'auth-rules__met' : ''}>
              {met ? <CheckmarkFilled size={16} aria-hidden="true" /> : <CircleDash size={16} aria-hidden="true" />}
              <span>{rule.label}</span>
              <span className="auth-rules__state">{met ? ' (done)' : ' (not yet)'}</span>
            </li>
          );
        })}
      </ul>

      <PasswordInput
        id="confirm-password"
        labelText="Confirm password"
        autoComplete="new-password"
        placeholder="Enter it again"
        size="md"
        hidePasswordLabel="Hide password"
        showPasswordLabel="Show password"
        tooltipAlignment="end"
        tooltipPosition="bottom"
        value={confirm}
        helperText="Type the password again. Pasting is turned off here."
        onPaste={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        onChange={(e) => onConfirm(e.target.value)}
        invalid={confirmBad}
        invalidText="The passwords do not match"
        disabled={disabled}
      />
    </>
  );
}

export default NewPasswordFields;