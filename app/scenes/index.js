import React, { Component } from 'react'
import { Motion, spring, TransitionMotion } from 'react-motion'
import Transition from 'react-motion-ui-pack'

import TypeWriter from '../components/TypeWriter'
import ThreeScene from '../components/ThreeScene'
import * as visualization from './viz-alt.js'
import { playSfx } from '../lib/sfx'
import MotionButton from "../components/MotionButton";
import Navigation from '../components/Navigation'
import Paper from '../components/Paper'

import WordFader from '../components/WordFader'

import THREE from 'three'
import TWEEN from 'tween'

require('es6-promise').polyfill();
require('whatwg-fetch');

require('./styles/home.css')

export default class Scene extends Component {

  constructor(props) {
    super(props)
    this.state = {
      mouseover: false,
      author: false,
      launched: false,
      pageIdx: -1,
      showNavigation: false,
      audioLoaded: false,
      showLauncher: true,
      currentSection: null,
      canLaunch: false,
      volumeLevel: 90,
    }

    this.mouseOver = this.mouseOver.bind(this)
    this.mouseOut = this.mouseOut.bind(this)
    this.changeVolume = this.changeVolume.bind(this)

    // load track audio data
    fetch('/app/data/track-data2.json')
      .then((res) => {
        return res.json()
      }, (err) => {
        console.log('cannot load audio data', err)
      })
      .then((json) => {
        console.log('json')
        this.setState({
          canLaunch: true
        })
        visualization.setupAudioData(json)
        visualization.init()
        visualization.animate()
      }) 
  }

  componentDidMount() {
    this.audioEl = document.getElementById('track')

    function isLoaded() {
      return this.audioEl.readyState == 4
    }

    function checkIsLoaded() {
      setTimeout(function() {
        if(isLoaded()) {
          return this.setState({
            audioLoaded: true
          })
        }
      }, 250)
    }    
    this.typewrite()
  }

  componentDidUpdate(prevProps, prevState) {

    if(this.state.launched && !prevState.launched) {
      setTimeout(() => {
        visualization.playScene()
      }, 2000)
      
    }
  }


  typewrite() {
    playSfx('sfx08', 0.2)
    setTimeout(() => {
      this.setState({
        author: !this.state.author
      })
      this.typewrite()
    }, 5000)
  }

  mouseOver() {
    playSfx('sfx05')
    this.setState({
      mouseover: true
    })
  }

  mouseOut() {
    this.setState({
      mouseover: false
    }) 
  }

  launch() {
    this.setState({
      launched: true
    })
  }

  closePaper() {
    this.setState({
      pageIdx: -1,
      showLauncher: true
    })
  }

