import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for admin WebSocket connection with auto-reconnect.
 * Connects to ws://host:port/ws?token=JWT and dispatches events.
 *
 * @param {Object} handlers - Event handler callbacks
 * @param {Function} handlers.onNewOrder - Called with order data on new_order event
 * @param {Function} handlers.onStatusUpdate - Called with {id, status, previous_status}
 * @param {Function} handlers.onPaymentUpdate - Called with {id, payment_status}
 * @param {Function} handlers.onConnected - Called when WebSocket connects
 */
export function useAdminWebSocket(handlers = {}) {
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const handlersRef = useRef(handlers);
    handlersRef.current = handlers;

    const connect = useCallback(() => {
        const token = localStorage.getItem('store_admin_token');
        if (!token) return;

        // Determine WebSocket URL from current location
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

        // In dev, API might be on a different port (5000)
        const apiUrl = import.meta.env.VITE_API_URL;
        let wsHost;
        if (apiUrl) {
            try {
                const url = new URL(apiUrl, window.location.origin);
                wsHost = `${protocol}//${url.host}`;
            } catch {
                wsHost = `${protocol}//${window.location.host}`;
            }
        } else {
            wsHost = `${protocol}//${window.location.host}`;
        }

        const wsUrl = `${wsHost}/ws?token=${encodeURIComponent(token)}`;

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('[WS] Connected');
                reconnectAttemptsRef.current = 0;
                handlersRef.current.onConnected?.();
            };

            ws.onmessage = (event) => {
                try {
                    const { event: eventType, payload } = JSON.parse(event.data);

                    switch (eventType) {
                        case 'new_order':
                            handlersRef.current.onNewOrder?.(payload);
                            break;
                        case 'order_status_updated':
                            handlersRef.current.onStatusUpdate?.(payload);
                            break;
                        case 'payment_status_updated':
                            handlersRef.current.onPaymentUpdate?.(payload);
                            break;
                        case 'connected':
                            // Welcome message, already handled via onopen
                            break;
                        default:
                            console.log('[WS] Unknown event:', eventType);
                    }
                } catch (err) {
                    console.error('[WS] Message parse error:', err);
                }
            };

            ws.onclose = (event) => {
                console.log(`[WS] Disconnected (code: ${event.code})`);
                wsRef.current = null;

                // Don't reconnect on auth failures
                if (event.code === 4001 || event.code === 4003) {
                    console.log('[WS] Auth failed, not reconnecting');
                    return;
                }

                // Exponential backoff reconnect: 1s, 2s, 4s, 8s, max 30s
                const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                reconnectAttemptsRef.current++;
                console.log(`[WS] Reconnecting in ${delay / 1000}s...`);
                reconnectTimeoutRef.current = setTimeout(connect, delay);
            };

            ws.onerror = (err) => {
                console.error('[WS] Error:', err);
            };
        } catch (err) {
            console.error('[WS] Connection error:', err);
        }
    }, []);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [connect]);

    return {
        isConnected: () => wsRef.current?.readyState === WebSocket.OPEN
    };
}
