import { customElement } from 'lit/decorators.js';
import { RaceChart } from './race-chart.js';
import { Frame, FrameData } from '@data-2-chart/data-2-chart-common-ts';
import { scaleLinear, ScaleLinear, scaleBand, ScaleBand, range, Selection, easeLinear, axisTop, format } from 'd3';

@customElement('race-bar-chart')
export class RaceBarChart extends RaceChart {
  private _xScale!: ScaleLinear<number, number, never>;
  private _yScale!: ScaleBand<string>;
  private _bar!: Selection<SVGRectElement, FrameData<number>, SVGGElement, unknown>;
  private _label!: Selection<SVGGElement, FrameData<number>, SVGGElement, unknown>;
  private _ticker!: Selection<SVGTextElement, unknown, null, undefined>;
  private _axis!: any;
  private _barSize = 12;
  private marginTop = 10;

  override displayChart() {
    this.svg
      .attr('width', this.domRect.width)
      .attr('height', this.domRect.height)
      .attr('viewBox', [0, 0, this.domRect.width, this.domRect.height]);
    this._xScale = scaleLinear([0, 1], [0, this.domRect.width]);
    this._barSize = (this.domRect.height / this.maxDataPoints) - (0.1 * this.maxDataPoints);
    this._yScale = scaleBand()
      .domain(range(this.maxDataPoints + 1) as Iterable<string>)
      .rangeRound([this.marginTop, this.marginTop + this._barSize * (this.maxDataPoints + 1 + 0.1)])
      .padding(0.1);
    this._bar = this.svg.append('g')
      .selectAll('rect');
    this._axis = this._getAxis();
    this._label = this.svg.append('g')
      .style('font', 'bold 12px sans-serif')
      .style('font-variant-numeric', 'tabular-nums')
      .attr('text-anchor', 'end')
      .selectAll('text');
    this._ticker = this.svg.append("text")
      .style("font", `bold ${this._barSize}px sans-serif`)
      .style("font-variant-numeric", "tabular-nums")
      .attr("text-anchor", "end")
      .attr("x", this.domRect.width - 6)
      .attr("y", this.marginTop + this._barSize * (this.maxDataPoints - 0.45))
      .attr("dy", "0.32em")
      .text('');
  }

  override updateFrame(frame: Frame<number>) {
    if (frame?.frameData?.length > 0) {
      const transition = this.svg.transition()
        .duration(this.duration)
        .ease(easeLinear);
      frame.frameData.sort((data1, data2) => data2?.value - data1?.value);
      this._xScale.domain([0, frame.frameData[0].value]);

      this._updateBars(frame, transition);
      this._updateLabels(frame, transition);
      this._axis(transition);
      this._updateTicker(frame);
    }
  }

  private _updateTicker(frame: Frame<number>) {
    this._ticker.text(frame.name);
  }

  private _updateBars(frame: Frame<number>, transition: any) {
    this._bar = this._bar.data(frame.frameData.slice(0, this.maxDataPoints), d => d.name)
      .join(
        enter => enter.append('rect')
          .attr('fill', d => this._color(d.name))
          .attr('height', this._yScale.bandwidth())
          .attr('x', this._xScale(0))
          .attr('y', _ => this._yScale(this.maxDataPoints as any) as any)
          .attr('width', d => this._xScale(d.value) - this._xScale(0)),
        update => update,
        exit => exit.transition(transition).remove()
          .attr('y', _ => this._yScale(this.maxDataPoints as any) as any)
          .attr('width', d => this._xScale(d.value) - this._xScale(0))
      )
      .call(bar => bar.transition(transition)
        .attr('y', (_, index) => this._yScale(index as any) as any)
        .attr('width', d => this._xScale(d.value) - this._xScale(0)));
  }

  private _updateLabels(frame: Frame<number>, transition: any) {
    this._label = this._label.data(frame.frameData.slice(0, this.maxDataPoints), d => d.name)
      .join(
        enter => enter.append('text')
          .attr('transform', (d, index) => `translate(${this._xScale(d.value)},${this._yScale(index as any)})`)
          .attr('y', this._yScale.bandwidth() / 2)
          .attr('x', -6)
          .attr('dy', '-0.25em')
          .text(d => d.name)
          .call(text => text.append("tspan")
            .attr("fill-opacity", 0.7)
            .attr("font-weight", "normal")
            .attr("x", -6)
            .attr("dy", "1.15em")),
        update => update,
        exit => exit.transition(transition).remove()
          .attr('transform', (d, index) => `translate(${this._xScale(d.value)},${this._yScale(index as any)})`)
          .call(g => g.select("tspan").text(d => format(",d")(d.value)))
      )
      .call(bar => bar.transition(transition)
        .attr('transform', (d, index) => `translate(${this._xScale(d.value)},${this._yScale(index as any)})`)
        .call(g => g.select("tspan").text(d => format(",d")(d.value))));
  }

  private _getAxis() {
    const axisG = this.svg.append('g')
      .attr('transform', `translate(0,${this.marginTop})`);
    const axis = axisTop(this._xScale)
      .ticks(this.domRect.width / 160)
      .tickSizeOuter(0)
      .tickSizeInner(-this._barSize * (this.maxDataPoints + this._yScale.padding()));

    return (transition: any) => {
      axisG.transition(transition).call(axis);
      axisG.select('.tick:first-of-type text').remove();
      axisG.selectAll('.tick:not(:first-of-type) line').attr('stroke', 'white');
      axisG.select('.domain').remove();
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'race-bar-chart': RaceBarChart;
  }
}