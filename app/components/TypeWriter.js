import React, { Component } from "react";
import Type from './Type'

require('./TypeWriter.css')

export default class TypeWriter extends Component {
  constructor(props) {
    super(props)
  }

  // methods
  render() {
    const { word, totalTime } = this.props
    const chars = word.split('')

    return (
      <span className="gt-typewriter" ref={(ref) => {
        this.ref = ref
      }}>
        {
          chars.map((char, i) =>
            <Type 
              minDelay={(i*1)*1} 
              maxDelay={(i*1)*50} 
              iterations={12}
              char={char} 
              key={i+char} />
          )
        }
      </span>)
  }
}