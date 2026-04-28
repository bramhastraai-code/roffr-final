const endpoints = {
  byAffordability: "/projects/by-affordability",
  groupBuying: "/projects/exclusive-projects",
  getProjectById: "/projects/project-detail",
  getProjectProperty: "projects",
  search: "/search/list",
  searchSuggestion: "/search/search-suggestions",
  blog: "/blogs/active",
  customer: "/customers/customer",
  getCustomers: "/customer-auth/send-otp-less",
  verifyOtp: "/customer-auth/verify-otp-less",
  orders: "/orders",
  plans: "/plans",
  createCustomer: "/customers",
  getCustomerById: "/customers/customer", // Appending ID in usage
  updateCustomer: "/customers/customer", // Appending ID in usage
  deleteCustomer: "/customers/customer", // Appending ID in usage
  getCustomerProfile: "/customers/customer",
  projectCities: "/projects/unique-cities",
  property: "/properties/roffer",
  broker: "/users",
  builder: "/company",
  builderById: "/company/company",
  propertyById: "/properties/property",
  amenity: "/amenities/amenity-list",
  login: "/customers/login", // Keeping for reference, though unused

  // Customer-scoped (marketplace P2P listings + bookings)
  customerProperties: "/properties/customer", // append /:customerId
  customerProjects: "/projects/customer", // append /:customerId
  siteVisits: "/site-visits", // POST to create
  customerSiteVisits: "/site-visits/customer", // append /:customerId

  // Social feed (Twitter-like)
  social: "/social",
};

export default endpoints;
