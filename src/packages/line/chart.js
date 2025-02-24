import { getDataset, getStackMap, formatMeasure } from '../../utils'
import BaseChart from '../../BaseChart'

class LineChart extends BaseChart {
  static getLineTooltip (settings) {
    const { tooltipFormatter } = settings
    return {
      trigger: 'axis',
      formatter: tooltipFormatter
    }
  }

  static getLineLegend (args) {
    const { settings } = args
    const { legendType = 'plain', legendPadding = 5 } = settings
    return {
      type: legendType,
      padding: legendPadding
    }
  }

  static getLineDimAxis (args) {
    const { settings } = args
    const type = settings.yAxisType || 'category'
    return {
      type,
      boundaryGap: false,
      axisTick: {
        show: false
      },
      axisLabel: {
        margin: 10,
        fontWeight: 400
      }
    }
  }

  static getLineMeaAxis (args) {
    const { settings } = args
    const {
      yAxisScale,
      yAxisLabelType,
      yAxisLabelDigits,
      yAxisName,
      yAxisInterval,
      yAxisMax,
      yAxisMin,
      percentage = false
    } = settings

    let axisValue = {
      type: 'value',
      scale: yAxisScale,
      axisTick: {
        show: false
      },
      axisLabel: {
        margin: 10,
        fontWeight: 400,
        formatter: value => formatMeasure(yAxisLabelType, value, yAxisLabelDigits)
      },
      min: percentage ? 0 : null,
      max: percentage ? 1 : null
    }
    if (yAxisName) axisValue['name'] = yAxisName
    if (yAxisInterval) axisValue['interval'] = Number(yAxisInterval)
    if (yAxisMax) axisValue['max'] = yAxisMax
    if (yAxisMin) axisValue['min'] = yAxisMin

    return axisValue
  }

  static getLineLabel (args) {
    const {
      position = 'top',
      formatType = 'currency',
      formatDigits = 0,
      ...others
    } = args
    const formatter = params => {
      const { value, seriesIndex } = params
      // dataset formatter need shift the value
      value.shift()
      return formatMeasure(formatType, value[seriesIndex], formatDigits)
    }
    return {
      normal: {
        position,
        formatter,
        ...others
      }
    }
  }

  static getLineSeries (args) {
    const { data, settings } = args
    const { measures } = data
    const {
      label = {},
      showSymbol = true,
      smooth = false,
      stack = null,
      step = null,
      symbol = 'emptyCircle',
      symbolSize = 4,
      itemStyle = {},
      ...others
    } = settings
    const series = []
    const stackMap = stack && getStackMap(stack)

    function getLineStyle (lineParams) {
      return {
        normal: {
          width: 2
        }
      }
    }

    measures.forEach(({ name, data }, i) => {
      series.push({
        type: 'line',
        name,
        label: this.getLineLabel(label),
        lineStyle: getLineStyle(),
        showSymbol,
        smooth,
        stack: stack && stackMap[name],
        step,
        symbol,
        symbolSize,
        itemStyle: itemStyle[name] ? itemStyle[name] : {},
        ...others
      })
    })

    return series
  }

  line (data, settings, extra) {
    const { tooltipVisible, legendVisible, isEmptyData } = extra

    extra.chartType = 'line'
    const dataset = !isEmptyData && getDataset(data, settings, extra)

    const tooltip = tooltipVisible && LineChart.getLineTooltip(settings)

    const legend = legendVisible && LineChart.getLineLegend({ settings })

    const xAxis = LineChart.getLineDimAxis({ settings })

    const yAxis = LineChart.getLineMeaAxis({ settings })

    const series = !isEmptyData && LineChart.getLineSeries({ data, settings })

    // build echarts options
    const options = {
      dataset,
      tooltip,
      legend,
      xAxis,
      yAxis,
      series
    }

    // console.log(JSON.stringify(options))

    return options
  }
}

export default LineChart
