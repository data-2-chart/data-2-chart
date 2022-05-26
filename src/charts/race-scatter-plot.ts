import { customElement } from 'lit/decorators.js';
import { RaceChart } from './race-chart.js';
import { Frame, FrameData, ArcData } from '../models/race-chart-data.js';
import { sum, randomNormal, easeLinear, Selection, min, arc } from 'd3';

interface CircleData {
  x: number;
  y: number;
  name: string;
  noChange: boolean;
}

@customElement('race-scatter-plot')
export class RaceScatterPlot extends RaceChart {
  private _totalCircles = 500;
  private _circlesSize = 2;
  private _circleData: CircleData[] = [];
  private _arcData!: ArcData[];
  private _circles!: Selection<SVGGElement, any, SVGGElement, undefined>;
  private _labels!: Selection<SVGTextElement, ArcData, SVGGElement, unknown>;
  private _ticker!: Selection<SVGTextElement, unknown, null, undefined>;
  isFirstFrame = true;

  override displayChart() {
    this.svg
      .attr('width', this.domRect.width)
      .attr('height', this.domRect.height)
      .attr('viewBox', [0, 0, this.domRect.width, this.domRect.height]);
    this._labels = this.svg.append('g').attr('transform', `translate(${this.domRect.width / 2},${this.domRect.height / 2})`).selectAll('text');
    this._circles = this.svg.append('g').attr('transform', `translate(${this.domRect.width / 2},${this.domRect.height / 2})`).selectAll('circle');
    this._ticker = this.svg.append("text")
      .style("font", `bold 1.8em sans-serif`)
      .attr("x", this.domRect.width * .55)
      .attr("y", this.domRect.height * .95)
      .text('');

    const radius = ((min([this.domRect.height, this.domRect.width]) || 100) / 2);
    const _arcGenerator: any = arc().innerRadius(radius * .75).outerRadius(radius * .76);
    const _arcGeneratorLabel: any = arc().innerRadius(radius * .90).outerRadius(radius * .91);

    //generate default _arcData
    const angleDiff = (2 * Math.PI) / this.maxDataPoints;
    let currentAngle = 0;
    this._arcData = Array.from({ length: this.maxDataPoints }, () => {
      const centroid = _arcGenerator.centroid({ startAngle: currentAngle, endAngle: currentAngle + angleDiff });
      const centroidLabel = _arcGeneratorLabel.centroid({ startAngle: currentAngle, endAngle: currentAngle + angleDiff });

      const mappedData: ArcData = {
        name: '',
        value: 0,
        startAngle: currentAngle,
        endAngle: currentAngle + angleDiff,
        x: centroid[0],
        y: centroid[1],
        xLabel: centroidLabel[0],
        yLabel: centroidLabel[1],
        noChange: false
      };
      currentAngle += angleDiff;
      return mappedData;
    });

    this._circleData = Array.from({ length: this._totalCircles }, () => ({ x: 0, y: 0, name: '', noChange: false }));
  }

  override updateFrame(frame: Frame) {
    if (frame?.data?.length > 0) {
      const transition = this.svg.transition()
        .duration(this.duration)
        .ease(easeLinear);
      this._updateArcData(frame.data);
      this._updateLabels(transition);
      this._updateCircleData();
      this._updateCircles(transition);
      this._updateTicker(frame);
      this.isFirstFrame = false;
    }
  }

  private _updateTicker(frame: Frame) {
    this._ticker.text(frame.name);
  }

  private _updateCircleData() {
    const reValue = this._totalCircles / sum(this._arcData, d => d.value);
    this._circleData.forEach(circleObj => circleObj.noChange = false);
    const random = randomNormal(-this.maxDataPoints, this.maxDataPoints);

    this._arcData.forEach(arcData => {
      const totalCircles = Math.ceil(arcData.value * reValue);
      const currentCircles = this._circleData.filter(circleObj => circleObj.name == arcData.name)?.splice(0, totalCircles);
      currentCircles?.forEach(currentCircleObj => {
        currentCircleObj.x = arcData.x + random();
        currentCircleObj.y = arcData.y + random();
        currentCircleObj.noChange = true
      });
    });

    this._arcData.forEach(arcData => {
      const totalCircles = Math.ceil(arcData.value * reValue);
      const currentCircles = this._circleData.filter(circleObj => circleObj.name == arcData.name);
      Array.from({ length: totalCircles - currentCircles.length }, () => {
        let freeObj = this._circleData.find(circleObj => circleObj.noChange !== true);
        if (freeObj) {
          freeObj.name = arcData.name;
          freeObj.x = arcData.x + random();
          freeObj.y = arcData.y + random();
          freeObj.noChange = true;
        }
      });
    });

    const changeCircles = this._circleData.filter(circleObj => circleObj.noChange === false);
    changeCircles.forEach(obj => {
      obj.name = '';
      obj.x = 0;
      obj.y = 0;
    });
  }

  private _updateArcData(frameData: FrameData[]) {
    const dataPoints = frameData.sort((data1, data2) => data2?.value - data1?.value).slice(0, this.maxDataPoints);
    this._arcData.forEach(arcObj => arcObj.noChange = false);

    dataPoints.forEach(dataPoint => {
      const currentArc = this._arcData.find(arcObj => arcObj.name == dataPoint.name);
      if (currentArc) {
        currentArc.noChange = true;
      }
    });

    dataPoints.forEach(dataPoint => {
      const currentArc = this._arcData.find(arcObj => arcObj.name == dataPoint.name);
      if (!currentArc) {
        let freeIndex = this._arcData.findIndex(arcObj => arcObj.noChange !== true);
        if (freeIndex != -1) {
          const freeObj = this._arcData[freeIndex];
          const newObj = {
            name: dataPoint.name,
            startAngle: freeObj.startAngle,
            endAngle: freeObj.endAngle,
            value: dataPoint.value,
            x: freeObj.x,
            y: freeObj.y,
            xLabel: freeObj.xLabel,
            yLabel: freeObj.yLabel,
            noChange: true
          };
          this._arcData.splice(freeIndex, 1, newObj);
        }
      }
    });

    this._arcData.forEach(obj => {
      if (obj.noChange != true) {
        obj.value = 0;
      }
    });
  }

  private _updateCircles(transition: any) {
    this._circles = this._circles.data(this._circleData)
      .join(
        enter => enter.append('circle')
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", this._circlesSize)
          .attr("fill", d => this._color(d.name)),
        update => update,
        exit => exit.transition(transition).remove(),
      )
      .call(circles => circles.transition(transition)
        .delay(_ => Math.random() * this.duration)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", this._circlesSize)
        .attr("fill", d => this._color(d.name)));
  }

  private _updateLabels(transition: any) {
    this._labels = this._labels.data(this._arcData)
      .join(
        enter => enter.append('text')
          .attr("x", 0)
          .attr("y", 0)
          .style('font', this.labelFont)
          .text(d => d.name),
        update => update,
        exit => exit.remove().transition(transition),
      )
      .call(text => {
        text.transition(transition)
          .attr("x", d => d.xLabel)
          .attr("y", d => d.yLabel)
          .style('font', this.labelFont)
          .attr("text-anchor", d => d.x < (this.domRect.width / 2) ? "end" : "start")
          .text(d => d.name)
      });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'race-scatter-plot': RaceScatterPlot;
  }
}