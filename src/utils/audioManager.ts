// 音效管理器 - 8位音效和宝可梦叫声
import { Howl } from 'howler';
import * as Tone from 'tone';

// 音效管理器类
export class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private synth: Tone.Synth | null = null;
  
  constructor() {
    this.initAudio();
  }

  private async initAudio() {
    try {
      // 初始化Tone.js
      await Tone.start();
      this.synth = new Tone.Synth().toDestination();
    } catch (error) {
      console.warn('音频初始化失败:', error);
    }
  }

  // 播放融合音效
  playFusionSound() {
    if (!this.synth) return;
    
    // 创建8位风格的融合音效
    const notes = ['C4', 'E4', 'G4', 'C5'];
    const now = Tone.now();
    
    notes.forEach((note, index) => {
      this.synth!.triggerAttackRelease(note, '8n', now + index * 0.1);
    });
  }

  // 播放成功音效
  playSuccessSound() {
    if (!this.synth) return;
    
    // 胜利音效
    const notes = ['C5', 'E5', 'G5', 'C6'];
    const now = Tone.now();
    
    notes.forEach((note, index) => {
      this.synth!.triggerAttackRelease(note, '16n', now + index * 0.05);
    });
  }

  // 播放点击音效
  playClickSound() {
    if (!this.synth) return;
    
    this.synth.triggerAttackRelease('A4', '32n');
  }

  // 播放宝可梦叫声
  playPokemonCry(pokemonId: number) {
    if (!this.synth) return;
    
    // 基于宝可梦ID生成独特的音调
    const baseFreq = 220 + (pokemonId % 100) * 2;
    const notes = [baseFreq, baseFreq * 1.5, baseFreq * 2];
    const now = Tone.now();
    
    notes.forEach((freq, index) => {
      this.synth!.triggerAttackRelease(freq, '8n', now + index * 0.1);
    });
  }

  // 播放加载音效
  playLoadingSound() {
    if (!this.synth) return;
    
    const now = Tone.now();
    for (let i = 0; i < 3; i++) {
      this.synth.triggerAttackRelease('C4', '16n', now + i * 0.2);
    }
  }

  // 静音/取消静音
  toggleMute() {
    // 简化静音功能
    if (this.synth) {
      this.synth.volume.value = this.synth.volume.value === -Infinity ? 0 : -Infinity;
    }
  }
}

// 创建全局音效管理器实例
export const audioManager = new AudioManager();
