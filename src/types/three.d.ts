// Three.js类型声明
declare module 'three' {
  export * from 'three/src/Three';
}

// 扩展全局类型
declare global {
  interface Window {
    THREE: any;
  }
}
