/* TypeScript declarations for Screen Wake Lock API (not yet in lib.dom.d.ts for all TS versions) */

interface WakeLockSentinel extends EventTarget {
  readonly released: boolean
  readonly type: 'screen'
  release(): Promise<void>
  addEventListener(type: 'release', listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void
  removeEventListener(type: 'release', listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void
}

interface WakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>
}

interface Navigator {
  readonly wakeLock: WakeLock
}
