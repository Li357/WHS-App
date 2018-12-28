import React from 'react';
import { RNCamera } from 'react-native-camera';
import EStyleSheet from 'react-native-extended-stylesheet';
import { CircleSnail } from 'react-native-progress';
import { Button, Text } from 'native-base';

const QRCamera = ({ onRead, onCancel }) => (
  <RNCamera
    type={RNCamera.Constants.Type.back}
    permissionDialogTitle="Camera"
    permissionDialogMessage="WHS needs to use your camera"
    onBarCodeRead={onRead}
    style={styles.preview}
  >
    {
      ({ status }) => (
        status !== 'READY'
          ? <CircleSnail indeterminate size={50} />
          : <Button bordered warning style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Button>
      )
    }
  </RNCamera>
);

export default QRCamera;

const styles = EStyleSheet.create({
  preview: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    alignSelf: 'flex-end',
    marginHorizontal: 20,
    marginVertical: 40,
  },
});
