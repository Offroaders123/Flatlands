export class MusicManager {
  private readonly tracks: string[];
  private readonly firstTrack: string;
  private readonly audio: HTMLAudioElement;

  private currentTrack: string | null = null;

  constructor(tracks: string[], firstTrack: string) {
    this.tracks = tracks;
    this.firstTrack = firstTrack;
    this.audio = new Audio();

    this.audio.volume = 0.5;
    this.audio.addEventListener("ended", this.playRandom.bind(this));
  }

  async start(): Promise<void> {
    this.currentTrack = this.firstTrack;
    this.audio.src = this.firstTrack;

    try {
      await this.audio.play();
    } catch (error) {
      console.warn("Unable to play music:", error);
    }
  }

  async playRandom(): Promise<void> {
    if (this.tracks.length === 0) return;

    // Don't play the song that just played!
    const availableTracks: string[] = this.tracks.filter(
      track => track !== this.currentTrack
    );

    const pool: string[] = availableTracks.length > 0
      ? availableTracks
      : this.tracks;

    const index: number = Math.floor(Math.random() * pool.length);
    const track: string = pool[index]!;

    this.currentTrack = track;
    this.audio.src = track;

    try {
      await this.audio.play();
    } catch (error) {
      console.warn("Unable to play music:", error);
    }
  }

  pause(): void {
    this.audio.pause();
  }

  resume(): Promise<void> {
    return this.audio.play();
  }

  dispose(): void {
    this.audio.pause();
    this.audio.removeEventListener("ended", this.playRandom.bind(this));
    this.audio.src = "";
  }
}
