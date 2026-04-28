import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";

// Bundles the marketplace customer's own listings (properties, projects)
// and their booked site visits + dashboard stats.
export const useMyDashboardStore = defineStore("myDashboard", () => {
  const myProperties = ref([]);
  const myProjects = ref([]);
  const mySiteVisits = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const stats = computed(() => ({
    properties: myProperties.value.length,
    projects: myProjects.value.length,
    siteVisits: mySiteVisits.value.length,
    activeListings: myProperties.value.length + myProjects.value.length,
  }));

  // ---------- Properties ----------
  const fetchMyProperties = async (customerId) => {
    if (!customerId) return;
    try {
      const res = await makeRequest(
        `${endpoints.customerProperties}/${customerId}`,
        "GET",
        {},
        {},
        { page: 1, limit: 50 },
        0,
      );
      myProperties.value = res?.data?.properties ?? [];
    } catch (err) {
      console.error("fetchMyProperties failed", err);
      myProperties.value = [];
    }
  };

  const createMyProperty = async (customerId, payload) => {
    if (!customerId) throw new Error("customerId required");
    const res = await makeRequest(
      `${endpoints.customerProperties}/${customerId}`,
      "POST",
      payload,
      {},
      {},
      0,
    );
    await fetchMyProperties(customerId);
    return res;
  };

  const deleteMyProperty = async (customerId, propertyId) => {
    if (!customerId || !propertyId) return;
    await makeRequest(
      `${endpoints.customerProperties}/${customerId}/${propertyId}`,
      "DELETE",
      {},
      {},
      {},
      0,
    );
    myProperties.value = myProperties.value.filter(
      (p) => (p?._id || p?.id) !== propertyId,
    );
  };

  // ---------- Projects ----------
  const fetchMyProjects = async (customerId) => {
    if (!customerId) return;
    try {
      const res = await makeRequest(
        `${endpoints.customerProjects}/${customerId}`,
        "GET",
        {},
        {},
        { page: 1, limit: 50 },
        0,
      );
      myProjects.value = res?.data?.projects ?? [];
    } catch (err) {
      console.error("fetchMyProjects failed", err);
      myProjects.value = [];
    }
  };

  const createMyProject = async (customerId, payload) => {
    if (!customerId) throw new Error("customerId required");
    const res = await makeRequest(
      `${endpoints.customerProjects}/${customerId}`,
      "POST",
      payload,
      {},
      {},
      0,
    );
    await fetchMyProjects(customerId);
    return res;
  };

  const deleteMyProject = async (customerId, projectId) => {
    if (!customerId || !projectId) return;
    await makeRequest(
      `${endpoints.customerProjects}/${customerId}/${projectId}`,
      "DELETE",
      {},
      {},
      {},
      0,
    );
    myProjects.value = myProjects.value.filter(
      (p) => (p?._id || p?.id) !== projectId,
    );
  };

  // ---------- Site visits ----------
  const fetchMySiteVisits = async (customerId) => {
    if (!customerId) return;
    try {
      const res = await makeRequest(
        `${endpoints.customerSiteVisits}/${customerId}`,
        "GET",
        {},
        {},
        {},
        0,
      );
      mySiteVisits.value = Array.isArray(res?.data) ? res.data : [];
    } catch (err) {
      console.error("fetchMySiteVisits failed", err);
      mySiteVisits.value = [];
    }
  };

  // payload shape (minimum): { projectId, propertyId?, scheduledDate, customerName, phoneNumber }
  const bookSiteVisit = async (customerId, payload) => {
    if (!customerId) throw new Error("customerId required");
    const body = { ...payload, customerId };
    const res = await makeRequest(
      endpoints.siteVisits,
      "POST",
      body,
      {},
      {},
      0,
    );
    await fetchMySiteVisits(customerId);
    return res;
  };

  // ---------- Bulk loader for dashboard ----------
  const loadAll = async (customerId) => {
    if (!customerId) return;
    loading.value = true;
    error.value = null;
    try {
      await Promise.all([
        fetchMyProperties(customerId),
        fetchMyProjects(customerId),
        fetchMySiteVisits(customerId),
      ]);
    } catch (err) {
      error.value =
        err?.response?.data?.message || "Failed to load dashboard data";
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    myProperties.value = [];
    myProjects.value = [];
    mySiteVisits.value = [];
    error.value = null;
  };

  return {
    myProperties,
    myProjects,
    mySiteVisits,
    loading,
    error,
    stats,

    fetchMyProperties,
    createMyProperty,
    deleteMyProperty,

    fetchMyProjects,
    createMyProject,
    deleteMyProject,

    fetchMySiteVisits,
    bookSiteVisit,

    loadAll,
    reset,
  };
});
