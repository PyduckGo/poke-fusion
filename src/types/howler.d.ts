// howler类型声明
declare module 'howler' {
  export class Howl {
    constructor(options: {
      src: string[];
      volume?: number;
      html5?: boolean;
    });
    play(): void;
    stop(): void;
    pause(): void;
    volume(volume: number): void;
  }
}
