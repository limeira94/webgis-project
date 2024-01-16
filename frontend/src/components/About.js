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
                                <p>Full stack developer, with GIS expertise, GIS and Remote Sensing specialist, and Data Scientist. Access my social media:</p>
                                <li className="inline"><a href="https://www.instagram.com/felipematheuspinto/" target="_blank" rel="noreferrer"><img src={process.env.PUBLIC_URL + "/icons8-instagram-48.png"} width="25" height="25" alt="Instagram" /></a></li>
                                <li className="inline"><a href="https://twitter.com/__felipemp__/" target="_blank" rel="noreferrer"><img src={process.env.PUBLIC_URL + "/icons8-twitter-48.png"} width="25" height="25" alt="Twitter" /></a></li>
                                <li className="inline"><a href="https://www.linkedin.com/in/felipe-matheus-pinto-70042b113" target="_blank" rel="noreferrer"><img src={process.env.PUBLIC_URL + "/icons8-linkedin-48.png"} width="25" height="25" alt="LinkedIn" /></a></li>
                                <li className="inline"><a href="https://stackoverflow.com/users/14254779/felipe-matheus-pinto" target="_blank" rel="noreferrer"><img src={process.env.PUBLIC_URL + "/icons8-stack-overflow-48.png"} width="25" height="25" alt="Stack Overflow" /></a></li>
                                <li className="inline"><a href="https://github.com/felipempinto" target="_blank" rel="noreferrer"><img src={process.env.PUBLIC_URL + "/icons8-github-50.png"} width="25" height="25" alt="GitHub" /></a></li>
                                <li className="inline"><a href="mailto:felipempfreelancer@gmail.com?subject=Deep forest help" target="_blank" rel="noreferrer"><img src={process.env.PUBLIC_URL + "/icons8-email-64.png"} width="25" height="25" alt="Email" /></a></li>
                                <li className="inline"><a href="https://www.upwork.com/freelancers/~01dac11ce87134abd6" target="_blank" rel="noreferrer"><img src={process.env.PUBLIC_URL + "/icons8-upwork-50.png"} width="25" height="25" alt="Upwork" /></a></li>
                                <li className="inline"><a href="https://www.buymeacoffee.com/felipempinto" target="_blank"><img src={process.env.PUBLIC_URL + "/icons8-buy-me-a-coffee-help-creators-receive-support-from-their-audience-24.png"} width="25" height="25"/></a></li>
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
