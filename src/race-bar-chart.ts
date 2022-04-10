import { customElement } from 'lit/decorators.js';
import { RaceChart, DURATION } from './race-chart';
import { Frame, FrameData, RaceChartData } from './models/race-chart-data';
import { scaleLinear, ScaleLinear, scaleBand, ScaleBand, range, Selection, easeLinear } from 'd3';

@customElement('race-bar-chart')
export class RaceBarChart extends RaceChart {
  width = 800;
  height = 400;
  margin = { top: 0, right: 6, bottom: 0, left: 0 };
  barSize = 18;
  n = 12;
  duration = DURATION;
  color = 'green';

  x!: ScaleLinear<number, number, never>;
  y!: ScaleBand<string>;
  bar!: Selection<SVGRectElement, FrameData, SVGGElement, unknown>;

  override displayChart(raceChartData: RaceChartData) {
    this.duration = raceChartData.delay;

    this.svg.attr("viewBox", [0, 0, this.width, this.height]);
    this.x = scaleLinear([0, 1], [this.margin.left, this.width - this.margin.right]);
    this.y = scaleBand()
      .domain(range(this.n + 1) as Iterable<string>)
      .rangeRound([this.margin.top, this.margin.top + this.barSize * (this.n + 1 + 0.1)])
      .padding(0.1);
    this.bar = this.svg.append("g")
      .attr("fill-opacity", 0.6)
      .selectAll("rect");
  }

  override updateFrame(frame: Frame) {
    const transition = this.svg.transition()
      .duration(this.duration)
      .ease(easeLinear);
    this.x.domain([0, frame.data[0].value]);
    this.bars(frame, transition);
  }

  private bars(frame: Frame, transition: any) {
    this.bar = this.bar
      .data(frame.data.slice(0, this.n), (d: any) => d.name)
      .join(
        enter => enter.append("rect")
          .attr("fill", this.color)
          .attr("height", this.y.bandwidth())
          .attr("x", this.x(0))
          .attr("y", d => this.y(d.rank as any) as any)
          .attr("width", d => this.x(d.value) - this.x(0)),
        update => update,
        exit => exit.transition(transition).remove()
          .attr("y", d => this.y(d.rank as any) as any)
          .attr("width", d => this.x(d.value) - this.x(0))
      )
      .call(bar => bar.transition(transition)
        .attr("y", d => this.y(d.rank as any) as any)
        .attr("width", d => this.x(d.value) - this.x(0)));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'race-bar-chart': RaceBarChart;
  }
}