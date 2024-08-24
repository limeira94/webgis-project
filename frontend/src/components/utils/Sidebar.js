import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Drawer, IconButton, List, ListItem, Button, ListItemIcon, ListItemText, Divide, Typography, Box, Divider } from '@mui/material';
import { ChevronLeft, ChevronRight, CloudUpload, Layers, Search, Home, Language } from '@mui/icons-material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import LayersIcon from '@mui/icons-material/Layers';
import DrawIcon from '@mui/icons-material/Draw';
import { styled } from '@mui/system';
import { handleRaster, handleGeojson, handleDrawUpload } from './eventHandler';
import DrawVector from './DrawVector';

const drawerWidth = 360;
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

export default function SideNav({ setRasters, mapInstance, projectid, setUploading, setVectors }) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('addData');
  const dispatch = useDispatch()

  const fileInputRef = useRef(null);
  const rasterInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileClickRaster = () => {
    rasterInputRef.current.click();
  };

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
          <ListItem
            key="draw"
            onClick={() => setActiveSection('draw')}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemIcon>
              <DrawIcon fontSize='large' />
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
            justifyContent: 'center',
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
          {activeSection === 'draw' && (
            <ListItem sx={{ width: '100%', display:'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ textAlign: 'center', width: '100%' }}>
                Draw Vector
              </Typography>
              
              <div id="draw-toolbar-container" style={{ marginTop: '10px' }}>
                {/* O toolbar será inserido aqui */}
              </div>
            </ListItem>
          )}
          <ListItem sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '80%', textAlign: 'center' }}>
              {activeSection === 'addData' && (
                <>
                  <input
                    type="file"
                    onChange={(event) => handleGeojson(
                      event,
                      setVectors,
                      mapInstance,
                      dispatch,
                      projectid,
                      setUploading
                    )}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".geojson, application/geo+json"
                  />
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
                    onClick={handleFileClick}
                  >
                    Upload GeoJson
                  </Button>
                  <input
                    type="file"
                    onChange={(event) => handleRaster(
                      event,
                      setRasters,
                      mapInstance,
                      dispatch,
                      projectid,
                      setUploading
                    )}
                    ref={rasterInputRef}
                    style={{ display: 'none' }}
                    accept=".tif"
                  />
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
                    onClick={handleFileClickRaster}
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

      <DrawVector
        mapInstance={mapInstance}
        setVectors={setVectors}
        projectid={projectid}
        setUploading={setUploading}
        active={activeSection === 'draw'}
      />
    </>
  );
}