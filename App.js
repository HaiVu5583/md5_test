import React, {useRef} from 'react';
import {
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import md5 from 'md5';
import RNFS from 'react-native-fs';

const App = () => {
  const cameraRef = useRef(null);

  const _getFileName = filename => {
    const splitFileName = filename.split('/');
    if (!splitFileName || splitFileName.length === 0) {
      return filename;
    }
    return splitFileName[splitFileName.length - 1];
  };

  const _takePicture = async () => {
    const options = {quality: 1, base64: true};
    const image = await cameraRef.current.takePictureAsync(options);
    const localMd5 = await RNFS.hash(image.uri, 'md5');
    console.log('Local MD5: ', localMd5);
    console.log(image);
    const formData = new FormData();
    formData.append('file', {
      uri: image.uri,
      name: _getFileName(image.uri),
      type: 'image/jpg',
    });
    try {
      let md5FromApi = await fetch(
        'https://rancher.congty.fun/api/catalog/test/md5',
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        },
      ).then(response => response.json());
      console.log('MD5 API: ', md5FromApi?.data?.payload);
    } catch (err) {
      console.log('Upload file err: ', err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <RNCamera
          ref={cameraRef}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.off}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          androidRecordAudioPermissionOptions={{
            title: 'Permission to use audio recording',
            message: 'We need your permission to use your audio',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
        />
        <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableOpacity onPress={_takePicture} style={styles.capture}>
            <Text style={{fontSize: 14}}> SNAP </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: 'red',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});

export default App;
