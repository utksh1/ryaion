export interface StockData {
    id: string;
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    sentiment: 'fomo' | 'panic' | 'neutral' | 'hype';
    aura: number; // 0-100
    marketCap: string;
    volume: string;
}

export const MOCK_STOCKS: StockData[] = [
    {
        id: '1',
        symbol: 'RELIANCE',
        name: 'Reliance Industries',
        price: 2980.50,
        change: 45.20,
        changePercent: 1.54,
        sentiment: 'hype',
        aura: 92,
        marketCap: '19.8T',
        volume: '5.2M'
    },
    {
        id: '2',
        symbol: 'TCS',
        name: 'Tata Consultancy Svcs',
        price: 3950.00,
        change: -12.50,
        changePercent: -0.32,
        sentiment: 'neutral',
        aura: 78,
        marketCap: '14.2T',
        volume: '1.1M'
    },
    {
        id: '3',
        symbol: 'HDFCBANK',
        name: 'HDFC Bank',
        price: 1450.75,
        change: -25.00,
        changePercent: -1.69,
        sentiment: 'panic',
        aura: 45,
        marketCap: '11.1T',
        volume: '12.5M'
    },
    {
        id: '4',
        symbol: 'INFY',
        name: 'Infosys Ltd',
        price: 1680.20,
        change: 18.40,
        changePercent: 1.10,
        sentiment: 'fomo',
        aura: 88,
        marketCap: '7.1T',
        volume: '3.4M'
    },
    {
        id: '5',
        symbol: 'TATAMOTORS',
        name: 'Tata Motors',
        price: 980.00,
        change: 32.10,
        changePercent: 3.45,
        sentiment: 'hype',
        aura: 98,
        marketCap: '3.2T',
        volume: '8.9M'
    },
    {
        id: '6',
        symbol: 'ZOMATO',
        name: 'Zomato Ltd',
        price: 185.50,
        change: 4.50,
        changePercent: 2.48,
        sentiment: 'hype',
        aura: 95,
        marketCap: '1.6T',
        volume: '22.1M'
    }
];
