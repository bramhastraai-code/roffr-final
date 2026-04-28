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
  propertyById: "/properties/property",
  amenity: "/amenities/amenity-list",
  login: "/customers/login", // Keeping for reference, though unused
};

export default endpoints;
