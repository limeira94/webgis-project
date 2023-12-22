import React from 'react';
import Navbar from './include/Navbar';
import Footer from './include/Footer';
import './About.css';


var url = process.env.PUBLIC_URL

const About = () => {
    return (
        <>
            <Navbar />
            <div className='container'>
                <h1 className="center-title">Developers</h1>
                
                <div className="row center-align">
                    <div className="col s12 m6">
                        <div className="card card-flat">
                            <div className="card-image">
                                <img src={url + "/felipe_pinto.jpg"} alt="Felipe Matheus Pinto"/>
                            </div>
                            <div className="card-content">
                                <span className="card-title">Felipe Matheus Pinto</span>
                                <p>Desenvolvedor GIS com experiência em Automações de processos, manipulação de Banco de dados e Desenvolvimento Web.</p>
                            </div>
                        </div>
                    </div>

                    <div className="col s12 m6">
                        <div className="card card-flat">
                            <div className="card-image">
                                <img src={url + "/felipe_limeira.png"} alt="Felipe Limeira"/>
                            </div>
                            <div className="card-content">
                                <span className="card-title">Felipe Limeira</span>
                                <p>Desenvolvedor GIS com experiência em Automações de processos, manipulação de Banco de dados e Desenvolvimento Web.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <Footer />
        </>
    );
};

export default About;
