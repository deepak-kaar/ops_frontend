// =====================================================================
// MOCK WEBSOCKET SERVICE - DEV ONLY
// Simulates a WebSocket feed that sends widget data updates every 10s.
// Remove this file and its usages once real WebSocket is wired up.
// =====================================================================
import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export interface MockWsPayload {
    /** Randomised numeric value between 0-100 */
    numericValue: number;
    /** Chart labels */
    labels: string[];
    /** Chart values (matching labels length) */
    values: number[];
    /** Secondary dataset for dual-series charts */
    values1: number[];
    values2: number[];
    /** Progress / knob value 0-100 */
    progressValue: number;
    /** Timestamp of the push */
    timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class MockWebSocketService implements OnDestroy {

    /** Stream consumers can subscribe to */
    readonly data$ = new Subject<MockWsPayload>();

    private intervalId: any;

    constructor() {
        // Start emitting immediately
        this.startInterval();
    }

    private startInterval(): void {
        // Emit once right away so the first render has "live" data
        this.emit();
        this.intervalId = setInterval(() => this.emit(), 10_000);
    }

    private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private buildSeries(length: number): number[] {
        return Array.from({ length }, () => this.randomInt(10, 95));
    }

    private emit(): void {
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const payload: MockWsPayload = {
            numericValue: this.randomInt(0, 100),
            labels,
            values: this.buildSeries(labels.length),
            values1: this.buildSeries(labels.length),
            values2: this.buildSeries(labels.length),
            progressValue: this.randomInt(10, 95),
            timestamp: new Date().toISOString()
        };
        this.data$.next(payload);
        console.log('[MockWS] Pushed update at', payload.timestamp);
    }

    ngOnDestroy(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.data$.complete();
    }
}
