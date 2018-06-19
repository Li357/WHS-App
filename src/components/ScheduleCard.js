import React from 'react';
import { StyleSheet } from 'react-native';
import { Container, Card } from 'native-base';

import ScheduleItem from './ScheduleItem';

const ScheduleCard = ({ content }) => (
  <Container style={styles.card}>
    <Card>
      {content.map(({ sourceId, ...item }) => <ScheduleItem key={sourceId} item={item} />)}
    </Card>
  </Container>
);
export default ScheduleCard;

const styles = StyleSheet.create({
  card: { flex: 1 },
});
