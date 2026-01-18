export function Footer() {
  return (
    <footer id="footer" className="footer">
      <div className="footer-widget">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-sm-6 col-md-4 footer--widget-about">
              <div className="footer--widget-content">
                <img className="mb-20" src="/hairy/assets/images/logo/logo-light.png" alt="logo" />
                <p>
                  Proin gravida nibh vel velit auctor aliquet anean lorem quis. bindum auctor, nisi elite
                  conset ipsums sagtis id duis sed odio sit.
                </p>
                <div className="work--schedule clearfix">
                  <ul className="list-unstyled">
                    <li>
                      Monday - Friday <span>9.00 : 17.00</span>
                    </li>
                    <li>
                      Saturday <span>9.00 : 15.00</span>
                    </li>
                    <li>
                      Sunday <span>9.00 : 13.00</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-xs-12 col-sm-6 col-md-4 footer--widget-recent">
              <div className="footer--widget-title">
                <h5>Latest Posts</h5>
              </div>
              <div className="footer--widget-content">
                <div className="entry">
                  <div className="entry--img">
                    <a href="#">
                      <img src="/hairy/assets/images/blog/thumb/5.jpg" alt="entry" />
                    </a>
                  </div>
                  <div className="entry--content">
                    <div className="entry--title">
                      <a href="#">Essential barbering tips you need to know before you start</a>
                    </div>
                    <div className="entry--meta">
                      <span>Nov 09, 2017</span>
                    </div>
                  </div>
                </div>
                <div className="entry">
                  <div className="entry--img">
                    <a href="#">
                      <img src="/hairy/assets/images/blog/thumb/4.jpg" alt="entry" />
                    </a>
                  </div>
                  <div className="entry--content">
                    <div className="entry--title">
                      <a href="#">What are the 360 waves? and how you can get them</a>
                    </div>
                    <div className="entry--meta">
                      <span>Oct 30, 2017</span>
                    </div>
                  </div>
                </div>
                <div className="entry">
                  <div className="entry--img">
                    <a href="#">
                      <img src="/hairy/assets/images/blog/thumb/3.jpg" alt="entry" />
                    </a>
                  </div>
                  <div className="entry--content">
                    <div className="entry--title">
                      <a href="#">Discover what is the best haircut for your face shape?</a>
                    </div>
                    <div className="entry--meta">
                      <span>Oct 19, 2017</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xs-12 col-sm-6 col-md-4 footer--widget-contact">
              <div className="footer--widget-title">
                <h5>Get In Touch</h5>
              </div>
              <div className="footer--widget-content">
                <ul className="list-unstyled mb-0">
                  <li>
                    <i className="fa fa-map-marker" /> 1220 Petersham town, Wardll St New South Wales Australia
                    PA 6550.
                  </li>
                  <li>
                    <i className="fa fa-phone" /> (04) 491 570 110
                  </li>
                  <li>
                    <i className="fa fa-envelope-o" /> contact@zytheme.com
                  </li>
                </ul>
                <form className="form--newsletter">
                  <input type="email" name="email" className="form-control" placeholder="Email address" />
                  <button type="submit">Subscribe</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer--copyright">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-6">
              <span>&copy; 2017, All rights reserved.</span>
            </div>
            <div className="col-xs-12 col-sm-12 col-md-6 text-right">
              <div className="social">
                <a className="share-twitter" href="#">
                  <i className="fa fa-twitter" />
                </a>
                <a className="share-facebook" href="#">
                  <i className="fa fa-facebook" />
                </a>
                <a className="share-linkedin" href="#">
                  <i className="fa fa-linkedin" />
                </a>
                <a className="share-pinterest" href="#">
                  <i className="fa fa-instagram" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
