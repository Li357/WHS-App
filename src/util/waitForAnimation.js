import React, { Component } from 'react';
import { InteractionManager } from 'react-native';

const waitForAnimation = Child => class WaitForAnimation extends Component {
  state = { animated: false }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({ animated: true });
    });
  }

  render() {
    return this.state.animated
      ? <Child />
      : null;
  }
};
export default waitForAnimation;
