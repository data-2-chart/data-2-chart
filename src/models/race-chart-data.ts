export interface RaceChartData {
    delay: number;
    frames: Frame[];
}

export interface Frame {
    id: number;
    name: string;
    data: FrameData[];
}

export interface FrameData {
    name: string;
    value: number;
    rank: number;
}