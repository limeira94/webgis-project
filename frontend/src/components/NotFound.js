// src/components/NotFound.js
import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <Box
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
        >
            <Typography variant="h3" gutterBottom>
                404 - Page Not Found
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
                The page you are looking for does not exist.
            </Typography>
            <Button variant="contained" component={Link} to="/">
                Go Back Home
            </Button>
        </Box>
    );
};

export default NotFound;
