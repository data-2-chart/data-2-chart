import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { RaceChartData, Frame, ColorSchema } from '@data-2-chart/data-2-chart-common-ts';
import { select, ScaleOrdinal, scaleOrdinal } from 'd3';
import { ColorSchemasMap } from '../models/color-schemas.js';

export abstract class RaceChart extends LitElement {
    private _data!: RaceChartData;
    private _firstUpdated = false;
    private _timerInterval!: ReturnType<typeof setInterval>;
    protected svg!: d3.Selection<SVGElement, unknown, null, undefined>;
    protected domRect!: DOMRect;
    protected _color!: ScaleOrdinal<string, string, never>;

    @property({ type: Number })
    maxDataPoints = 12;

    @property({ attribute: 'data', type: Array })
    get data() { return this._data; }

    set data(_raceChartData: RaceChartData) {
        this._data = _raceChartData;
        if (this._data?.length > 0) {
            this._startChart();
        }
    }

    @property({ type: Number })
    duration = 250;

    @property({ type: String })
    colorSchema = ColorSchema.SchemeTableau10;

    @query('#race-chart')
    private _svgElement!: SVGElement;

    override firstUpdated() {
        this._firstUpdated = true;
        this.svg = select(this._svgElement);
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        clearInterval(this._timerInterval);
    }

    private _startChart(): void {
        if (this._firstUpdated === true) {
            this._renderChart();
        } else {
            setTimeout(() => this._startChart(), 10);
        }
    }

    private _renderChart(): void {
        let currentFrame = 0;
        this.domRect = this.getBoundingClientRect();
        this._color = scaleOrdinal(ColorSchemasMap[this.colorSchema]);
        this.displayChart(this.data);
        this.updateFrame(this.data[currentFrame]);
        this._timerInterval = setInterval(() => {
            currentFrame < this.data.length ? currentFrame++ : currentFrame = 0;
            this.updateFrame(this.data[currentFrame]);
        }, this.duration);
    }

    protected abstract displayChart(raceChartData: RaceChartData): void;
    protected abstract updateFrame(frame: Frame<number>): void;

    override render() {
        return html`<svg id='race-chart'></svg>`;
    }
}