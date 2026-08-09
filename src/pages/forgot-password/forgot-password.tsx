import { FC, useState, SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForgotPasswordUI } from '@ui-pages';
import { useDispatch } from '../../services/store';
import { forgotPassword } from '../../services/slices/userSlice';

export const ForgotPassword: FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<Error | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    const result = await dispatch(forgotPassword({ email }));

    if (forgotPassword.fulfilled.match(result)) {
      localStorage.setItem('resetPassword', 'true');
      navigate('/reset-password', { replace: true });
    }

    if (forgotPassword.rejected.match(result)) {
      setError(new Error(result.payload || 'Ошибка восстановления пароля'));
    }
  };

  return (
    <ForgotPasswordUI
      errorText={error?.message}
      email={email}
      setEmail={setEmail}
      handleSubmit={handleSubmit}
    />
  );
};
