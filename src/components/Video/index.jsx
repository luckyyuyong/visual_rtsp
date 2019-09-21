import React, { Component } from 'react';

export default class RtspVideo extends Component {
  constructor() {
    super();
  }

  render() {
	return (
      <iframe id="iFrame"
            style={{width:'100%', height:576, overflow:'visible'}}
            ref="iframe" 
            src="/rtsp.html" 
            frameBorder="0"
      />
    );
  }
}

