/** Centralized enum values used by target trajectory track data. */
export enum TargetType {
  All = -1,
  Unknown = 0,
  Aircraft = 1,
  Vessel = 2,
  Event = 3,
  EW2 = 4,
  EW = 5,
}

/** Aircraft subtype values used by the track API. */
export enum AircraftType {
  UNKNOWN = 0,
  BOMBER = 1,
  HELICOPTER = 2,
  TRANSPORT = 3,
  REFUEL = 4,
  RECONNAISSANCE = 5,
  ECM = 6,
  AWACS = 7,
  TRAINING = 8,
  STRATEGIC_BOMBER = 9,
  CRUISE_MISSILE = 10,
  BALLISTIC_MISSILE = 11,
  TYPE_UAV = 12,
  TYPE_AEROSTAT = 13,
  CIVIL = 14,
  FIGHTER = 15,
}

/** Vessel subtype values used by the track API. */
export enum VesselType {
  VESSEL_TYPE_UNKNOWN = 0,
  VESSEL_TYPE_CARGO = 1,
  VESSEL_TYPE_DANGEROUS_CARGO = 2,
  VESSEL_TYPE_TANKER = 3,
  VESSEL_TYPE_TUG_BOAT = 4,
  VESSEL_TYPE_WORK_BOAT = 5,
  VESSEL_TYPE_BARGE = 6,
  VESSEL_TYPE_PATROL_CRAFT = 7,
  VESSEL_TYPE_NAVAL_VESSEL = 8,
  VESSEL_TYPE_PLEASURE_CRAFT = 9,
  VESSEL_TYPE_PASSENGER = 10,
  VESSEL_TYPE_FISHING_VESSEL = 11,
  VESSEL_TYPE_ROWING_BOAT = 12,
  VESSEL_TYPE_SPEED_BOAT = 13,
  VESSEL_TYPE_PILOT_BOAT = 14,
  VESSEL_TYPE_SEARCH_AND_RESCUE_VESSEL = 15,
  VESSEL_TYPE_CANOE = 16,
  VESSEL_TYPE_MILITARY_CANOE = 17,
  VESSEL_TYPE_MILITARY_TANKER = 18,
  VESSEL_TYPE_ANTI_SUBMARINE = 19,
  VESSEL_TYPE_AMPHIBIOUS = 20,
  VESSEL_TYPE_HYDROGRAPHIC_SURVEY = 21,
  VESSEL_TYPE_CRUISER = 22,
  VESSEL_TYPE_MILITARY_CARGO = 23,
  VESSEL_TYPE_HOSPITAL = 24,
  VESSEL_TYPE_MILITARY_TUG = 25,
  VESSEL_TYPE_AIRCRAFT_CARRIER = 26,
  VESSEL_TYPE_MISSILE_FRIGATE = 27,
  VESSEL_TYPE_FIXED_PLATFORM = 28,
  VESSEL_TYPE_MOBILE_PLATFORM = 29,
  VESSEL_TYPE_FRIGATE = 30,
  VESSEL_TYPE_DESTROYER = 31,
  VESSEL_TYPE_TARGET = 32,
  VESSEL_TYPE_SUBMARINE = 33,
  VESSEL_TYPE_GUNBOAT = 34,
  VESSEL_TYPE_TORPEDO_BOAT = 35,
  VESSEL_TYPE_MINESWEEPER = 36,
  VESSEL_TYPE_AIRPORT = 37,
  VESSEL_TYPE_MERCHANT = 38,
  VESSEL_TYPE_MISSILE_BOAT = 39,
  VESSEL_TYPE_PLATFORM_EXPLORER = 40,
  VESSEL_TYPE_SAILING = 41,
  VESSEL_TYPE_MUD_DREDGER = 42,
  VESSEL_TYPE_OCEAN_RESEARCH = 43,
  VESSEL_TYPE_STATE_OWNED_CARGO = 44,
  VESSEL_TYPE_WATER_CARGO = 45,
  VESSEL_TYPE_ARMED_FISHING_VESSEL = 46,
}

/** Electronic-warfare subtype values used by the track API. */
export enum EwType {
  Unknown = -1,
  ElintRadar = 0,
  ElintTarget = 1,
  ComintTarget = 2,
  IndirectComintTarget = 3,
}

/** Friend-or-foe state values used by the track API. */
export enum FriendFoeState {
  Unknown = 0,
  Enemy = 1,
  Military = 2,
  Transit = 3,
  International = 4,
  Inland = 5,
  Ally = 6,
  Neutral = 7,
  Threat = 8,
  OwnForce = 9,
  ParaMilitary = 10,
  Police = 11,
  Civil = 12,
  All = 13,
  Politics = 14,
  Society = 15,
  Foreign = 16,
  MilitaryAndParaMilitary = 100,
  AllyOwnForce = 101,
  White = 1000,
}

/** Tracking mode values used by target history details. */
export enum TrackingMode {
  AUTOMATIC = 0,
  SEMI_AUTO = 1,
  MANUAL = 2,
}

/** Track image identifiers used by the rendering services. */
export enum TrackImage {
  AircraftTrack = "AIRCRAFT_TRACK_IMAGE",
  AircraftTrackRectangle = "AIRCRAFT_TRACK_RECTANGLE",
  ElintRadar = "ELINT_RADAR_IMAGE",
  HighComint = "HIGH_COMINT_IMAGE",
  LowComint = "LOW_COMINT_IMAGE",
  VesselTrack = "VESSEL_TRACK_IMAGE",
  UnknownTrack = "UNKNOW_TRACK_IMAGE",
  GroundTrack = "GROUND_TRACK_IMAGE",
  SubMarineTrack = "SUBMARINE_TRACK_IMAGE",
  UnconfirmTrack = "UN_CONFIRM_TARGET_IMAGE",
  AircraftTrackEnemy = "AIRCRAFT_TRACK_ENEMY",
  FormerTrack = "FORMER_TRACK",
  TEST = "TEST",
}

/** Comparison operators used by track kinetic filters. */
export enum TrackKinecticInfo {
  EQUAL = "eq",
  NOT_EQUAL = "ne",
  LOWER_THAN_EQUAL = "lte",
  GREATER_THEN_EQUAL = "gte",
  LOWER_THAN = "lt",
  GREATER_THAN = "gt",
}

/** Region tab identifiers used by track-related screens. */
export enum RegionTrackTab {
  RESPONSIBLE = "RESPONSIBLE",
  BATTLEFIELDS = "BATTLEFIELDS",
  HAND_DRAW = "HAND_DRAW",
  MY_AREA = "MY_AREA",
}
