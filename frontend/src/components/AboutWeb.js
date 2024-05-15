import React from 'react';
import Navbar from './include/Navbar';
import Footer from './include/Footer';
import '../styles/About.css';


var url = process.env.PUBLIC_URL

const AboutWeb = () => {
    return (
        <>
            <Navbar />
            <div className='container'>
                <h1 className="center-title"></h1>

                <div className="row center-align">
                    <div className="col s12 m6">
                        <div className="card card-flat">
                            <div className="card-image">
                                <img src={url + "/plm3.jpg"} alt="Felipe Matheus Pinto" className="about-image"/>
                            </div>
                        </div>
                    </div>

                    <div className="col s12 m6">

                        <div className="card card-flat">
                            <div className="card-content">
                                <h1 className="flow-text">Sobre o WEBSIG</h1>
                                <p className="flow-text custom-paragraph">Versão 0.5.0</p>
                                <p className="flow-text custom-paragraph">PLM3 Tecnologia e Inovação Ltda</p>
                                <p className="flow-text custom-paragraph">www.plm3.com.br</p>
                                <p className="flow-text custom-paragraph">Fone: (+55) 16.99610.3755</p>
                                <p className="flow-text custom-paragraph">Email: suporte@plm3.com.br</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default AboutWeb;
