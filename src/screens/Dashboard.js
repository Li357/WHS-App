import React, { Component } from 'react';
import { View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Container, Thumbnail } from 'native-base';
import { connect } from 'react-redux';

const mapStateToProps = ({ name, classOf, homeroom, counselor, dean, id }) => ({
  name, classOf, homeroom, counselor, dean, id,
});

@connect(mapStateToProps)
export default class Dashboard extends Component {
  render() {
    return (
      <Container>
        <View>
          
        </View>
      </Container>
    );
  }
}

const styles = EStyleSheet.create({

});
