import React, { useState } from 'react';
import { Drawer, IconButton, List, ListItem, Button, ListItemIcon, ListItemText, Divide, Typography, Box, Divider } from '@mui/material';
import { ChevronLeft, ChevronRight, CloudUpload, Layers, Search, Home, Language } from '@mui/icons-material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import LayersIcon from '@mui/icons-material/Layers';
import { styled } from '@mui/system';

const drawerWidth = 330;
const miniSidebarWidth = 60;
const headerHeight = 64;

const url = process.env.PUBLIC_URL;

const Sidebar = styled(Drawer)(({ open }) => ({
  width: open ? drawerWidth : 0,
  flexShrink: 0,
  position: 'absolute',  // Alterado para 'absolute'
  left: miniSidebarWidth,  // Posicionado ao lado do MiniSidebar
  top: 0,  // Garantir que ele esteja alinhado ao topo
  height: '100vh',  // Garantir que ocupe toda a altura da janela
  '& .MuiDrawer-paper': {
    width: open ? drawerWidth - miniSidebarWidth : 0,
    transition: 'width 0.3s ease-in-out',
    overflowX: 'hidden',
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100vh',
  },
}));

const MiniSidebar = styled(Box)({
  width: miniSidebarWidth,
  backgroundColor: '#dcdcdc',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  position: 'fixed',
  left: 0,
  height: '100vh',
  zIndex: 1300,
});

const ToggleButton = styled(IconButton)(({ open }) => ({
  position: 'fixed',
  top: 15,
  left: open ? drawerWidth + 10 : miniSidebarWidth + 10,
  transform: open ? 'translateX(-50%)' : 'translateX(-50%)',
  transition: 'left 0.3s ease-in-out',
  zIndex: 1400,
  color: '#000',
  backgroundColor: '#ababab', // Define uma cor de fundo para melhor contraste, se desejado
  '&:hover': {
    backgroundColor: '#e0e0e0', // Cor de fundo ao passar o mouse
  },
}));

export default function SideNav() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('addData');

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <MiniSidebar>
        <List sx={{ marginTop: 10 }}>
          <ListItem key="addData" onClick={() => setActiveSection('addData')} sx={{ cursor: 'pointer' }}>
            <ListItemIcon>
              <PlaylistAddIcon fontSize='large' />
            </ListItemIcon>
          </ListItem>
          <ListItem key="layers" onClick={() => setActiveSection('layers')} sx={{ cursor: 'pointer' }} >
            <ListItemIcon>
              <Layers fontSize='large' />
            </ListItemIcon>
          </ListItem>
          <ListItem
            key="search"
            onClick={() => setActiveSection('search')}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemIcon>
              <Search fontSize='large' />
            </ListItemIcon>
          </ListItem>
        </List>
        <List>
          <ListItem key="home">
            <ListItemIcon>
              <Home fontSize='large' />
            </ListItemIcon>
          </ListItem>
          <ListItem key="language">
            <ListItemIcon>
              <Language fontSize='large' />
            </ListItemIcon>
          </ListItem>
        </List>
      </MiniSidebar>

      <Sidebar variant="permanent" open={open}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'left',
            height: headerHeight,
            backgroundColor: '#dcdcdc',
            transition: 'padding-left 0.3s ease-in-out',
          }}
        >
          <img src={url + "/logo-world.svg"} alt="Logo" style={{ width: 40, height: 40, marginRight: open ? 8 : 0 }} />
          {open && (
            <Typography variant="h6" noWrap>
              WebGIS Project
            </Typography>
          )}
        </Box>
        <Divider />
        <List sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {activeSection === 'addData' && (
            <ListItem sx={{ width: '100%' }}>
              <Typography variant="h6" sx={{ textAlign: 'center', width: '100%' }}>
                Add Data
              </Typography>
            </ListItem>
          )}
          {activeSection === 'layers' && (
            <ListItem sx={{ width: '100%' }}>
              <Typography variant="h6" sx={{ textAlign: 'center', width: '100%' }}>
                Layers
              </Typography>
            </ListItem>
          )}
          {activeSection === 'search' && (
            <ListItem sx={{ width: '100%' }}>
              <Typography variant="h6" sx={{ textAlign: 'center', width: '100%' }}>
                Search
              </Typography>
            </ListItem>
          )}
          <ListItem sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '80%', textAlign: 'center' }}>
            {activeSection === 'addData' && (
                <>
              <Button
                variant="contained"
                sx={{
                  width: '100%',
                  marginBottom: '10px',
                  backgroundColor: '#555',
                  border: '1px solid #000',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#666',
                  }
                }}
                startIcon={<FileUploadIcon />}
              >
                Upload GeoJson
              </Button>
              <Button
                variant="contained"
                sx={{
                  width: '100%',
                  backgroundColor: '#ddd',
                  border: '1px solid #999',
                  color: '#000',
                  '&:hover': {
                    backgroundColor: '#ccc',
                  }
                }}
                startIcon={<FileUploadIcon />}
              >
                Upload Geotiff
              </Button>
              </>
            )}
            </Box>
          </ListItem>
        </List>

        <ToggleButton onClick={handleDrawerToggle} open={open}>
          {open ? <ChevronLeft /> : <ChevronRight />}
        </ToggleButton>
      </Sidebar>
    </>
  );
}