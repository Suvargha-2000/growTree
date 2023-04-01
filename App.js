import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Dimensions,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";
import moment from "moment/moment";
import { Colors } from "react-native/Libraries/NewAppScreen";

const retrieveUrl = "http://192.168.1.193:5000/retrieveData";

export default function App() {
  const [retrievedData, setRetrievedData] = useState([]);
  const [motorData, setMotorData] = useState([]);
  const [loading, setLoading] = useState(true);

  const humidityAPI = () => {
    setLoading(true);
    fetch(retrieveUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateStart: "2023-03-25",
        dateEnd: "2023-03-28",
        id: "all",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setRetrievedData(data);
        // console.log(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    humidityAPI();
  }, []);

  const chartConfig = {
    // backgroundColor: "#e26a00",
    // backgroundGradientFrom: "#fb8c00",
    // backgroundGradientTo: "#ffa726",
    backgroundColor: "#30c67c",
    backgroundGradientFrom: "#5fc52e",
    backgroundGradientTo: "#5fc52e",
    // backgroundColor: "#FFD966",
    // backgroundGradientFrom: "#EBB02D",
    // backgroundGradientTo: "#EBB02D",
    decimalPlaces: 2, // optional, defaults to 2dp
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffff",
    },
  };

  const screenWidth = Dimensions.get("window").width - 30;

  let device_id_Set = {};

  for (let i = 0; i < retrievedData?.length; i++) {
    if (device_id_Set.hasOwnProperty(retrievedData[i].device_id)) {
      device_id_Set[retrievedData[i].device_id].dataSet.push(
        retrievedData[i].level
      );
      device_id_Set[retrievedData[i].device_id].labels.push(
        moment(retrievedData[i].time).format("h:mm a")
      );
      device_id_Set[retrievedData[i].device_id].date = moment(
        retrievedData[i].time
      ).format("MMMM Do YYYY");
    } else {
      device_id_Set[retrievedData[i].device_id] = {
        dataSet: [retrievedData[i].level],
        labels: [moment(retrievedData[i].time).format("h:mm a")],
        date: moment(retrievedData[i].time).format("MMMM Do YYYY"),
      };
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size={"large"} color="green" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={"#2D2727"} />
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>G</Text>
        </View>
        <Text style={styles.logoText}>Grow Tree</Text>
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {Object.entries(device_id_Set).map(([key, value], index) => (
            <View key={index} style={styles.chartContainer}>
              <Text style={styles.boldText}>Humidity Sensor Data: {key}</Text>
              <Text style={styles.normalText}>Date :{value.date}</Text>
              <LineChart
                data={{
                  datasets: [
                    {
                      data: value.dataSet,
                    },
                  ],
                }}
                width={screenWidth} // from react-native
                height={200}
                yAxisSuffix="%"
                yAxisInterval={1} // optional, defaults to 1
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // marginTop: StatusBar.currentHeight,
    flex: 1,
    backgroundColor: "#2D2727",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "flex-start",
    width: "90%",
  },
  iconContainer: {
    width: 30,
    height: 30,
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
  iconText: {
    color: "#fff",
    fontWeight: "800",
  },
  chartContainer: {
    gap: 5,
    marginBottom: 25,
  },
  boldText: {
    fontSize: 16,
    fontWeight: 500,
    color: "#fff",
  },
  normalText: {
    color: "#fff",
  },
  logoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
