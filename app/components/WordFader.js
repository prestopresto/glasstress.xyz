import React, { Component } from 'react'
import { StaggeredMotion, Motion, spring } from 'react-motion'

const phrase = "life without a glass palace would be a conviction"
const rows = 4
const springParams = {
  stiffness: 60,
  damping: 15
}

function wordsToStyles(words) {
  return words.map((word, i) => {
    return {
      opacity: 0,
      y: i * 300
    }
  })
}

function currentStyle(prevStyle, i) {
  return {
    y: prevStyle ? spring(prevStyle[i-1].y, springParams) : spring(0, springParams),
    opacity: prevStyle ? spring(prevStyle[i-1].opacity, springParams) : spring(1, springParams),
  }
}

export default class WordFader extends Component {

  render() {
    const words = phrase.split(' ')
    
    return (
      <StaggeredMotion
        defaultStyles={wordsToStyles(words)}
        styles={prevStyles => prevStyles.map((_, i) => {
          return i === 0 ? currentStyle() : currentStyle(prevStyles, i)
        })}>
        {interpolatingStyles =>
          <div>
            {interpolatingStyles.map((style, i) =>
              <span key={i} style={{
                fontSize: 24,
                display: 'inline-block',
                marginRight: '.5em',
                opacity: style.opacity,
                transform: `translate3d(0, ${style.y}px, 0)`
              }}>
                <span>{words[i]}</span>
              </span>)}
          </div>}
      </StaggeredMotion>)
  }
}