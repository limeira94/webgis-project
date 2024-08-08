import React, { useState, useEffect } from 'react';
import NavbarComponent from './include/Navbar';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { deleteUser, logout } from '../features/user';
import M from 'materialize-css';
import { useTranslation } from 'react-i18next';

function Dashboard() {
  const dispatch = useDispatch();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { user, loading } = useSelector(state => state.user);

  const { t } = useTranslation();

  useEffect(() => {
    M.AutoInit();
  }, []);

  const handleDeleteUser = () => {
    if (confirmDelete) {

      dispatch(deleteUser(user.id))
        .unwrap()
        .then(() => {
          M.toast({
            html: 'User deleted successfully',
            classes: 'green rounded',
            displayLength: 5000
          });
          dispatch(logout());
        })
        .catch((error) => {
          M.toast({
            html: error.detail,
            classes: 'red rounded',
            displayLength: 5000
          });
        });

    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <>
      <NavbarComponent />
      {loading || user === null ? (
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>{t('loading')}</span>
        </div>
      ) : (
        <div className='container'>
          <h1 className='mb-5 center'>{t('dashboard')}</h1>
          <div className='card'>
            <div className='card-body'>
              <h5 className='card-title center'>{t('user_detail')}</h5>
              <div className='row'>
                <div className='col-2'>{t('username')}</div>
                <div className='col'>{user.username}</div>
              </div>
              <div className='row'>
                <div className='col-2'>Email:</div>
                <div className='col'>{user.email}</div>
              </div>
            </div>
          </div>
          {!confirmDelete ? (
            <button className='btn btn-primary mt-3' onClick={() => setConfirmDelete(true)}>
              {t('delete_user')}
            </button>
          ) : (
            <>
              <p>{t('he_is_sure')}</p>
              <button className='btn btn-danger mt-3' onClick={handleDeleteUser}>
                {t('yes')}
              </button>
              <button className='btn btn-secondary mt-3' onClick={() => setConfirmDelete(false)}>
                {t('no')}
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Dashboard;
