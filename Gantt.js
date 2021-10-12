/*

  chartData:
    [
      [id, sortId, chartItemIndex, start(miliseconds), end(miliseconds)]
    ]
    id: basic id
    sortId: this is column controls sorting. By adjusting this, the table will automatically resort
    chartItem: visual components passed as an array to GanttChart
    chartItemIndex: this index maps to the UI Componentsof chartItem
    start: miliseconds
    end: miliseconds

    time is stashed as miliseconds as it's more performant

*/

// Chart Data indices
let ID = 0
let SORT_ID = 1
let CHART_ITEM_INDEX = 2
let START = 3
let END = 4

// consts
let ROW_HEIGHT = 42
let ITEM_HEIGHT = 30


class GanttChart {
  constructor(chartData, sidebarData, chartItem) {
    this.chartData = chartData /* matrix */
    this.sidebarData = sidebarData /* vector */
    this.chartItem = chartItem /* vector of UI Components */

    this.timeBoundary = [1, 2] /* min start - max end + offset stuff */
    this.timeWidth = 0
    this.uiScale = 1
  }

  setChartData(chartData) {
    this.chartData = chartData

    const start = ~~Math.min(...chartData.map(row => row[START]))
    const end = ~~Math.min(...chartData.map(row => row[END]))
    this.timeBoundary = [start, end]
    this.timeWidth = end - start
  }

  setSidebarData(sidebarData) {
    this.sidebarData = sidebarData
  }

  setChartItem(chartItem) {
    this.chartItem = chartItem
  }

  setAttribs(element, obj) {
    Object.keys(obj).forEach(key => {
      element.setAttribute(key, obj[key])
    })
  }

  renderToday() {
    const time = +new Date()
    const params = {
      x: `${time / this.timeWidth * 100}%`,
      y: 0,
      width: 4,
      height: '100%',
      class: 'o-gantt-today'
    }
    const today = document.createElement('svg')
    this.setAttribs(today, params)
    return today
  }

  renderItem(row) {
    const params = {
      x: `${(row[START] - this.timeBoundary[0]) / this.timeWidth * 100}%`, /* relative positioning */
      y: row[SORT_ID] * ROW_HEIGHT, /* static positioning */
      width: `${(row[END] - row[START] / this.timeWidth) * 100}%`, /* relative width */
      height: ITEM_HEIGHT,
      class: 'o-gantt-item'
    }

    const svg = document.createElement('svg')
    const fo = document.createElement('foreignObject')
    this.setAttribs(fo, params)
    fo.appendChild(this.chartItem[i])
    svg.appendChild(fo)

    return svg
  }
}
