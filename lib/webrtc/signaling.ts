type SignalMessage = {
  type: 'signal';
  from: string;
  signal: any;
};

type RegisterMessage = {
  type: 'register';
  userId: string;
};

type OnSignalCallback = (from: string, signal: any) => void;

type OnOpenCallback = () => void;

type OnErrorCallback = (err: any) => void;

export class WebRTCSignalingClient {
  private ws: WebSocket | null = null;
  private userId: string;
  private onSignal: OnSignalCallback;
  private onOpen?: OnOpenCallback;
  private onError?: OnErrorCallback;

  constructor({
    userId,
    onSignal,
    onOpen,
    onError }: {
    userId: string;
    onSignal: OnSignalCallback;
    onOpen?: OnOpenCallback;
    onError?: OnErrorCallback;
  }) {
    this.userId = userId;
    this.onSignal = onSignal;
    this.onOpen = onOpen;
    this.onError = onError;
  }

  connect(url: string) {
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      this.ws?.send(JSON.stringify({ type: 'register', userId: this.userId } as RegisterMessage));
      this.onOpen?.();
    };
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'signal') {
        this.onSignal(data.from, data.signal);
      }
    };
    this.ws.onerror = (err) => {
      this.onError?.(err);
    };
    this.ws.onclose = () => {
      // reconectar pode ser implementado aqui
    };
  }

  sendSignal(to: string, signal: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        type: 'signal',
        to,
        signal })
    );
  }

  close() {
    this.ws?.close();
  }
} 
