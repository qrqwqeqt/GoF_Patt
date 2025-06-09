export interface Dimensions {
  length: string;
  width: string;
  height: string;
}

export interface DeviceImage {
  url: string;
  width: number;
  height: number;
}

export interface DeviceData {
  title: string;
  description: string;
  manufacturer: string;
  deviceModel: string;
  condition: string;
  batteryCapacity: string;
  weight: string;
  typeC: string;
  typeA: string;
  sockets: string;
  remoteUse: string;
  dimensions: string;
  batteryType: string;
  signalShape: string;
  additional: string;
  imageDimensions: string;
  price: string;
  minRentTerm: string;
  maxRentTerm: string;
  policyAgreement: string;
  [key: string]: string;
}
