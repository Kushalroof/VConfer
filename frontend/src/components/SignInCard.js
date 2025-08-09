import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  color: '#710117',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  borderRadius: '15px',
}));

export default function SignInCard() {
  const { handleLogin } = React.useContext(AuthContext);

  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const navigate = useNavigate();
  const [loginErrorMessage, setLoginErrorMessage] = React.useState('');

  const validateInputs = () => {
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    let isValid = true;

    if (!username.value || username.value.length < 3) {
      setUsernameError(true);
      setUsernameErrorMessage('Username must be at least 3 characters long.');
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isValid = validateInputs();
    if (!isValid) return;

    const form = new FormData(event.currentTarget);
    const username = form.get('username');
    const password = form.get('password');

    try {
      const message = await handleLogin(username, password);
      console.log(message);
      setLoginErrorMessage('');
      navigate("/home");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed.";
      setLoginErrorMessage(message);
      console.error(message);
    }
  };

  return (
    <Card variant="outlined">
      <Typography
        component="h1"
        variant="h4"
        sx={{
          width: '100%',
          fontSize: 'clamp(2rem, 10vw, 2.15rem)',
          color: '#710117',
          fontWeight: '600',
        }}
      >
        Sign in
      </Typography>
      {loginErrorMessage && (
    <Typography
      variant="body2"
      sx={{
        color: 'error.main',
        mb: 2,
        fontWeight: 'bold',
        textAlign: 'center',
      }}
    >
      {loginErrorMessage}
    </Typography>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
      >
        <FormControl>
          <FormLabel htmlFor="username" sx={{ color: '#710117' }}>
            Username
          </FormLabel>
          <TextField
            error={usernameError}
            helperText={usernameErrorMessage}
            id="username"
            type="text"
            name="username"
            placeholder="Enter your username"
            autoComplete="username"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={usernameError ? 'error' : 'primary'}
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="password" sx={{ color: '#710117' }}>
            Password
          </FormLabel>
          <TextField
            error={passwordError}
            helperText={passwordErrorMessage}
            name="password"
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="current-password"
            required
            fullWidth
            variant="outlined"
            color={passwordError ? 'error' : 'primary'}
          />
        </FormControl>

        <FormControlLabel
          control={<Checkbox value="remember" color="primary" />}
          label="Remember me"
        />

        <Button type="submit" fullWidth variant="contained" sx={{ backgroundColor: '#710117' }}>
          Sign in
        </Button>

        <Typography sx={{ textAlign: 'center', color: '#710117' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" variant="body2" sx={{ color: '#710117' }}>
            Sign up
          </Link>
        </Typography>
      </Box>
    </Card>
  );
}
