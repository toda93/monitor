import _ from 'lodash';
import si from 'systeminformation';
import HttpClient from '@azteam/http-client';

class Monitor {
    static async getExternalIP() {
        if (!this.ip) {
            const client = new HttpClient();
            const ip = await client.responseText().get('http://ipv4bot.whatismyipaddress.com/');
            this.ip = ip.trim();
        }
        return this.ip;
    }

    static async getFreeSpace() {
        try {
            const data = await si.fsSize();
            let homeSpace = 0;
            let rootSpace = 0;
            data.map(item => {
                if (item.mount === '/') {
                    rootSpace += (item.size - item.used);
                }
                if (item.mount === '/home') {
                    homeSpace += (item.size - item.used);
                }
            });
            if (homeSpace > 0) {
                return homeSpace;
            }
            return rootSpace;
        } catch (e) {
            return 0;
        }
    }

    static async getUsedSpacePercent() {
        try {
            const data = await si.fsSize();
            let freeSpace = 100;
            data.map(item => {
                if (item.mount === '/') {
                    freeSpace = Math.floor(item.used / item.size * 100);
                }
            });
            return freeSpace;
        } catch (e) {
            return 100;
        }
    }

    static async getFreeMemory() {
        const mem = await si.mem();
        return mem.available;
    }

    static async getMemoryUsagePercent() {
        const mem = await si.mem();
        return Math.floor((mem.total - mem.available) / mem.total * 100)
    }

    static async getCPUUsagePercent() {
        const cpuLoad = await si.currentLoad();
        return {
            current: Math.floor(cpuLoad.currentload),
            per: _.map(cpuLoad.cpus, obj => {
                return Math.floor(obj.load);
            })
        }
    }

    static async getNetwork() {
        const network = await si.networkStats();
        return {
            rx_sec: Math.floor(network[0].rx_sec),
            rx_bytes: Math.floor(network[0].rx_bytes),
            tx_sec: Math.floor(network[0].tx_sec),
            tx_bytes: Math.floor(network[0].tx_bytes),
        }
    }
}

export default Monitor;
