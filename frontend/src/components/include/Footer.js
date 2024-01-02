import React from 'react';
import "./Footer.css"

const Footer = () => {
return (
<footer id="footer" className="page-footer footer-color">
  <div className="container">
    <div className="row">
      <div className="col l6 s12">
        <h5 className="white-text">Info</h5>
        <p className="white-text text-lighten-4">This is the project WebGIS</p>
        <a className="white-text text-lighten-4 left" href="/about">About</a>
      </div>
      <div className="col l4 offset-l2 s12">
        <h5 className="white-text">Doubts? Contact me:</h5>
        <ul>
              {/* <li className="inline"><a className="footer-text" href="https://www.instagram.com/felipematheuspinto/" target="_blank" rel="noreferrer"><img src={process.env.PUBLIC_URL + "/icons8-instagram-48.png"} width="25" height="25" alt="Instagram" /></a></li>
              <li className="inline"><a className="footer-text" href="https://twitter.com/__felipemp__/" target="_blank" rel="noreferrer"><img src={process.env.PUBLIC_URL + "/icons8-twitter-48.png"} width="25" height="25" alt="Twitter" /></a></li>
              <li className="inline"><a className="footer-text" href="https://www.linkedin.com/in/felipe-matheus-pinto-70042b113" target="_blank" rel="noreferrer"><img src={process.env.PUBLIC_URL + "/icons8-linkedin-48.png"} width="25" height="25" alt="LinkedIn" /></a></li>
              <li className="inline"><a className="footer-text" href="https://stackoverflow.com/users/14254779/felipe-matheus-pinto" target="_blank" rel="noreferrer"><img src={process.env.PUBLIC_URL + "/icons8-stack-overflow-48.png"} width="25" height="25" alt="Stack Overflow" /></a></li>
              <li className="inline"><a className="footer-text" href="https://github.com/felipempinto" target="_blank" rel="noreferrer"><img src={process.env.PUBLIC_URL + "/icons8-github-50.png"} width="25" height="25" alt="GitHub" /></a></li>
              <li className="email inline"><a className="footer-text" href="mailto:felipempfreelancer@gmail.com?subject=Deep forest help" target="_blank" rel="noreferrer"><img src={process.env.PUBLIC_URL + "/icons8-email-64.png"} width="25" height="25" alt="Email" /></a></li>
              <li className="inline"><a className="footer-text" href="https://www.upwork.com/freelancers/~01dac11ce87134abd6" target="_blank" rel="noreferrer"><img src={process.env.PUBLIC_URL + "/icons8-upwork-50.png"} width="25" height="25" alt="Upwork" /></a></li> */}
        </ul>
      </div>
    </div>
  </div>
  <div className="container footer-text">
    <p>© 2023 WebGis Project</p>
  </div>
</footer>
);
};

export default Footer;