  render() {

    const { showLauncher, launched, pageIdx, showNavigation } = this.state
    const springParamsA = {stiffness: 10, damping: 4, precision: 0.10}
    const springParams = {stiffness: 40, damping: 15, precision: 0.10}
    const springParamsAlt = {stiffness: 40, damping: 15, precision: 0.10}

    let headerMotionStyle = {
      scale: spring(1), 
      opacity: spring(1),
      y: spring(0),
      x: spring(0)
    }

    let buttonMotionStyle = {
      scale: spring(1), 
      opacity: spring(1),
      y: spring(0),
      x: spring(0)
    }

    if(launched) {
      headerMotionStyle.scale = spring(1.25, springParams)
      headerMotionStyle.opacity =spring(0, springParams)
      headerMotionStyle.y = spring(280, springParams)

      buttonMotionStyle.scale = spring(1, springParams)
      buttonMotionStyle.y = spring(200, springParams)
      buttonMotionStyle.opacity =  spring(0, springParams)
    }

    if(showNavigation && !launched) {
      headerMotionStyle.scale = spring(.9, springParamsA)
      headerMotionStyle.opacity = spring(.5, springParamsA)
      headerMotionStyle.y = spring(0, springParamsA)
      buttonMotionStyle = headerMotionStyle
    }

    return <div>

      <div className="gt-screen">

        {/* VISUALIZATION PLACEHOLDER */}
        <div id="visualization" className="gt-viz" />

        {/* NAVIGATION */}
        <div className="gt-screen__icosahedron">
          <Navigation 
            onToggle={this.toggleNavigation.bind(this)}
            onNavigate={this.navigate.bind(this)} />
        </div>

        {/* NOW PLAYING */}
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
          {this.state.launched && <div key="nowplaying" className="gt-screen__nowplaying">
            <span className="gt-gt--nowplaying">
              &gt;
            </span>
            <span className="gt-screen__nowplaying-label gt-text--subhead">
              now playing
            </span>
            <h1 className="gt-screen__nowplaying-title">
              Like a Glass Angel
            </h1>
          </div>}
        </Transition>

        {/* VIZ TOOLBAR */}
        <div className="gt-screen__toolbar">
          <div className="gt-screen__mute" onClick={this.changeVolume}>
            <img src="/assets/imgs/sound-icon.svg" width={32} style={{transition:'all .25s ease-out',opacity:this.state.volumeLevel/100+0.1}} />
            <br/>
            <span className="gt-screen__mute-label">
              <TypeWriter word="volume" />
            </span>
            
          </div>
        </div>
        
        {/* HERO */}
        <Transition
          runOnMount={true}
          component={false}
          appear={{
            scale: 1,
            opacity: 0,
            translateY: -60
          }}
          enter={{
            opacity: spring(1, {stiffness:5, damping:10}),
            translateY: spring(0),
            scale: spring(1, {stiffness:20, damping:10})
          }}
          leave={{
            opacity: spring(0, {stiffness:20, damping:10}),
            translateY: spring(400),
            scale: spring(0, {stiffness:20, damping:10})
          }}>
        {!this.state.launched && pageIdx<0 && <div key="title" className="gt-screen__title">
            <h1 className="gt-title">
              <TypeWriter word="glass" />
            </h1>
            <h1 className="gt-title">
              <TypeWriter word="tress" />
            </h1>
            <h2 className="gt-subtitle">
              {this.state.author==0 && <TypeWriter word="max>casacci" />}
              {this.state.author==1 && <TypeWriter word="daniele>mana" />}
            </h2>
            {/* LOADER */}
            {this.state.canLaunch && 
            <MotionButton 
              onMouseOver={this.mouseOver}
              onMouseOut={this.mouseOut}
              onClick={this.launch.bind(this)}
              className="gt-button gt-button--launch"
              label="play*" />}
          </div>}
        </Transition>
      </div>
      
      {/* CONTENT DRAWER */}
      <Transition
        runOnMount={true}
        component={false} // don't use a wrapping component
        enter={{
          opacity: 1,
          translateY: spring(0)
        }}
        leave={{
          opacity: 0,
          translateY: 600
        }}>
        {this.state.pageIdx > -1 &&
          <Paper 
            key="paper"
            section={this.state.currentSection}
            onClose={this.closePaper.bind(this)} 
            show={this.state.pageIdx>-1} />}
      </Transition>
    </div>
  }

  toggleNavigation(shown) {
    console.log('toggle', shown)
    this.setState({
      showNavigation: shown
    })
  }

  navigate(item) {
    const pageIdx = item.id
    this.setState({ pageIdx: -1 })

    setTimeout(() => {
      this.setState({ showLauncher: false })    
    }, 250)

    setTimeout(() => {
      this.setState({ pageIdx, currentSection: item })
    }, 750)
    
  }

  changeVolume() {
    const volumeLevel = this.state.volumeLevel
    let nextVolume = 0;

    if(volumeLevel == 0) {
      nextVolume = 25
    }

    if(volumeLevel == 25) {
      nextVolume = 90
    }

    this.setState({
      volumeLevel: nextVolume
    })

    visualization.setVolumeLevel(nextVolume)


  }
}