import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'materialize-css';
import Navbar from './include/Navbar';
import Footer from './include/Footer';
import M from 'materialize-css';
import { getProjects } from './utils/ProjectFunctions';
import '../styles/Homepage.css';
import iconFull from '../assets/icone-acesso-completo.svg';
import iconSimple from '../assets/icone-acesso-simplificado.svg';
import { useTranslation } from 'react-i18next';


const Homepage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);

    const { t } = useTranslation()

    useEffect(() => {
        getProjects(setProjects);
    }, []);

    useEffect(() => {
        var options = {}
        var elems = document.querySelectorAll('.sidenav');
        M.Sidenav.init(elems, options);
    }, [])

    var url = process.env.PUBLIC_URL

    const handleAddProject = (projectId) => {
        navigate(`/project/${projectId}`);
    };

    const topText = t('homepage_text')
    const listItens = [
        { "type": "simple", "text": t('add_vector') },
        { "type": "simple", "text": t("edit_layer_style") },
        { "type": "simple", "text": t("access_basemap") },
        { "type": "simple", "text": t("area_measure") },
        { "type": "simple", "text": t("print_map") },
        { "type": "complex", "text": t("add_raster")},
        { "type": "complex", "text": t("draw_layers") },
        { "type": "complex", "text": t("create_project") },
    ]

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
    const textStyle = {
        whiteSpace: 'pre-line'
    }
    console.log(projects)
    return (
        <>
            <Navbar />
            <div className='homepage-style'>
                <div className='section container'>
                    <div>
                        <h4 className='center'>{t('welcome')}</h4>
                        <p className='center' style={textStyle}>{topText}</p>
                    </div>
                    <div className="row">
                        <div className="col s12 m6">
                            <div className="card-panel white card-style">
                                <div className="header-container center" >
                                    <img src={iconSimple} alt="custom icon" style={{ marginRight: '10px' }} />
                                    <h5>{t('simplified')}</h5>
                                </div>
                                <div className='container'>
                                    <span className="black-text">
                                        {simplifiedText()}
                                    </span>
                                </div>
                                <p className='center'><a href="/map" className='btn btn-small red center rounded-button'>{t('take_tour')}</a></p>
                                <p className='note-style center'>{t('note_1')}</p>
                            </div>
                        </div>
                        <div className="col s12 m6">
                            <div className="card-panel white card-style">
                                <div className="header-container center">
                                    <img src={iconFull} alt="custom icon" style={{ marginRight: '10px' }} />
                                    <h5>{t('full')}</h5>
                                </div>
                                <div className='container'>
                                    <span className="black-text">
                                        {fullText()}
                                    </span>
                                </div>
                                <p className='center'><a href="/register" className='btn btn-small red rounded-button'>{t('register')}</a></p>
                                <p className='note-style center'>{t('note_2')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="custom-shape-divider-top-1701366195 card-section">
                    <div className='container section'>
                        <div className="row">
                            {/* <h4 className='center'>My projects</h4> */}
                            {projects.map((project, index) => (
                                <div key={index} className="col s12 m3">
                                    <div className="card">
                                        <div className="card-image">
                                            {project.thumbnail ? (
                                                <img src={`${project.thumbnail}`} alt={`Project ${index + 1}`} />
                                            ) : (
                                                <img src={url + "/thumbnail_map.png"} alt={`Project ${index + 1}`} />
                                            )}
                                            <span className="card-title">{project.name}</span>
                                            <a onClick={() => handleAddProject(project.id)} className="btn-floating halfway-fab waves-effect waves-light red"><i className="material-icons">add</i></a>
                                        </div>
                                        <div className="card-content">
                                            <p>{project.updated_at}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='section container' >
                    <div className='tech-section-container'>
                        <div className='tech-stack'>
                            <div className='tech-section'>
                                <h5 className='center'>Backend</h5>
                                <div className='tech-icons'>
                                    <img src={`${url}/python-icon.svg`} alt='Python' />
                                    <img src={`${url}/flask-icon.svg`} alt='Flask' />
                                    <img src={`${url}/django-icon.svg`} alt='Django' />
                                    <img src={`${url}/fastapi-icon.svg`} alt='FastAPI' />
                                </div>
                            </div>
                            <div className='tech-section'>
                                <h5 className='center'>Frontend</h5>
                                <div className='tech-icons'>
                                    <img src={`${url}/devicon_javascript.svg`} alt='JavaScript' />
                                    <img src={`${url}/logos_react.svg`} alt='React' />
                                    <img src={`${url}/logos_openlayers.svg`} alt='OpenLayers' />
                                    <img src={`${url}/logos_leaflet.svg`} alt='Leaflet' />
                                </div>
                            </div>
                            <div className='tech-section'>
                                <h5 className='center'>Deploy</h5>
                                <div className='tech-icons'>
                                    <img src={`${url}/logos_heroku.svg`} alt='Heroku' />
                                    <img src={`${url}/logos_aws.svg`} alt='AWS' />
                                    <img src={`${url}/simple-icons_pythonanywhere.svg`} alt='Pythonanywhere' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <Footer />
        </>
    );
};

export default Homepage;
