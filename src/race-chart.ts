import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { RaceChartData, Frame } from './models/race-chart-data';
import { select } from 'd3';

export abstract class RaceChart extends LitElement {
    private _data!: RaceChartData;
    private _firstUpdated = false;
    private _timerInterval!: ReturnType<typeof setInterval>;
    protected svg!: d3.Selection<SVGElement, unknown, null, undefined>;
    protected domRect!: DOMRect;

    @property({ attribute: 'data', type: Object })
    get data() { return this._data; }

    @property({ type: Number })
    duration = 250;

    @property({ type: Number, attribute: 'margin-top' })
    marginTop = 10;

    @property({ type: Number, attribute: 'margin-right' })
    marginRight = 10;

    @property({ type: Number, attribute: 'margin-bottom' })
    marginBottom = 10;

    @property({ type: Number, attribute: 'margin-left' })
    marginLeft = 10;

    @query('#race-chart')
    private _svgElement!: SVGElement;

    set data(_raceChartData: RaceChartData) {
        this._data = _raceChartData;
        if (this._data?.frames?.length > 0) {
            this._startChart();
        }
    }

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
        this.displayChart(this.data);
        this.updateFrame(this.data.frames[currentFrame]);
        this._timerInterval = setInterval(() => {
            currentFrame >= this.data.frames.length ? currentFrame = 0 : currentFrame++;
            this.updateFrame(this.data.frames[currentFrame]);
        }, this.duration);
    }

    protected abstract displayChart(raceChartData: RaceChartData): void;
    protected abstract updateFrame(frame: Frame): void;

    override render() {
        return html`<svg id='race-chart'></svg>`;
    }
}