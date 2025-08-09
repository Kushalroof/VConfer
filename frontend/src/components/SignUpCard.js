import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
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

export default function SignUpCard() {
  const { handleRegister } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    name: '',
    username: '',
    password: '',
  });

  const [errors, setErrors] = React.useState({
    name: '',
    username: '',
    password: '',
  });

  const [serverError, setServerError] = React.useState('');

  const validateInputs = () => {
    let valid = true;
    let newErrors = { name: '', username: '', password: '' };

    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long.';
      valid = false;
    }

    if (!formData.username.trim() || formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long.';
      valid = false;
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    try {
      await handleRegister(formData.name, formData.username, formData.password);
      console.log(formData.name, formData.username);
      navigate('/auth');
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed";
      setServerError(msg);
      setTimeout(() => {
        setServerError('');
      }, 4000);
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
        Sign up
      </Typography>

      {serverError && (
        <Typography sx={{ color: 'red', fontSize: '0.9rem', textAlign: 'center' }}>
          {serverError}
        </Typography>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <FormControl>
          <FormLabel htmlFor="name" sx={{ color: '#710117' }}>
            Name
          </FormLabel>
          <TextField
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            fullWidth
            variant="outlined"
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="username" sx={{ color: '#710117' }}>
            Username
          </FormLabel>
          <TextField
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            error={Boolean(errors.username)}
            helperText={errors.username}
            required
            fullWidth
            variant="outlined"
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="password" sx={{ color: '#710117' }}>
            Password
          </FormLabel>
          <TextField
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••"
            error={Boolean(errors.password)}
            helperText={errors.password}
            required
            fullWidth
            variant="outlined"
          />
        </FormControl>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ backgroundColor: '#710117' }}
        >
          Sign up
        </Button>

        <Typography sx={{ textAlign: 'center', color: '#710117' }}>
          Already have an account?{' '}
          <Link href="/auth" variant="body2" sx={{ color: '#710117' }}>
            Sign in
          </Link>
        </Typography>
      </Box>
    </Card>
  );
}
