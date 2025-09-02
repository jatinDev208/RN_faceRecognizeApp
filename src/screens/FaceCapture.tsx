import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Platform,
    PermissionsAndroid,
    ActivityIndicator,
    Modal,
    TextInput,
} from "react-native";
import { launchCamera } from "react-native-image-picker";
import LinearGradient from "react-native-linear-gradient";
import { baseUrl } from "../utils/constant";

export default function FaceCapture() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const [photo, setPhoto] = useState<any>(null);
    const [registerLoader, setRegisterLoader] = useState(false);
    const [recognizeLoader, setRecognizeLoader] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [name, setName] = useState("");

    const isLoading = registerLoader || recognizeLoader;

    async function requestCameraPermission() {
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "Camera Permission",
                    message: "We need access to your camera to take photos",
                    buttonPositive: "OK",
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    }

    const handleRegister = () => {
        setShowPrompt(true);
    };


    const takePicture = async () => {
        const permissionGranted = await requestCameraPermission();
        if (!permissionGranted) return;

        launchCamera(
            { mediaType: "photo", includeBase64: true, saveToPhotos: false },
            async (response: any) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    console.error("Camera Error: ", response.errorMessage);
                    return;
                }

                const base64data = response.assets[0].base64;
                setPhoto(`data:image/jpeg;base64,${base64data}`);

                try {
                    setRegisterLoader(true);
                    const res = await fetch(`${baseUrl}/check-face`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ image: base64data }),
                    });
                    const data = await res.json();

                    if (data.registered) {
                        Alert.alert("Face Registration", "Face Already Registered! Please use Recognize.");
                    } else {
                        // Instead of registering directly, go to Products
                        navigation.navigate("Products", { name: name || "demo", faceImg: base64data });
                    }
                    setRegisterLoader(false);
                } catch (error) {
                    setRegisterLoader(false);
                    console.error(error);
                }
            }
        );
    };


    const registerAPI = async (img: any) => {
        try {
            setRegisterLoader(true)
            const res = await fetch(`${baseUrl}/register-face`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: img, userId: name || 'demo' }),
            });
            const data = await res.json();
            Alert.alert(
                "Face Registration",
                data.message || "Registered successfully!"
            );
            setRegisterLoader(false)
        } catch (error) {
            setRegisterLoader(false)
            console.error(error);
        }
    }

    const recognizeFace = async () => {
        const permissionGranted = await requestCameraPermission();
        if (!permissionGranted) return;

        launchCamera(
            { mediaType: "photo", includeBase64: true, saveToPhotos: false },
            async (response: any) => {
                if (response.didCancel) return;

                const base64data = response.assets[0].base64;
                setPhoto(`data:image/jpeg;base64,${base64data}`);

                try {
                    setRecognizeLoader(true);
                    const res = await fetch(`${baseUrl}/recognize-face`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ image: base64data }),
                    });
                    const data = await res.json();


                    console.log('data ::::::::: ',data)

                    setRecognizeLoader(false);

                    if (data.success) {
                        const userName = data.name || "demo";

                        const stored = await AsyncStorage.getItem(`order_${userName}`);
console.log('stored ::::::::: ',stored)

                        if (stored) {
                            // order exists → go to Orders
                            navigation.navigate("Orders", { order: JSON.parse(stored), name:userName });
                        } else {
                            // no order → go to Products, and pass face data
                            navigation.navigate("Products", { name:userName, faceImg: base64data });
                        }
                    } else {
                        Alert.alert("Error", "Face not recognized!");
                    }
                } catch (error) {
                    setRecognizeLoader(false);
                    console.error(error);
                }
            }
        );
    };


    const handleConfirm = async () => {
        // setRegisterLoader(true);
        await takePicture();
        setName('');
        setShowPrompt(false)
        // setTimeout(() => setRegisterLoader(false), 2000); // simulate loading
    };

    return (
        <LinearGradient
            colors={["#0f2027", "#203a43", "#2c5364"]}
            style={styles.container}
        >
            <Text style={styles.title}>Face Recognition</Text>
            <Text style={styles.subtitle}>
                Register your face or recognize it securely
            </Text>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    disabled={isLoading ? true : false}
                    onPress={handleRegister} style={styles.button}>
                    <LinearGradient
                        colors={["#36D1DC", "#5B86E5"]}
                        style={styles.gradientButton}
                    >
                        {registerLoader ?
                            <ActivityIndicator color={'#ffffff'} size={'small'} />
                            :
                            <>
                                <Text style={styles.icon}>👤</Text>
                                <Text style={styles.buttonText}>Register</Text>
                            </>
                        }
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={isLoading ? true : false}
                    onPress={recognizeFace} style={styles.button}>
                    <LinearGradient
                        colors={["#FF512F", "#DD2476"]}
                        style={styles.gradientButton}
                    >
                        {recognizeLoader ?
                            <ActivityIndicator color={'#ffffff'} size={'small'} />
                            :
                            <>
                                <Text style={styles.icon}>🔍</Text>
                                <Text style={styles.buttonText}>Recognize</Text>
                            </>
                        }
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* {photo && (
        <View style={styles.previewCard}>
          <Image source={{ uri: photo }} style={styles.image} />
          <Text style={styles.previewText}>Captured Face</Text>
        </View>
      )} */}


            {/* Custom Prompt */}
            <Modal visible={showPrompt} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalBox}>
                        <Text style={styles.promptTitle}>Enter Your Name</Text>
                        <TextInput
                            placeholder="Name"
                            placeholderTextColor={'grey'}
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                        />
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => setShowPrompt(false)}>
                                <Text style={styles.cancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleConfirm}>
                                <Text style={styles.ok}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 28,
        color: "#fff",
        fontWeight: "700",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#dcdcdc",
        textAlign: "center",
        marginBottom: 30,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
    },
    gradientButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    icon: {
        fontSize: 20,
        marginRight: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    previewCard: {
        marginTop: 40,
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 15,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 10,
        elevation: 6,
    },
    image: {
        width: 220,
        height: 220,
        borderRadius: 15,
        marginBottom: 10,
    },
    previewText: {
        fontSize: 14,
        color: "#333",
    },

    modalContainer: {
        flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalBox: {
        backgroundColor: "white", padding: 20, borderRadius: 12, width: "80%",
    },
    promptTitle: { fontSize: 18, marginBottom: 10 },
    input: {
        borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 15,
    },
    actions: { flexDirection: "row", justifyContent: "flex-end" },
    cancel: { marginRight: 20, color: "red" },
    ok: { color: "blue", fontWeight: "bold" },
});
