import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws";

export function useWebSocket() {
    const [latestMetric, setLatestMetric] = useState(null);
    const [latestAnomaly, setLatestAnomaly] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef(null);

    const connect = useCallback(() => {
        const token = localStorage.getItem("token");
        const tenantId = localStorage.getItem("tenantId");
        if (!token || !tenantId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,

            onConnect: () => {
                setIsConnected(true);

                // Subscribe to tenant-specific metrics topic
                client.subscribe(
                    `/topic/tenant/${tenantId}/metrics`,
                    (message) => {
                        try {
                            const event = JSON.parse(message.body);
                            setLatestMetric(event);
                        } catch (e) {
                            console.error("Failed to parse metric event", e);
                        }
                    }
                );

                // Subscribe to tenant-specific anomaly topic
                client.subscribe(
                    `/topic/tenant/${tenantId}/anomalies`,
                    (message) => {
                        try {
                            const anomaly = JSON.parse(message.body);
                            setLatestAnomaly(anomaly);
                        } catch (e) {
                            console.error("Failed to parse anomaly event", e);
                        }
                    }
                );
            },

            onDisconnect: () => {
                setIsConnected(false);
            },

            onStompError: (frame) => {
                console.error("STOMP error:", frame);
                setIsConnected(false);
            },
        });

        client.activate();
        clientRef.current = client;
    }, []);

    useEffect(() => {
        connect();
        return () => {
            clientRef.current?.deactivate();
        };
    }, [connect]);

    return { latestMetric, latestAnomaly, isConnected };
}
