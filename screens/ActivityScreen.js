import {
  ScrollView,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import "core-js/stable/atob"; // <- polyfill here
import axios from "axios";
import { UserType } from "../UserContext";
import User from "../components/User";

const ActivityScreen = () => {
  const [selectedButton, setSelectedButton] = useState("people");
  const [content, setContent] = useState("People Content");
  const { userId, setUserId } = useContext(UserType);
  const [users, setUsers] = useState([]);
  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");

        if (token) {
          const decodedToken = jwtDecode(token);

          const userId = decodedToken.userId;
          // console.log(userId);
          setUserId(userId);

          axios
            .get(`http://localhost:3000/user/${userId}`)
            .then((response) => {
              // console.log(response);
              setUsers(response.data);
            })
            .catch((error) => {
              console.log("Error fetching user data:", error);
            });
        } else {
          console.log("Token not found in AsyncStorage");
        }
      } catch (error) {
        console.log("Error fetching token:", error);
      }
    };

    fetchUsers();
  }, []);
  // console.log("users", users);
  return (
    <ScrollView style={{ marginTop: 50 }}>
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Activity</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginTop: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => handleButtonClick("people")}
            style={[
              {
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: "white",
                borderColor: "#D0D0D0",
                borderRadius: 6,
                borderWidth: 0.7,
              },
              selectedButton === "people" ? { backgroundColor: "black" } : null,
            ]}
          >
            <Text
              style={[
                {
                  textAlign: "center",
                  fontWeight: "bold",
                },
                selectedButton == "people"
                  ? { color: "white" }
                  : { color: "black" },
              ]}
            >
              People
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleButtonClick("all")}
            style={[
              {
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: "white",
                borderColor: "#D0D0D0",
                borderRadius: 6,
                borderWidth: 0.7,
              },
              selectedButton === "all" ? { backgroundColor: "black" } : null,
            ]}
          >
            <Text
              style={[
                {
                  textAlign: "center",
                  fontWeight: "bold",
                },
                selectedButton == "all"
                  ? { color: "white" }
                  : { color: "black" },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleButtonClick("request")}
            style={[
              {
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: "white",
                borderColor: "#D0D0D0",
                borderRadius: 6,
                borderWidth: 0.7,
              },
              selectedButton === "request"
                ? { backgroundColor: "black" }
                : null,
            ]}
          >
            <Text
              style={[
                {
                  textAlign: "center",
                  fontWeight: "bold",
                },
                selectedButton == "request"
                  ? { color: "white" }
                  : { color: "black" },
              ]}
            >
              Requests
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          {selectedButton === "people" && (
            <View style={{ marginTop: 20 }}>
              {users.map((item, index) => (
                <User key={index} item={item} />
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ActivityScreen;

const styles = StyleSheet.create({});
