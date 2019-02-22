import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import firebase from "react-native-firebase"


const database = firebase.database().ref()
export default class SignIn extends Component {
    static navigationOptions = {
        title: 'Sign In',
        headerStyle: { backgroundColor: '#e91e8d' },
        headerTitleStyle: { color: '#fff', fontSize: 14 },
        headerTintColor: '#ffffff',
    }
    constructor() {
        super()
        this.state = {
            email: "",
            password: "",
            isLoader: false
        }
    }

    SignIn() {
        const { email, password } = this.state
        if (password !== "" && email !== "") {
            this.setState({
                isLoader: true
            })
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((res) => {
                    database.child(`Users/${res.user._user.uid}/`).once("value", (snapshoot) => {
                        let currentUser = snapshoot.val()
                        currentUser.uid = snapshoot.key;
                        setTimeout(() => {
                            this.setState({
                                isLoader: false
                            })
                            this.props.navigation.navigate("Dashboard")
                        }, 2000)
                    })
                })
                .catch((error) => {
                    var errorMessage = error.message;
                    alert(errorMessage)
                    this.setState({
                        isLoader: false
                    })
                })
        }
        else {
            alert("All Feilds are required !")
        }
    }


    render() {
        const { email, password } = this.state
        return (
            <View style={styles.container}>
                <View style={[styles.TextInputView, styles.marginTop]} >
                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={(email) => this.setState({ email })}
                        style={[styles.TextInput, {}]} />
                </View>
                <View style={[styles.TextInputView, styles.marginTop]} >
                    <TextInput
                        secureTextEntry={true}
                        placeholder="Password"
                        value={password}
                        onChangeText={(password) => this.setState({ password })}
                        style={[styles.TextInput, {}]} />
                </View>
                <View style={styles.buttonView} >
                    {(this.state.isLoader) ?
                        <ActivityIndicator size="large" color="#e91e8d" />
                        :
                        <TouchableOpacity onPress={this.SignIn.bind(this)} activeOpacity={.5} style={styles.button} >
                            <Text style={styles.buttonText} >SIGN IN</Text>
                        </TouchableOpacity>}
                </View>
                <TouchableOpacity
                    onPress={() => this.props.navigation.navigate("SignUp")}
                    style={{ marginTop: 10 }} >
                    <Text style={{ color: "#e91e8d", fontSize: 12 }} >Don't have an accunt !</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    TextInputView: {
        height: 50,
        width: "95%"
    },
    TextInput: {
        flex: 1,
        fontSize: 13,
        borderColor: "#e91e8d",
        borderWidth: 1,
        borderRadius: 3,
        padding: 5

    },
    buttonView: {
        height: 50,
        width: "95%", marginTop: 20,
        justifyContent: "center",
        alignItems: "center"
    },
    button: {
        height: 50,
        width: "50%",
        backgroundColor: "#e91e8d",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 3
    },
    buttonText: {
        color: "#fff"
    },
    marginTop: {
        marginTop: 20
    }
});
