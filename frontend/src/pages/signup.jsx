import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import SignUpCard from '../components/SignUpCard';
import { Link } from 'react-router-dom';

export default function SignUpSide() {
  return (
    <>
      <CssBaseline enableColorScheme />
      <Stack
        direction="column"
        component="main"
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          minHeight: '100%',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            zIndex: -1,
            inset: 0,
            backgroundImage: 'url("/Background.jpeg")',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 2,
          }}
        >
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginLeft:18, marginTop:14 }}>
            <img
              src="/icon.png"
              alt="VConfer Logo"
              style={{ width: 60, height: 60, borderRadius: 12 }}
            />
            <h2
              style={{
                fontWeight: 700,
                fontSize: 38,
                marginLeft: '1.5vh',
                color: '#710117',
                textShadow: '1px 2px 2px rgba(0, 0, 0, 0.1)',
              }}
            >
              VConfer
            </h2>
          </Link>
        </Stack>

        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          sx={{ p: 2, zIndex: 1 }}
        >
          <SignUpCard />
        </Stack>
      </Stack>
    </>
  );
}
