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

export interface ArcData {
    name: string;
    startAngle: number;
    endAngle: number;
    value: number;
    x: number;
    y: number;
    xLabel: number;
    yLabel: number;
    noChange: boolean;
}