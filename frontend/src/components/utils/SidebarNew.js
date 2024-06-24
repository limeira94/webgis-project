import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DownloadIcon from '@mui/icons-material/Download';
import TableViewIcon from '@mui/icons-material/TableView';
import InfoIcon from '@mui/icons-material/Info';
import i18n from 'i18next';
import flagBR from './config/flag_br.png';
import flagUS from './config/flag_us.png';


function changeLanguage(language) {
    i18n.changeLanguage(language);
}

const SidebarButton = ({ IconComponent, onClick, ...props }) => (
    <IconButton onClick={onClick} {...props}>
        <IconComponent />
    </IconButton>
);

const SidebarNew = ({ toggleSidebar }) => {

    const navigate = useNavigate();

    const navigateToGraph = () => {
        navigate('/graph');
    }

    const navigateToExportData = () => {
        navigate('/export-data');
    }

    const navigateToAbout = () => {
        navigate('/about');
    }

    const openLink = (url) => () => window.open(url, "_blank");

    return (
        <Box sx={{ width: 60, zIndex: 1250, position: 'fixed', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10px', backgroundColor: 'white' }}>
            <IconButton onClick={toggleSidebar} sx={{ marginBottom: '10px' }}>
                <MapIcon />
            </IconButton>
            <IconButton onClick={navigateToGraph}>
                <AnalyticsIcon />
            </IconButton>
            <IconButton>
                <DownloadIcon onClick={navigateToExportData}/>
            </IconButton>
            <IconButton>
                <TableViewIcon />
            </IconButton>
            <IconButton>
                <InfoIcon onClick={navigateToAbout}/>
            </IconButton>
            <IconButton>
                <AnalyticsIcon />
            </IconButton>

            {/* <Box sx={{
                maginBottom: '10px',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <IconButton onClick={() => changeLanguage('pt-BR')}>
                    <img src={flagBR} alt="BR" width="30" height="20" />
                </IconButton>
                <IconButton onClick={() => changeLanguage('en')}>
                    <img src={flagUS} alt="US" width="30" height="20" />
                </IconButton>
            </Box> */}
            <Box sx={{
                marginTop: 'auto',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <SidebarButton IconComponent={HomeIcon} onClick={openLink("http://terrabrasilis.dpi.inpe.br/queimadas/portal/")} sx={{ marginBottom: '10px' }} />
                <SidebarButton IconComponent={BarChartIcon} onClick={openLink("http://terrabrasilis.dpi.inpe.br/queimadas/situacao-atual/situacao_atual/")} sx={{ marginBottom: '10px' }} />
                <SidebarButton IconComponent={ShowChartIcon} onClick={openLink("http://terrabrasilis.dpi.inpe.br/queimadas/situacao-atual/estatisticas/estatisticas_paises/")} sx={{ marginBottom: '10px' }} />
                <SidebarButton IconComponent={PieChartIcon} onClick={openLink("http://terrabrasilis.dpi.inpe.br/queimadas/situacao-atual/estatisticas/estatisticas_estados/")} sx={{ marginBottom: '10px' }} />
            </Box>

        </Box>
    );
};

export default SidebarNew;
