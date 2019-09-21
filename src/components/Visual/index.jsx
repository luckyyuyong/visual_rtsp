import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';

export default class Display extends Component {
  constructor() {
    super();
    this.state = {
      url: 'http://192.168.1.240:3001',
      ob_ret: '',
    };
  }

  componentDidMount() {
    const { url } = this.state;
    const socket = socketIOClient(url);
    socket.on('object_detection', (data) => {
      console.log("data", data.toString());
      this.setState({
        ob_ret: data.toString(),
      });
    });
  }

  render() {
    const { ob_ret } = this.state;
    let component;
    if (ob_ret) {
      component = <p>{ob_ret}</p>;
    } else{
      component = <p> </p>;
    } 
    return (
      <div style={{ textAlign: 'center' }} >
        <h3>
          inference result
        </h3>
        {component}
      </div>
    );
  }
}

