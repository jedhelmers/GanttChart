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

    const start = Math.min(...chartData.map(row => row[START]))
    const end = Math.max(...chartData.map(row => row[END]))
    this.timeBoundary = [start ? start : 0, end ? end : 0]
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

  sortByStart() {
    this.chartData = this.chartData.map((row) => {
      row[SORT_ID] = row[START]
      return row
    }).sort((a, b) => a[SORT_ID] < b[SORT_ID] ? -1 : 1)
  }

  sortByEnd() {
    this.chartData = this.chartData.map((row) => {
      row[SORT_ID] = row[END]
      return row
    }).sort((a, b) => a[SORT_ID] < b[SORT_ID] ? -1 : 1)
  }

  sortByItemType() {
    this.chartData = this.chartData.map((row) => {
      row[SORT_ID] = row[CHART_ITEM_INDEX]
      return row
    }).sort((a, b) => a[SORT_ID] < b[SORT_ID] ? -1 : 1)
  }

  sortById() {
    this.chartData = this.chartData.map((row) => {
      row[SORT_ID] = row[ID]
      return row
    }).sort((a, b) => a[SORT_ID] < b[SORT_ID] ? -1 : 1)
  }

  sortByMisc(matrix) {
    /* this one will need an N x 2 matrix of ID's and OTHER  */
    const _matrix = matrix.sort((a, b) => a[0] < b[0] ? -1 : 1)
    this.chartData = this.chartData
      .sort((a, b) => a[ID] < b[0] ? -1 : 1)
      .map((row) => {
        row[SORT_ID] = _matrix[1]
        return row
      })
  }

  renderToday() {
    const time = +new Date()
    const params = {
      x: `${(time - this.timeBoundary[0]) / this.timeWidth * 100}%`,
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
      width: `${((row[END] - row[START]) / this.timeWidth) * 100}%`, /* relative width */
      height: ITEM_HEIGHT,
      class: 'o-gantt-item',
      id: `gantt-item-${row[ID]}`
    }

    const svg = document.createElement('svg')
    const fo = document.createElement('foreignObject')
    this.setAttribs(fo, params)
    // console.log(row[ID], this.chartItem[row[CHART_ITEM_INDEX]])
    fo.appendChild(this.chartItem[row[CHART_ITEM_INDEX]]())
    svg.appendChild(fo)

    return svg
  }

  renderChart() {
    const chart = document.createElement('div')
    const params = {
      class: 'o-gantt-chart',
      id: 'gantt-chart'
    }
    this.setAttribs(chart, params)
    this.chartData.sort((a, b) => a[SORT_ID] < b[SORT_ID] ? -1 : 1).forEach((row, i) => {
      chart.appendChild(this.renderItem(row))
    });
    return chart
  }
}


f = new GanttChart()
f.setChartData([
  [0, 4, 0, +new Date('10/12/2021'), +new Date('10/30/2021')],
  [1, 3, 0, +new Date('10/1/2021'), +new Date('10/17/2021')],
  [2, 1, 0, +new Date('10/5/2021'), +new Date('10/7/2021')],
  [3, 5, 0, +new Date('10/9/2021'), +new Date('10/20/2021')],
  [4, 2, 0, +new Date('10/2/2021'), +new Date('10/27/2021')],
  [5, 0, 0, +new Date('10/18/2021'), +new Date('10/19/2021')]
])
f.setSidebarData(['Butthead'])
item = document.createElement('div')
item.setAttribute('id', 'buttheads')
item.innerText = "HOWDY!"
f.setChartItem([() => item])
f.renderToday()
