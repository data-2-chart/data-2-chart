import { customElement, property } from 'lit/decorators.js';
import { RaceChart } from './race-chart';
import { Frame, FrameData } from './models/race-chart-data';
import { scaleLinear, ScaleLinear, scaleBand, ScaleBand, range, Selection, easeLinear } from 'd3';

@customElement('race-bar-chart')
export class RaceBarChart extends RaceChart {
  margin = { top: 0, right: 0, bottom: 0, left: 0 };
  barSize = 18;
  color = 'green';

  @property({ type: Number })
  barsInFrame = 12;
  
  xScale!: ScaleLinear<number, number, never>;
  yScale!: ScaleBand<string>;
  bar!: Selection<SVGRectElement, FrameData, SVGGElement, unknown>;

  override displayChart() {
    this.svg.attr("viewBox", [0, 0, this.domRect.width, this.domRect.height]);
    this.xScale = scaleLinear([0, 1], [this.margin.left, this.domRect.width - this.margin.right]);
    this.yScale = scaleBand()
      .domain(range(this.barsInFrame + 1) as Iterable<string>)
      .rangeRound([this.margin.top, this.margin.top + this.barSize * (this.barsInFrame + 1 + 0.1)])
      .padding(0.1);
    this.bar = this.svg.append("g")
      .attr("fill-opacity", 0.6)
      .selectAll("rect");
  }

  override updateFrame(frame: Frame) {
    const transition = this.svg.transition()
      .duration(this.duration)
      .ease(easeLinear);
    this.xScale.domain([0, frame.data[0].value]);
    this.bars(frame, transition);
  }

  private bars(frame: Frame, transition: any) {
    this.bar = this.bar
      .data(frame.data.slice(0, this.barsInFrame), (d: any) => d.name)
      .join(
        enter => enter.append("rect")
          .attr("fill", this.color)
          .attr("height", this.yScale.bandwidth())
          .attr("x", this.xScale(0))
          .attr("y", d => this.yScale(d.rank as any) as any)
          .attr("width", d => this.xScale(d.value) - this.xScale(0)),
        update => update,
        exit => exit.transition(transition).remove()
          .attr("y", d => this.yScale(d.rank as any) as any)
          .attr("width", d => this.xScale(d.value) - this.xScale(0))
      )
      .call(bar => bar.transition(transition)
        .attr("y", d => this.yScale(d.rank as any) as any)
        .attr("width", d => this.xScale(d.value) - this.xScale(0)));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'race-bar-chart': RaceBarChart;
  }
}