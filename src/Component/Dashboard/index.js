import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, AsyncStorage, Modal, FlatList, Dimensions, Image } from 'react-native';
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
            isUploadLoader: false,
            currentUser: {},
            images: [],
        }
    }

    async componentWillMount() {
      

        AsyncStorage.getItem('currentUser').then((data) => {
            const user = JSON.parse(data,"")
            console.log(user)
            this.setState({
                currentUser: user,
            })

            database.child(`Images/${user.uid}/`).on("value", (snapshot) => {
                let arr = []
                console.log(snapshot)
                let obj = snapshot.val()
                for (let key in obj) {
                    arr.push({ ...obj[key], key })
                }
                this.setState({
                    images: arr
                })
            })
        }).catch((err) => {
            console.log(err)
        })
    }


    logoput(){
        firebase.auth().signOut().then(()=>{
            this.props.navigation.navigate("SignIn")
        }).catch(()=>{
            console.log("Fail")
        })
    }



    saveImage() {
        this.setState({
            modalVisible: false,
            isUploadLoader: true
        })
        const storageRef = firebase.storage().ref('/');
        var file = this.state.imageURL.uri;
        var uploadTask = storageRef.child(`Images/${this.state.currentUser.uid}/${new Date()}/`).put(file);
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
             (snapshot) => {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED:
                        break;
                    case firebase.storage.TaskState.RUNNING:
                        break;
                }
            },  (error) => {
                switch (error.code) {
                    case 'storage/unauthorized':
                        break;
                    case 'storage/canceled':
                        break;
                    case 'storage/unknown':
                        break;
                }
            }, (snapshot) => {
                const obj = {
                    uri: snapshot.downloadURL
                }
                console.log(obj,"00000000000000000000000000")
                database.child(`Images/${this.state.currentUser.uid}/`).push(obj)
                this.setState({
                    isUploadLoader: false,
                    imageURL:{}
                })
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
            (this.state.isUploadLoader) ?
                <View style={styles.loaderContainer} >
                    <ActivityIndicator size="large" color="#e91e8d" />
                </View>
                :
                <View style={styles.container}>
                    <View style={styles.FlatListContainer} >
                        <FlatList
                            numColumns={2}
                            style={{}} data={this.state.images}
                            renderItem={({ item }) => {
                                return (
                                    <View style={styles.imagesContainer} >
                                        <Image
                                            resizeMode="stretch"
                                            style={styles.images}
                                            source={{ uri: item.uri }} />
                                    </View>
                                )
                            }}
                            keyExtractor={(item) => item.key}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={() => this.props.navigation.navigate("SignIn")}
                        activeOpacity={.5} style={styles.logUotbtn} >
                        <Text style={{ fontSize: 17, color: "#fff", }} >{"<"}</Text>
                    </TouchableOpacity >
                    <TouchableOpacity onPress={this.selectPhotoTapped.bind(this)} activeOpacity={.5} style={styles.addBtn} >
                        <Text style={{ fontSize: 17, color: "#fff", }} >+</Text>
                    </TouchableOpacity >
                    <Modal
                        onRequestClose={() => { }}
                        animationType="fade"
                        transparent={true}
                        visible={this.state.modalVisible}>
                        <View style={styles.modalContainer} >
                            <View style={styles.modalContent} >
                                <Text
                                    style={styles.moTitle}>Image is ready to save !</Text>

                                <View style={styles.modalbtnsView} >
                                    <TouchableOpacity onPress={this.saveImage.bind(this)}  >
                                        <Text style={styles.modalbtnstext} >Save</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { this.setState({ modalVisible: false, imageURL: {} }) }} >
                                        <Text style={styles.modalbtnstext}>Cancele</Text>
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
    FlatListContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    loaderContainer: {
        backgroundColor: "#5a5a5a69",
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    imagesContainer: {
        borderColor: "#fff",
        borderWidth: 1
    },
    images: {
        height: height / 4
        , width: width / 2,
    },
    logUotbtn: {
        position: "absolute",
        height: 60, width: 60,
        backgroundColor: "#e91e8d",
        bottom: 20, left: 20,
        borderRadius: 1000,
        justifyContent: "center",
        alignItems: "center", elevation: 5
    },
    addBtn: {
        position: "absolute",
        height: 60, width: 60,
        backgroundColor: "#e91e8d",
        bottom: 20, right: 20,
        borderRadius: 1000,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5

    },
    modalContainer: {
        flex: 1,
        backgroundColor: "#10101036",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "90%",
        height: 150, backgroundColor: "#fff",
        elevation: 20, padding: 20,
        justifyContent: "space-between",
    },
    moTitle: {
        color: "#e91e8d",
        fontSize: 15, fontWeight: "500",
        textAlign: "center"
    },
    modalbtnsView: {
        flexDirection: "row",
        justifyContent: "space-around"
    },
    modalbtnstext: {
        color: "#e91e8d",
        fontSize: 13, fontWeight: "400"
    }

});
