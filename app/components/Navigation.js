import React, { Component } from "react"
import { StaggeredMotion, Motion, spring } from 'react-motion'
import Transition from 'react-motion-ui-pack'
import IcosahedronButton from './IcosahedronButton'
import TypeWriter from '../components/TypeWriter'

const items = [
  {
    title: "The Project",
    navTitle: "The Project",
    subtitle: "00>About",
    href: "project",
    id: 0,
  },
  {
    title: "Tracklist",
    navTitle: "Tracklist",
    subtitle: "01>Listen",
    href: "tracklist",
    id: 2,
    aside: (
      <div className="gt-tracklist__artwork">
        <img src="/assets/imgs/glasstress-front.jpg" width={500} height={500} />
      </div>)
  },
]

require('./Navigation.css')

export default class Navigation extends Component {

  constructor(props) {
    super(props)

    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
    this.toggle = this.toggle.bind(this)
    this.navigate = this.navigate.bind(this)
    this.mouseOverButton = this.mouseOverButton.bind(this)
    this.mouseOutButton = this.mouseOutButton.bind(this)

    this.state = {
      show: false,
      mouseOver: false
    }
  }

  mouseOverButton(e) {
    this.setState({
      mouseOver: true
    })
  }

  mouseOutButton() {
    this.setState({
      mouseOver: false
    })
  }

  render() {
    
    let { show, mouseOver } = this.state
    const springParams = {stiffness: 280, damping: 20}
    const springParamsAlt = {stiffness: 200, damping: 30}

    //show=true
    return (
      <div>
        <div style={{textAlign:'center',cursor:'pointer'}} onClick={this.toggle}>
          {/*<IcosahedronButton 
            onMouseOver={this.mouseOverButton}
            onMouseOut={this.mouseOutButton} 
             />*/}
          <span className="gt-text--subhead">
            <TypeWriter word={show ? "close" : "menu"} />
          </span>
        </div>

        <Motion 
          defaultStyle={{
            y: 100,
            opacity: 0
          }} 
          style={{
            y: show ? spring(0, springParamsAlt) : spring(100, springParamsAlt),
            opacity: show ? spring(1) : spring(0),
          }}>
          {values => 
            <div 
              {...this.props}
              className="gt-navigation__content"
              style={{
                //transform: `translate3d(0, ${values.y}%, 0)`,
                //background: 'rgba(0,0,0,.45)',
                opacity: values.opacity,
                pointerEvents: show ? 'inherit' : 'none'
              }}>

                <StaggeredMotion
                  defaultStyles={[
                    {y: -30, opacity: 0}, 
                    {y: -40, opacity: 0}, 
                    ]}
                  styles={prevInterpolatedStyles => prevInterpolatedStyles.map((_, i) => {
                    return i === 0
                      ? {y: spring(40, springParams), opacity: spring(1, springParams)}
                      : {
                          opacity: spring(prevInterpolatedStyles[i - 1].opacity, springParams),
                          y: spring(prevInterpolatedStyles[i - 1].y, springParams)
                        }
                  })}>
                  {interpolatingStyles =>
                    <div style={{height:200,marginTop:'auto'}}>
                      {interpolatingStyles.map((style, i) =>
                        <div key={i} 
                          className="gt-navigation__item"
                          style={{
                            paddingTop: 8,
                            paddingBottom: 8,
                            fontSize: '1.5em', 
                            fontWeight: 100,
                            opacity: style.opacity,
                            textTransform: 'lowercase',
                            transform: `translate3d(0, ${style.y}px, 0)`
                          }}>
                          <a 
                            onClick={this.navigate.bind(this, items[i])}
                            href={"#" + items[i].href}
                            style={{color:'#fff',fontWeight:100,textDecoration:'none'}}>{items[i].title}</a>
                        </div>)
                      }
                    </div>
                  }
                </StaggeredMotion>
                <Transition
                runOnMount={true}
                component={false}
                enter={{
                  opacity: 1,
                  translateY: 0
                }}
                leave={{
                  opacity: 0,
                  translateY: 20
                }}>
                {show && <div key="info" className="gt-navigation__info">
                  <span className="gt-text">
                    preview, stream or download album <a target="_blank" href="http://glasstress.lnk.to/CasacciMana">here</a><br/>
                  </span>
                  <span className="gt-text--small gt-text--secondary">available for spotify, itunes, apple music, deezer, google play, amazon mp3</span>
                </div>}
                </Transition>
                <div className="gt-navigation__credits">
                  <span className="gt-text">
                    <a target="_blank" href="http://badpandarecords.bandcamp.com/">
                      <img src="/assets/imgs/badpanda-logo.jpg" width={32} style={{verticalAlign:'middle',borderRadius:'50%',marginBottom:'1em'}}/>
                    </a>
                    <br/>
                    Courtesy of <a target="_blank" href="http://badpandarecords.bandcamp.com/">Bad Panda Records</a>
                  </span>
                </div>
              </div>
          }
        </Motion>
      </div>
    )
  }

  navigate(href, e) {
    e.preventDefault()
    this.hide()
    this.props.onNavigate(href)
  }

  toggle() {
    this.state.show ? this.hide() : this.show()
  }

  show(e) {
    this.setState({
      show: true
    })
    this.props.onToggle(true)
  }

  hide() {
    this.setState({
      show: false
    }) 
    this.props.onToggle(false)
  }

}