import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TouchableOpacity, Alert, Modal, FlatList, Dimensions, Image } from 'react-native';
const ImagePicker = require('react-native-image-picker');
import firebase from "react-native-firebase"


const { width, height } = Dimensions.get("window")
const database = firebase.database().ref("/")
export default class Dashboard extends Component {
    static navigationOptions = {
        title: 'Home',
        headerStyle: { backgroundColor: '#e91e8d' },
        headerTitleStyle: { color: '#fff', fontSize: 14 },
        headerTintColor: '#e91e8d',

    }
    constructor() {
        super()
        this.state = {
            imageURL: {},
            modalVisible: false,
            currentUser: {},
            images: [],
        }
    }

    componentWillMount() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                database.child(`Images/${user.uid}/`).on("value", (snapshot) => {
                    let arr = []
                    let obj = snapshot.val()
                    for (let key in obj) {
                        arr.push({ ...obj[key], key })
                    }
                    // console.log(arr)
                    this.setState({
                        currentUser: user,
                        images: arr
                    })
                })
            }

        })
    }





    saveImage() {
        const storageRef = firebase.storage().ref('/');
        var file = this.state.imageURL.uri;
        var metadata = {
            contentType: 'image/jpeg'
        };

        var uploadTask = storageRef.child('images/' + Date.now()).put(file);
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            function (snapshot) {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED:
                        break;
                    case firebase.storage.TaskState.RUNNING:
                        break;
                }
            }, function (error) {
                switch (error.code) {
                    case 'storage/unauthorized':
                        break;
                    case 'storage/canceled':
                        break;
                    case 'storage/unknown':
                        break;
                }
            }, (snapshot) => {
                this.setState({
                    modalVisible: false
                })

                const obj = {
                    uri: snapshot.downloadURL
                }
                database.child(`Images/${this.state.currentUser.uid}/`).push(obj)
            });
    }


    selectPhotoTapped() {
        const options = {
            quality: 1.0,
            maxWidth: 500,
            maxHeight: 500,
            storageOptions: {
                skipBackup: true
            }
        };



        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled photo picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                let source = { uri: response.uri };
                console.log(source)
                this.setState({
                    imageURL: source,
                    modalVisible: true
                });
                // database.child()

            }
        });
    }

    render() {
        console.log(this.state.images)
        return (
            <View style={styles.container}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", }} >
                    <FlatList
                        numColumns={2}
                        style={{}} data={this.state.images}
                        renderItem={({ item }) => {
                            return (
                                <View style={{ borderColor: "#fff", borderWidth: 1 }} >
                                    <Image
                                        resizeMode="stretch"

                                        style={{ height: height / 4, width: width / 2, }}
                                        source={{ uri: item.uri }} />
                                </View>
                            )
                        }}
                        keyExtractor={(item) => item.key}
                    />
                </View>
                <TouchableOpacity 
                onPress={()=>this.props.navigation.navigate("SignIn")}
                activeOpacity={.5} style={{
                    position: "absolute",
                    height: 60, width: 60, backgroundColor: "#e91e8d", bottom: 20, left: 20, borderRadius: 1000, justifyContent: "center", alignItems: "center", elevation: 5
                }} >
                    <Text style={{ fontSize: 17, color: "#fff", }} >{"<"}</Text>
                </TouchableOpacity >


                <TouchableOpacity onPress={this.selectPhotoTapped.bind(this)} activeOpacity={.5} style={{
                    position: "absolute",
                    height: 60, width: 60, backgroundColor: "#e91e8d", bottom: 20, right: 20, borderRadius: 1000, justifyContent: "center", alignItems: "center", elevation: 5
                }} >
                    <Text style={{ fontSize: 17, color: "#fff", }} >+</Text>
                </TouchableOpacity >
                <Modal
                    onRequestClose={() => { }}
                    animationType="fade"
                    transparent={true}
                    visible={this.state.modalVisible}>
                    <View style={{ flex: 1, backgroundColor: "#10101036", justifyContent: "center", alignItems: "center", }} >
                        <View style={{ width: "90%", height: 150, backgroundColor: "#fff", elevation: 20, padding: 20, justifyContent: "space-between", }} >
                            <Text
                                style={{ color: "#e91e8d", fontSize: 15, fontWeight: "500", textAlign: "center" }}>Image is ready to save !</Text>

                            <View style={{ flexDirection: "row", justifyContent: "space-around" }} >
                                <TouchableOpacity onPress={this.saveImage.bind(this)}  >
                                    <Text style={{ color: "#e91e8d", fontSize: 13, fontWeight: "400" }} >Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { this.setState({ modalVisible: false, imageURL: {} }) }} >
                                    <Text style={{ color: "#e91e8d", fontSize: 13, fontWeight: "400" }}>Cancele</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },

});
