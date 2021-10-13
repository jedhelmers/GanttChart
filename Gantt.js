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

  rawData:
    [
      {obj}
    ]

    This represents the raw data. With it, you can render sidebar column items or reference it within
    your ChartItems

*/

// Chart Data indices
let ID = 0
let SORT_ID = 1
let CHART_ITEM_INDEX = 2
let START = 3
let END = 4
let RELATIONS = 5

// consts
let ROW_HEIGHT = 42
let ITEM_HEIGHT = 30


class GanttChart {
  constructor(chartData, rawData, chartItem) {
    this.chartData = chartData /* matrix */
    this.rawData = rawData /* vector */
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

  setRawData(rawData) {
    this.rawData = rawData
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

  renderRelationship(from, to) {
    // console.log(`${from} => ${to}`)
    const relationship = document.createElement('path')
    const params = {
      id: `${from.id}-to-${to.id}`,
      class: 'gantt-relationship-line',
      d: ''
    }
    this.setAttribs(relationship, params)
    return relationship
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
    const today = document.createElement('line')
    this.setAttribs(today, params)
    return today
  }

  renderItem(row, obj, i = 0) {
    const params = {
      x: `${(row[START] - this.timeBoundary[0]) / this.timeWidth * 100}%`, /* relative positioning */
      y: i * ROW_HEIGHT, /* static positioning */
      width: `${((row[END] - row[START]) / this.timeWidth) * 100}%`, /* relative width */
      height: ITEM_HEIGHT,
      class: 'o-gantt-item',
      id: `gantt-item-${row[ID]}`
    }

    const svg = document.createElement('svg')
    svg.setAttribute('id', `gantt-svg-wrapper-${obj.id}`)
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', ROW_HEIGHT)
    const fo = document.createElement('foreignObject')
    this.setAttribs(fo, params)
    fo.appendChild(this.chartItem[row[CHART_ITEM_INDEX]](obj))
    svg.appendChild(fo)

    return fo
  }

  renderChart() {
    const chart = document.createElement('div')
    const params = {
      class: 'o-gantt-chart',
      id: 'gantt-chart'
    }
    const chartItems = []
    this.setAttribs(chart, params)
    this.chartData.sort((a, b) => a[SORT_ID] < b[SORT_ID] ? -1 : 1).forEach((row, i) => {
      chartItems.push(this.renderItem(row, this.rawData.find((obj) => obj.id === row[ID]), i))
    });

    const relationships = []
    this.chartData.sort((a, b) => a[ID] < b[ID] ? -1 : 1).forEach((row, i) => {
      row[RELATIONS].forEach(to => {
        relationships.push(this.renderRelationship(
          chartItems[this.chartData.findIndex(r => r[ID] === row[ID])],
          chartItems[this.chartData.findIndex(r => r[ID] === to)]
        ))
      })
    })

    const svg = document.createElement('svg')

    relationships.forEach((item) => {
      svg.appendChild(item)
    })

    chart.appendChild(svg)

    chartItems.forEach((item) => {
      svg.appendChild(item)
    })

    svg.appendChild(this.renderToday())

    chart.appendChild(svg)


    return chart
  }
}


function runTest() {
  f = new GanttChart()
  const dates = [
    [+new Date('10/12/2021'), +new Date('10/30/2021')],
    [+new Date('10/1/2021'), +new Date('10/17/2021')],
    [+new Date('10/5/2021'), +new Date('10/7/2021')],
    [+new Date('10/9/2021'), +new Date('10/20/2021')],
    [+new Date('10/2/2021'), +new Date('10/27/2021')],
    [+new Date('10/18/2021'), +new Date('10/19/2021')]
  ]
  f.setRawData(new Array(6).fill(0).map((a, i) => (
    {
      id: i,
      title: `${i}-Howdy!`,
      description: "I'm an item description",
      itemType: 0,
      start: dates[i][0],
      end: dates[i][1],
      relationships: []
    }
  )))
  f.setChartData([
    [0, 4, 0, dates[0][0], dates[0][1], []],
    [1, 3, 0, dates[1][0], dates[1][1], []],
    [2, 1, 0, dates[2][0], dates[2][1], [5, 3, 4]],
    [3, 5, 0, dates[3][0], dates[3][1], []],
    [4, 2, 0, dates[4][0], dates[4][1], []],
    [5, 0, 0, dates[5][0], dates[5][1], [1]]
  ])

  f.setChartItem([(obj) => {
    /* INSERT COMPONENT HERE. It will pass the RAW DATA ROW back to you to reference. */
    item = document.createElement('div')
    item.setAttribute('id', `${obj.id}-buttheads`)
    item.innerText = `${obj.title}: ${obj.description}`
    return item
  }])
  f.renderToday()
}

runTest()
