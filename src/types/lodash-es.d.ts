// lodash-es类型声明
declare module 'lodash-es' {
  export function sampleSize<T>(array: T[], n: number): T[];
  export function random(min: number, max: number): number;
  export function shuffle<T>(array: T[]): T[];
}
