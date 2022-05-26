import { customElement } from 'lit/decorators.js';
import { RaceChart } from './race-chart.js';
import { Frame, FrameData } from '../models/race-chart-data.js';
import { pack, hierarchy, Selection, HierarchyCircularNode, easeLinear } from 'd3';

@customElement('race-bubble-chart')
export class RaceBubbleChart extends RaceChart {

  private _bubbles!: Selection<SVGGElement, HierarchyCircularNode<FrameData>, SVGGElement, undefined>;

  override displayChart() {
    this.svg
      .attr('width', this.domRect.width)
      .attr('height', this.domRect.height)
      .attr('viewBox', [0, 0, this.domRect.width, this.domRect.height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("fill", "currentColor")
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle");
    this._bubbles = this.svg.append("g").selectAll("circle");
  }

  override updateFrame(frame: Frame) {
    if (frame?.data?.length > 0) {
      frame.data.sort((data1, data2) => data2?.value - data1?.value);
      const transition = this.svg.transition()
        .duration(this.duration)
        .ease(easeLinear);
      const root: any = pack()
        .size([this.domRect.width - this.marginLeft - this.marginRight, this.domRect.height - this.marginTop - this.marginBottom])
        .padding(1)
        (hierarchy({ children: frame.data.slice(0, this.maxDataPoints) })
          .sum((d: any) => d.value));
      this._updateCircles(root, transition);
    }
  }

  private _updateCircles(root: HierarchyCircularNode<FrameData>, transition: any) {
    this._bubbles = this._bubbles.data(root.leaves())
      .join(
        enter => enter.append('circle'),
        update => update,
        exit => exit.transition(transition).remove(),
      )
      .call(bar => bar.transition(transition)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.r)
        .attr("fill", d => this._color(d.data.name)));
  }
  // override updateFrame(frame: Frame) {
  //   if (frame?.data?.length > 0) {
  //     frame.data.sort((data1, data2) => data2?.value - data1?.value);
  //     const transition = this.svg.transition()
  //       .duration(this.duration)
  //       .ease(easeLinear);
  //     const root = pack()
  //       .size([this.domRect.width - this.marginLeft - this.marginRight, this.domRect.height - this.marginTop - this.marginBottom])
  //       .padding(1)
  //       (hierarchy({ children: frame.data.slice(0, this.maxDataPoints) })
  //         .sum((d: any) => d.value));
  //     this._updateCircles(root, transition);
  //     this._updateText(root, transition);
  //   }
  // }

  // private _updateCircles(root: HierarchyCircularNode<unknown>, transition: any) {
  //   this._circles = this._circles.data(root.leaves())
  //     .join(
  //       enter => enter.append("circle")
  //         .attr('fill', (d: any) => this._color(d.data.name))
  //         .attr("r", d => d.r)
  //         .attr("cx", d => d.x)
  //         .attr("cy", d => d.y),
  //       update => update,
  //       exit => exit.transition(transition).remove()
  //         .attr("r", d => d.r)
  //         .attr("cx", d => d.x)
  //         .attr("cy", d => d.y)
  //     )
  //     .call(circle => circle.transition(transition)
  //       .attr("r", d => d.r)
  //       .attr("cx", d => d.x)
  //       .attr("cy", d => d.y));
  // }

  // private _updateText(root: HierarchyCircularNode<unknown>, transition: any) {
  //   this._text = this._text.data(root.leaves())
  //     .join(
  //       enter => enter.append('text')
  //         .attr('transform', (d) => `translate(${d.x},${d.y})`)
  //         .attr('y', (d) => d.y)
  //         .attr('x', (d) => d.x)
  //         // .attr('dy', '-0.25em')
  //         .text(d => 'hello'),
  //       update => update,
  //       exit => exit.transition(transition).remove()
  //         .attr('transform', (d, index) => `translate(${d.x},${d.y})`)
  //     )
  //     .call(bar => bar.transition(transition)
  //       .attr('transform', (d) => `translate(${d.x},${d.y})`)
  //       .attr('y', (d) => d.y)
  //       .attr('x', (d) => d.x)
  //       // .attr('dy', '-0.25em')
  //       .text(d => 'hello')
  //     );
  // }
}

declare global {
  interface HTMLElementTagNameMap {
    'race-bubble-chart': RaceBubbleChart;
  }
}