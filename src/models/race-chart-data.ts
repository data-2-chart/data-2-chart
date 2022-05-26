export interface RaceChartData {
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
}
