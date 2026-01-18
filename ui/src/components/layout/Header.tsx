export function Header() {
  return (
    <header id="navbar-spy" className="header header-topbar header-transparent header-fixed">
      <div id="top-bar" className="top-bar">
        <div className="container">
          <div className="bottom-bar-border">
            <div className="row">
              <div className="col-xs-12 col-sm-6 col-md-6 top--contact hidden-xs">
                <ul className="list-inline mb-0">
                  <li>
                    <i className="lnr lnr-clock" />
                    <span>Mon - Fri 9.00 : 17.00</span>
                  </li>
                  <li>
                    <i className="lnr lnr-phone-handset" /> <span>(04) 491 570 110</span>
                  </li>
                </ul>
              </div>
              <div className="col-xs-12 col-sm-6 col-md-6 top--info text-right text-center-xs">
                <span className="top--login">
                  <i className="lnr lnr-exit" /> <a href="#">Login</a> / <a href="#">Register</a>
                </span>
                <span className="top--social">
                  <a className="facebook" href="#">
                    <i className="fa fa-facebook" />
                  </a>
                  <a className="twitter" href="#">
                    <i className="fa fa-twitter" />
                  </a>
                  <a className="gplus" href="#">
                    <i className="fa fa-google-plus" />
                  </a>
                  <a className="instagram" href="#">
                    <i className="fa fa-instagram" />
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <nav id="primary-menu" className="navbar navbar-fixed-top">
        <div className="container">
          <div className="">
            <div className="navbar-header">
              <button
                type="button"
                className="navbar-toggle collapsed"
                data-toggle="collapse"
                data-target="#navbar-collapse-1"
                aria-expanded="false"
              >
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar" />
                <span className="icon-bar" />
                <span className="icon-bar" />
              </button>
              <a className="logo" href="#">
                <img
                  className="logo-light"
                  src="/hairy/assets/images/logo/logo-light.png"
                  alt="Hairy Logo"
                />
                <img
                  className="logo-dark"
                  src="/hairy/assets/images/logo/logo-dark.png"
                  alt="Hairy Logo"
                />
              </a>
            </div>
            <div className="collapse navbar-collapse pull-right" id="navbar-collapse-1">
              <ul className="nav navbar-nav nav-pos-right nav-bordered-right">
                <li className="active">
                  <a href="#" className="menu-item">
                    home
                  </a>
                </li>
                <li>
                  <a href="#" className="menu-item">
                    about
                  </a>
                </li>
                <li>
                  <a href="#" className="menu-item">
                    services
                  </a>
                </li>
                <li>
                  <a href="#" className="menu-item">
                    contact
                  </a>
                </li>
              </ul>
              <div className="module module-cart pull-left">
                <div className="module-icon">
                  <a className="btn btn--white btn--bordered btn--rounded" href="#">
                    Book Online
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
