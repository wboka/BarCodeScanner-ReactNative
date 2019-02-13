import React, { Component } from "react";
import { Animated, Button, Text, View, StyleSheet, Alert, WebView, Platform, NetInfo } from "react-native";
import { Constants, BarCodeScanner, Permissions } from "expo";

const URL = "https://example.com";

class FadeInView extends React.Component {
	state = {
		fadeOpacity: new Animated.Value(1)
	};

	componentDidMount() {
		Animated.loop(
			Animated.timing(this.state.fadeOpacity, {
				toValue: 0.25,
				duration: 1000
			})
		).start();
	}

	render() {
		let { fadeOpacity } = this.state;

		return (
			<Animated.View
				style={{
					...this.props.style,
					opacity: fadeOpacity
				}}
			>
				{this.props.children}
			</Animated.View>
		);
	}
}

export default class App extends React.Component {
  info = {
		version: Platform.Version,
		maintainText: `Built & maintained by YOUR_NAME_HERE\nFor support, REPLACE_WITH_YOUR_CONTACT_INFO`
  };

  state = {
		hasCameraPermission: null,
		isScanning: false,
		lineOpacity: new Animated.Value(1)
  };

  componentDidMount() {
		this._requestCameraPermission();
	}

	_requestCameraPermission = async () => {
		const { status } = await Permissions.askAsync(Permissions.CAMERA);
		this.setState({
			hasCameraPermission: status === "granted"
		});
	};

	_handleBarCodeRead = data => {
		// Stop scanning
		this.setState({
			isScanning: false
		});

		if (this.state.isScanning) {
      // Remove this once you have implemented the website JS
      Alert.alert(
				"Data Scanned",
				`${JSON.stringify(data, null, 2)}`
      );

			this.webView.postMessage(JSON.stringify(data));
		}
	};

	_handleShowScan = () => {
		this.setState({
			isScanning: !this.state.isScanning
		});

		if (this.state.isScanning) {
			Animated.loop(
				Animated.timing(this.state.lineOpacity, {
					toValue: 0.75,
					duration: 1000
				})
			).start();
		}
	};

	_showInfo = () => {
		NetInfo.getConnectionInfo().then(connectionInfo => {
			Alert.alert(
				"BARCODE_SCANNER",
				`OS Version ${this.info.version}\nNetwork: ${connectionInfo.type}\nCellular: ${connectionInfo.effectiveType}\n\n${
					this.info.maintainText
				}`
			);
		});
  };

  reload = () => {
		this.webView.reload();
	};

	render() {
		return (
			<View style={styles.container}>
				{this.state.hasCameraPermission === null ? (
					<Text>Requesting for camera permission</Text>
				) : this.state.hasCameraPermission === false ? (
					<Text>Camera permission is not granted</Text>
				) : (
					<View>
						<FadeInView style={{ zIndex: 10, position: `absolute`, height: `100%`, width: `100%` }}>
							<View style={styles.redlineHorizontal} />
							<View style={styles.redlineVertical} />
						</FadeInView>
						<BarCodeScanner
							onBarCodeRead={this._handleBarCodeRead}
							style={{ height: this.state.isScanning ? 200 : 0 }}
							captureAudio={false}
						/>
					</View>
				)}
				<WebView
					useWebKit={true}
					ref={v => (this.webView = v)}
					source={{ uri: URL }}
					javaScriptEnabled={true}
				/>
				<View
					style={{
						flexDirection: "row",
						justifyContent: "space-between"
					}}
				>
					<Button onPress={this._showInfo} title="Info" style={{ flex: 1 }} />
					<Button
						onPress={this._handleShowScan}
						title={this.state.isScanning ? "Cancel" : "Scan"}
						style={{ flex: 1 }}
					/>
					<Button onPress={this.reload} title="Refresh" style={{ flex: 1 }} />
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "column",
		alignItems: "stretch",
		justifyContent: "center",
		paddingTop: Constants.statusBarHeight,
		backgroundColor: "#ecf0f1"
	},
	redlineHorizontal: {
		position: "absolute",
		top: 100,
		height: 1,
		width: "100%",
		backgroundColor: "#d00000",
		zIndex: 10
	},
	redlineVertical: {
		position: "absolute",
		left: "50%",
		height: "100%",
		width: 1,
		backgroundColor: "#d00000",
		zIndex: 10
	}
});
