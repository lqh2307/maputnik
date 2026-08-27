import {
  FriendFoeState,
  AircraftType,
  TargetType,
  VesselType,
  EwType,
} from "./Enums";

/** Defines get target trajectory option. */
export type GetTargetTrajectoryOption = {
  /** Configuration for from. */
  from?: number;
  /** Configuration for to. */
  to?: number;

  /** Configuration for controller. */
  controller?: AbortController;

  /** Maximum request duration in milliseconds. */
  timeout?: number;
};
/** Defines get target history option. */
export type GetTargetHistoryOption = GetTargetTrajectoryOption & {
  /** Identifier of the associated target. */
  targetId: number;
};
/** Describes track. */
export interface Track {
  /** Unique identifier for this entity. */
  id: number;
  /** Configuration for target type. */
  targetType: TargetType;
  /** Configuration for track type. */
  trackType: AircraftType | VesselType | number;
  /** Configuration for mode3a. */
  mode3a: string;
  /** Configuration for friend foe state. */
  friendFoeState: FriendFoeState;
  /** Configuration for polar velocity. */
  polarVelocity: PolarVelocity;
  /** Configuration for geodetic position. */
  geodeticPosition: GeodeticPosition;
  /** Configuration for timestamp. */
  timestamp: number;
  /** Configuration for warning infos. */
  warningInfos: WarningInfo[];
  /** Configuration for special label. */
  specialLabel: string;
  /** Configuration for ew type. */
  ewType: EwType;
  /** Configuration for ew frequency. */
  ewFrequency: number;
  /** Configuration for threat level. */
  threatLevel: number;
  /** Configuration for track number. */
  trackNumber: number;
  /** Configuration for height source type. */
  heightSourceType: number;
  /** Configuration for created timestamp. */
  createdTimestamp: number;
  /** Configuration for source tracks. */
  sourceTracks: SourceTrack[];
  /** Configuration for country code. */
  countryCode: string;
  /** Human-readable name. */
  name: string;
  /** Configuration for track note. */
  trackNote: string;
  /** Configuration for visible type. */
  visibleType: number;
  /** Configuration for identity. */
  identity: string;
  /** Configuration for groups. */
  groups: string[];
  /** Whether training track. */
  trainingTrack: boolean;
  /** Configuration for military symbol. */
  militarySymbol: string;
  /** Identifier of the associated linked track. */
  linkedTrackId: number;
}
/** Describes polar velocity. */
export interface PolarVelocity {
  /** Configuration for speed. */
  speed: number;
  /** Configuration for heading. */
  heading: number;
}
/** Describes geodetic position. */
export interface GeodeticPosition {
  /** Configuration for longitude. */
  longitude: number;
  /** Configuration for latitude. */
  latitude: number;
  /** Configuration for altitude. */
  altitude: number;
}
/** Describes source track. */
export interface SourceTrack {
  /** Unique identifier for this entity. */
  id: number;
  /** Identifier of the associated source. */
  sourceId: string;
  /** Human-readable name. */
  name: string;
  /** Configuration for create timestamp. */
  createTimestamp: number;
}
/** Describes warning info. */
export interface WarningInfo {}
/** Describes target source info. */
export interface TargetSourceInfo {
  /** Unique identifier for this entity. */
  id: string;
  /** Configuration for source type. */
  sourceType: number;
  /** Configuration for source level. */
  sourceLevel: number;
}
/** Describes target size. */
export interface TargetSize {
  /** Configuration for length. */
  length: number;
  /** Width in pixels. */
  width: number;
  /** Height in pixels. */
  height: number;
}
/** Describes ais info. */
export interface AisInfo {
  /** Configuration for to bow. */
  toBow: number;
  /** Configuration for to stern. */
  toStern: number;
  /** Configuration for to starboard. */
  toStarboard: number;
  /** Configuration for to port. */
  toPort: number;
  /** Configuration for draught. */
  draught: number;
  /** Configuration for transponder class. */
  transponderClass: number;
  /** Configuration for position fixing device. */
  positionFixingDevice: number;
  /** Configuration for navigation status. */
  navigationStatus: number;
  /** Configuration for eta. */
  eta: number;
  /** Whether position accurate. */
  positionAccurate: boolean;
  /** Configuration for special maneuver indicator. */
  specialManeuverIndicator: number;
}
/** Describes aircraft info. */
export interface AircraftInfo {
  /** Configuration for mode3a. */
  mode3a: string;
  /** Configuration for mode s. */
  modeS: string;
  /** Configuration for aircraft type. */
  aircraftType: number;
  /** Configuration for aircraft noise type. */
  aircraftNoiseType: number;
  /** Configuration for aircraft count. */
  aircraftCount: number;
  /** Configuration for special label. */
  specialLabel: string;
  /** Whether empty data. */
  emptyData: boolean;
}
/** Describes additional business info. */
export interface AdditionalBusinessInfo {
  /** Configuration for group_ids. */
  group_ids: string[];
  /** Configuration for note. */
  note: string;
  /** Whether training track. */
  trainingTrack: boolean;
  /** Configuration for video link. */
  videoLink: string;
  /** Configuration for image link. */
  imageLink: string;
  /** Configuration for military symbol. */
  militarySymbol: string;
}
/** Describes target track info. */
export interface TargetTrackInfo {
  /** Human-readable name. */
  name: string;
  /** Configuration for call sign. */
  callSign: string;
  /** Configuration for country code. */
  countryCode: string;
  /** Configuration for friend foe state. */
  friendFoeState: number;
  /** Configuration for target size. */
  targetSize: TargetSize;
  /** Configuration for departure location. */
  departureLocation: string;
  /** Configuration for arrival location. */
  arrivalLocation: string;
  /** Configuration for mmsi. */
  mmsi: number;
  /** Configuration for height source type. */
  heightSourceType: number;
  /** Configuration for ais info. */
  aisInfo: AisInfo;
  /** Configuration for aircraft info. */
  aircraftInfo: AircraftInfo;
  /** Configuration for vessel info. */
  vesselInfo: unknown;
  /** Configuration for detect sources. */
  detectSources: string[];
  /** Configuration for threat level. */
  threatLevel: number;
  /** Configuration for assign managers. */
  assignManagers: unknown[];
  /** Configuration for assign kill managers. */
  assignKillManagers: unknown[];
  /** Configuration for additional business info. */
  additionalBusinessInfo: AdditionalBusinessInfo;
  /** Configuration for detect time. */
  detectTime?: number;
  /** Configuration for type enemy track. */
  typeEnemyTrack?: number;
}
/** Describes afad info. */
export interface AfadInfo {
  /** Configuration for track number. */
  trackNumber: number;
  /** Configuration for track quality. */
  trackQuality: number;
  /** Configuration for note. */
  note: string;
  /** Configuration for air route. */
  airRoute: string;
  /** Configuration for tail number. */
  tailNumber: string;
  /** Configuration for track attribute. */
  trackAttribute: string;
  /** Configuration for aircraft model. */
  aircraftModel: string;
  /** Configuration for actual departure time. */
  actualDepartureTime: number;
  /** Configuration for expected departure time. */
  expectedDepartureTime: number;
  /** Configuration for expect arrival time. */
  expectArrivalTime: number;
  /** Configuration for departure airport. */
  departureAirport: string;
  /** Configuration for arrival airport. */
  arrivalAirport: string;
}
/** Describes target history source track. */
export interface TargetHistorySourceTrack {
  /** Unique identifier for this entity. */
  id: number;
  /** Configuration for source info. */
  sourceInfo: TargetSourceInfo;
  /** Configuration for track info. */
  trackInfo: TargetTrackInfo;
  /** Configuration for geodetic position. */
  geodeticPosition: GeodeticPosition;
  /** Configuration for polar velocity. */
  polarVelocity: PolarVelocity;
  /** Configuration for afad info. */
  afadInfo: AfadInfo;
  /** Configuration for created timestamp. */
  createdTimestamp: number;
  /** Configuration for timestamp. */
  timestamp: number;
  /** Whether no signal. */
  noSignal: boolean;
}
/** Describes polar position. */
export interface PolarPosition {
  /** Configuration for range. */
  range: number;
  /** Configuration for azimuth. */
  azimuth: number;
  /** Configuration for elevation. */
  elevation: number;
}
/** Describes target history info. */
export interface TargetHistoryInfo {
  /** Unique identifier for this entity. */
  id: number;
  /** Configuration for target type. */
  targetType: number;
  /** Configuration for source info. */
  sourceInfo: TargetSourceInfo;
  /** Configuration for source tracks. */
  sourceTracks: TargetHistorySourceTrack[];
  /** Configuration for track info. */
  trackInfo: TargetTrackInfo;
  /** Configuration for polar velocity. */
  polarVelocity: PolarVelocity;
  /** Configuration for polar position. */
  polarPosition: PolarPosition;
  /** Configuration for geodetic position. */
  geodeticPosition: GeodeticPosition;
  /** Configuration for tracking mode. */
  trackingMode: number;
  /** Configuration for active mode. */
  activeMode: number;
  /** Configuration for created timestamp. */
  createdTimestamp: number;
  /** Configuration for last updated timestamp. */
  lastUpdatedTimestamp: number;
  /** Configuration for timestamp. */
  timestamp: number;
  /** Configuration for afad info. */
  afadInfo: AfadInfo;
  /** Configuration for ew info. */
  ewInfo: unknown;
  /** Configuration for groups. */
  groups: string[];
  /** Configuration for warning infos. */
  warningInfos: WarningInfo[];
  /** Configuration for mmsi info. */
  mmsiInfo: unknown;
  /** Identifier of the associated linked track. */
  linkedTrackId: number;
  /** Configuration for track number. */
  trackNumber: number;
  /** Configuration for track type. */
  trackType: number;
}
/** Defines target history point. */
export type TargetHistoryPoint = [
  altitude: string,
  latitude: string,
  longitude: string,
  heading: string,
  speed: string,
  timestamp: string,
  friendFoeState: string,
  sourceId: string,
  targetId: string,
];
/** Describes target history response. */
export interface TargetHistoryResponse {
  /** Configuration for info. */
  info: TargetHistoryInfo;
  /** Configuration for track2 socket. */
  track2Socket: Track;
  /** Configuration for histories. */
  histories: TargetHistoryPoint[];
}
