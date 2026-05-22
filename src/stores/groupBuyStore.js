import { defineStore } from "pinia";
import { ref } from "vue";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";

export const useGroupBuyStore = defineStore("groupBuy", () => {
  const activeCampaigns = ref([]);
  const myRequests = ref([]);
  const loading = ref(false);

  const fetchActiveCampaigns = async () => {
    loading.value = true;
    try {
      const res = await makeRequest(endpoints.groupBuyActive, "GET");
      activeCampaigns.value = res?.data || [];
    } catch (e) {
      console.error("fetchActiveCampaigns failed", e);
      activeCampaigns.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchCampaignForProject = async (projectId) => {
    try {
      const res = await makeRequest(
        endpoints.groupBuyByProject,
        "GET",
        {},
        {},
        {},
        0,
        projectId
      );
      return res?.data || null;
    } catch (e) {
      console.error("fetchCampaignForProject failed", e);
      return null;
    }
  };

  /**
   * Create a join request for a campaign. No requirements collected — the
   * customer's snapshot (name, phone, email) is taken from the Customer doc
   * server-side and the token amount is computed from project min/max price.
   */
  const createRequest = async ({ campaignId, customerId }) => {
    const res = await makeRequest(endpoints.groupBuyRequests, "POST", {
      campaignId,
      customerId,
    });
    return res?.data || null;
  };

  const fetchMyRequests = async (customerId) => {
    loading.value = true;
    try {
      const res = await makeRequest(
        endpoints.groupBuyCustomerList,
        "GET",
        {},
        {},
        {},
        0,
        customerId
      );
      myRequests.value = res?.data || [];
    } catch (e) {
      console.error("fetchMyRequests failed", e);
      myRequests.value = [];
    } finally {
      loading.value = false;
    }
  };

  return {
    activeCampaigns,
    myRequests,
    loading,
    fetchActiveCampaigns,
    fetchCampaignForProject,
    createRequest,
    fetchMyRequests,
  };
});
