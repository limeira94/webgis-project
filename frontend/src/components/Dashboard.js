import React, { useState } from 'react';
import NavbarComponent from './include/Navbar';
import { useSelector, useDispatch } from 'react-redux';
import { deleteUser, logout } from '../features/user';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Typography, Button, CircularProgress, Avatar, Box } from '@mui/material';

const formatDataSize = (sizeInBytes) => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1048576) { // 1024 * 1024
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  } else if (sizeInBytes < 1073741824) { // 1024 * 1024 * 1024
    return `${(sizeInBytes / 1048576).toFixed(2)} MB`;
  } else {
    return `${(sizeInBytes / 1073741824).toFixed(2)} GB`;
  }
};


function Dashboard() {
  const dispatch = useDispatch();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { user, loading } = useSelector(state => state.user);
  const { t } = useTranslation();

  const profile = user && user.profile;

  const handleDeleteUser = () => {
    if (confirmDelete) {
      
      dispatch(deleteUser(user.id))
        .unwrap()
        .then(() => {
          dispatch(logout());
        })
        .catch((error) => {
          alert(error.detail);
        });
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <>
      <NavbarComponent />
      {loading || user === null ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ padding: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            {t('profile')}
          </Typography>
          <Card sx={{ maxWidth: 500, margin: 'auto', padding: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  sx={{ width: 100, height: 100, mb: 2 }}
                  src={profile.profile_picture || '/default-profile.png'}
                />
                <Typography variant="h6">{user.username}</Typography>
                <Typography variant="subtitle1" color="textSecondary">{user.email}</Typography>
                <Typography variant="body1" color="textSecondary" mt={2}>
                  {t('data_size_raster')}: {formatDataSize(profile.total_raster_usage)}
                </Typography>
                <Typography variant="body1" color="textSecondary" mt={2}>
                  {t('data_size_vector')}: {formatDataSize(profile.total_vector_usage)}
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={2}>
                  {profile.bio || t('no_bio')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            {!confirmDelete ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setConfirmDelete(true)}
              >
                {t('delete_user')}
              </Button>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1">{t('he_is_sure')}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteUser}
                    sx={{ mr: 2 }}
                  >
                    {t('yes')}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => setConfirmDelete(false)}
                  >
                    {t('no')}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </>
  );
}

export default Dashboard;
