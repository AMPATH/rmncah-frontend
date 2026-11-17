// MPDSR role codes supplied by the backend.
export type Role =
  | 'SYSTEM_ADMIN'
  | 'CHP'
  | 'FACILITY_REPORTER'
  | 'FACILITY_CHAIR'
  | 'PCN_COORDINATOR'
  | 'SUBCOUNTY_COORDINATOR'
  | 'COUNTY_SURVEILLANCE_LEAD';

// Which system module a role belongs to.
export type SystemModule = 'PLATFORM' | 'MPDSR';
