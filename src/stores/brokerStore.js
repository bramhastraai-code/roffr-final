import { makeRequest } from "@/request/request";
import { defineStore } from "pinia";
import endpoints from "@/request/endpoints";
import { ref } from "vue";

export const useBrokerStore = defineStore("broker", () => {
  const currentBrokerData = ref([])
  const brokerData = ref([]);

  const getCurrentBrokerData = async (id) => {
    try {
      const response = await makeRequest(
        endpoints.broker,
        "GET",
        {},
        {},
        {},
        0,
        id
      );

      currentBrokerData.value = response?.data;
    } catch (error) {
      console.error("Error in fetching current user data", error);
    }
  };


  const getBrokerData = async (id) => {
    try {
      const response = await makeRequest(
        endpoints.broker,
        "GET",
        {},
        {},
        {},
        0,
        id
      );

      brokerData.value = response?.data;
    } catch (error) {
      console.error("Error in fetching customer data", error);
    }
  };

  const reset = () => {
    brokerData.value = []
  }

  return {
    getBrokerData,
    getCurrentBrokerData,
    currentBrokerData,
    brokerData,
    reset
  };
});
