import React, { Component } from "react";
import { View, StyleSheet, AsyncStorage, ActivityIndicator } from "react-native";
import firebase from "react-native-firebase";


const database = firebase.database().ref("/")
export default class Splash extends Component {

    componentWillMount() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                database.child(`Users/${user.uid}/`).once("value", (snapshoot) => {
                    let currentUser = snapshoot.val()
                    currentUser.uid = snapshoot.key;
                    // AsyncStorage.setItem("currentUser", JSON.stringify(currentUser), () => {
                        setTimeout(() => {
                            this.props.navigation.navigate("Dashboard")
                        }, 1000)
                    // })
                })
            }
            else {
                setTimeout(() => {
                    this.props.navigation.navigate("SignIn")
                }, 1000)
            }
        })

        
    }
    render() {
        return (
            <View style={styles.constianer} >
                <ActivityIndicator size="large" color="#fff" />
            </View>
        )
    }
}


const styles = StyleSheet.create({
    constianer: {
        flex: 1,
        backgroundColor: "#e91e8d",
        justifyContent: "center",
        alignItems: "center",
    }
})