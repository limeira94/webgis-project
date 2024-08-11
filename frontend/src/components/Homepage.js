import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Card, CardContent, CardMedia, Typography, Button, IconButton } from '@mui/material';
import Navbar from './include/Navbar';
import Footer from './include/Footer';
import { getProjects } from './utils/ProjectFunctions';
import iconFull from '../assets/icone-acesso-completo.svg';
import iconSimple from '../assets/icone-acesso-simplificado.svg';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';

const Homepage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        getProjects(setProjects);
    }, []);

    const handleAddProject = (projectId) => {
        navigate(`/project/${projectId}`);
    };
    var url = process.env.PUBLIC_URL
    const topText = t('homepage_text');
    const listItens = [
        { "type": "simple", "text": t('add_vector') },
        { "type": "simple", "text": t("edit_layer_style") },
        { "type": "simple", "text": t("access_basemap") },
        { "type": "simple", "text": t("area_measure") },
        { "type": "simple", "text": t("print_map") },
        { "type": "complex", "text": t("add_raster") },
        { "type": "complex", "text": t("draw_layers") },
        { "type": "complex", "text": t("create_project") },
    ];
    const simplifiedText = () => {
        return (
            <>
                {listItens.map((item, n) => (
                    <p key={n} style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={`${url}/${item["type"] === "simple" ? "inclusa" : "nao-inclusa"}.svg`} alt="icon" style={{ marginRight: '10px' }} /> {item["text"]}
                    </p>
                ))}
            </>
        );
    };

    const fullText = () => {
        return (
            <>
                {listItens.map((item, n) => (
                    <p key={n} style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={`${url}/inclusa.svg`} alt="icon" style={{ marginRight: '10px' }} /> {item["text"]}
                    </p>
                ))}
            </>
        );
    };

    return (
        <>
            <Navbar />
            <div style={{ backgroundColor: '#eceaea', minHeight: '100vh', paddingBottom: '20px', paddingTop: '50px' }}>
                <Container>
                    <Typography variant="h4" align="center" sx={{ paddingBottom: '20px' }}>{t('welcome')}</Typography>
                    <Typography align="center" style={{ whiteSpace: 'pre-line', marginBottom: '20px' }}>{topText}</Typography>
                    <Typography variant="h5" align="center" style={{ whiteSpace: 'pre-line', marginBottom: '20px' }}>{t('access_type')}</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                        <img src={iconSimple} alt="custom icon" style={{ marginRight: '10px' }} />
                                        <Typography variant="h5">{t('simplified')}</Typography>
                                    </div>
                                    <div className='container'>
                                        <span className="black-text">
                                            {simplifiedText()}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <Button
                                            href="/map"
                                            variant="contained"
                                            style={{
                                                marginTop: '20px',
                                                backgroundColor: '#EA1D25',
                                                color: 'white',
                                                borderRadius: '20px',
                                                width: '150px'
                                            }}
                                        >
                                            {t('take_tour')}
                                        </Button>
                                    </div>
                                    <Typography align="center" variant="body2" color="textSecondary" style={{ marginTop: '10px' }}>
                                        {t('note_1')}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                        <img src={iconFull} alt="custom icon" style={{ marginRight: '10px' }} />
                                        <Typography variant="h5">{t('full')}</Typography>
                                    </div>
                                    <div className='container'>
                                        <span className="black-text">
                                            {fullText()}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <Button
                                            href="/register"
                                            variant="contained"
                                            style={{
                                                marginTop: '20px',
                                                backgroundColor: '#EA1D25',
                                                color: 'white',
                                                borderRadius: '20px',
                                                width: '150px'
                                            }}
                                        >
                                            {t('register')}
                                        </Button>
                                    </div>
                                    <Typography align="center" variant="body2" color="textSecondary" style={{ marginTop: '10px' }}>
                                        {t('note_2')}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <div className="custom-shape-divider-top-1701366195 card-section" style={{ marginTop: '40px' }}>
                        <Container>
                            <Grid container spacing={3}>
                                {projects.map((project, index) => (
                                    <Grid item xs={12} sm={6} md={3} key={index}>
                                        <Card>
                                            <div style={{ position: 'relative' }}>
                                                <CardMedia
                                                    component="img"
                                                    height="140"
                                                    image={project.thumbnail || `${process.env.PUBLIC_URL}/thumbnail_map.png`}
                                                    alt={`Project ${index + 1}`}
                                                />
                                                <IconButton
                                                    color="primary"
                                                    aria-label="add to project"
                                                    onClick={() => handleAddProject(project.id)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '10px',
                                                        top: '10px',
                                                        backgroundColor: '#EA1D25',
                                                        color: 'white'
                                                    }}
                                                >
                                                    <AddIcon />
                                                </IconButton>
                                            </div>
                                            <CardContent>
                                                <Typography variant="h6">{project.name}</Typography>
                                                <Typography variant="body2" color="textSecondary">{project.updated_at}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Container>
                    </div>


                    <Container className='tech-section-container' style={{ marginTop: '40px' }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="h5" align="center">Backend</Typography>
                                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <img src={`${process.env.PUBLIC_URL}/python-icon.svg`} alt='Python' style={{ margin: '10px' }} />
                                    <img src={`${process.env.PUBLIC_URL}/flask-icon.svg`} alt='Flask' style={{ margin: '10px' }} />
                                    <img src={`${process.env.PUBLIC_URL}/django-icon.svg`} alt='Django' style={{ margin: '10px' }} />
                                    <img src={`${process.env.PUBLIC_URL}/fastapi-icon.svg`} alt='FastAPI' style={{ margin: '10px' }} />
                                </div>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="h5" align="center">Frontend</Typography>
                                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <img src={`${process.env.PUBLIC_URL}/devicon_javascript.svg`} alt='JavaScript' style={{ margin: '10px' }} />
                                    <img src={`${process.env.PUBLIC_URL}/logos_react.svg`} alt='React' style={{ margin: '10px' }} />
                                    {/* <img src={`${process.env.PUBLIC_URL}/logos_openlayers.svg`} alt='OpenLayers' style={{ margin: '10px' }} /> */}
                                    <img src={`${process.env.PUBLIC_URL}/logos_leaflet.svg`} alt='Leaflet' style={{ margin: '10px' }} />
                                </div>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="h5" align="center">Deploy</Typography>
                                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <img src={`${process.env.PUBLIC_URL}/logos_heroku.svg`} alt='Heroku' style={{ margin: '10px' }} />
                                    <img src={`${process.env.PUBLIC_URL}/logos_aws.svg`} alt='AWS' style={{ margin: '10px' }} />
                                    <img src={`${process.env.PUBLIC_URL}/simple-icons_pythonanywhere.svg`} alt='Pythonanywhere' style={{ margin: '10px' }} />
                                </div>
                            </Grid>
                        </Grid>
                    </Container>
                </Container>
            </div>
            <Footer />
        </>
    );
};

export default Homepage;
