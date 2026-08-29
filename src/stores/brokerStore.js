import { makeRequest } from "@/request/request";
import { defineStore } from "pinia";
import endpoints from "@/request/endpoints";
import { ref } from "vue";

export const useBrokerStore = defineStore("broker", () => {
  const currentBrokerData = ref({});
  const brokerData = ref({});
  const brokerList = ref([]);
  const brokerListTotal = ref(0);
  // Exposed so views can show a real error state instead of an empty one.
  const brokerListError = ref(false);
  const brokerListPage = ref(1);
  const brokerListPageSize = ref(12);

  const getCurrentBrokerData = async (id) => {
    try {
      const response = await makeRequest(
        endpoints.broker,
        "GET",
        {},
        {},
        {},
        0,
        id,
      );

      currentBrokerData.value = response?.data ?? {};
    } catch (error) {
      console.error("Error in fetching current broker data", error);
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
        id,
      );

      brokerData.value = response?.data ?? {};
    } catch (error) {
      console.error("Error in fetching broker data", error);
    }
  };

  const getBrokerList = async ({
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    append = false,
  } = {}) => {
    try {
      const params = {
        pageNumber: page,
        pageSize: brokerListPageSize.value,
        sortBy,
        sortOrder,
      };
      if (search) params.searchQuery = search;

      const response = await makeRequest(
        endpoints.broker,
        "GET",
        {},
        {},
        params,
        0,
      );

      const payload = response?.data ?? {};
      const fetched = payload?.users ?? payload?.data ?? [];
      brokerList.value = append ? [...brokerList.value, ...fetched] : fetched;
      brokerListPage.value = page;
      brokerListTotal.value =
        payload?.total ?? payload?.totalUsers ?? brokerList.value.length;
      brokerListError.value = false;
    } catch (error) {
      console.error("Error in fetching broker list", error);
      brokerListError.value = true;
      if (!append) {
        brokerList.value = [];
        brokerListTotal.value = 0;
      }
    }
  };

  // ── Assigned channel partner lookup ────────────────────────────
  // The users API has no companyId filter (404), so we build a small
  // companyId -> broker index once per session (up to 400 newest users)
  // and match client-side. Verified brokers win over unverified ones.
  let companyIndex = null;
  let companyIndexPromise = null;

  const buildCompanyIndex = () => {
    if (companyIndexPromise) return companyIndexPromise;
    companyIndexPromise = (async () => {
      const map = new Map();
      for (let page = 1; page <= 4; page++) {
        try {
          const res = await makeRequest(
            endpoints.broker,
            "GET",
            {},
            {},
            { pageNumber: page, pageSize: 100, sortBy: "createdAt", sortOrder: "desc" },
            0,
          );
          const users = res?.data?.users ?? [];
          if (!users.length) break;
          for (const u of users) {
            const cid = u?.companyId?._id || u?.companyId;
            if (!cid) continue;
            const existing = map.get(cid);
            if (!existing || (u.is_verified && !existing.is_verified)) map.set(cid, u);
          }
        } catch (error) {
          console.error("Error building broker company index", error);
          break;
        }
      }
      companyIndex = map;
      return map;
    })();
    return companyIndexPromise;
  };

  /** Broker assigned to a company's projects, or null when none is registered. */
  const findBrokerForCompany = async (companyId) => {
    if (!companyId) return null;
    const map = companyIndex || (await buildCompanyIndex());
    return map.get(companyId) || null;
  };

  const reset = () => {
    brokerData.value = {};
    brokerList.value = [];
    brokerListTotal.value = 0;
  };

  return {
    getBrokerData,
    getCurrentBrokerData,
    getBrokerList,
    findBrokerForCompany,
    currentBrokerData,
    brokerData,
    brokerList,
    brokerListTotal,
    brokerListError,
    brokerListPage,
    brokerListPageSize,
    reset,
  };
});
