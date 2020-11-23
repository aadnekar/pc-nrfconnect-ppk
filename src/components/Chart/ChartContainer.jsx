import React from 'react';
import { Line } from 'react-chartjs-2';
import { unit } from 'mathjs';
import { useSelector, useDispatch } from 'react-redux';
import { func, number, shape, arrayOf } from 'prop-types';
import { triggerState } from '../../reducers/triggerReducer';

import dragSelectPlugin from './plugins/chart.dragSelect';
import zoomPanPlugin from './plugins/chart.zoomPan';
import crossHairPlugin from './plugins/chart.crossHair';
import triggerLevelPlugin from './plugins/chart.triggerLevel';

import {
    appState,
    currentPane as currentPaneSelector,
} from '../../reducers/appReducer';
import { chartState } from '../../reducers/chartReducer';
import { updateTriggerLevel } from '../../actions/deviceActions';
import { yAxisWidthPx, rightMarginPx } from './chart.scss';
import colors from '../colors.scss';

const valueRange = { min: 0, max: undefined };
const yAxisWidth = parseInt(yAxisWidthPx, 10);
const rightMargin = parseInt(rightMarginPx, 10);
const dataColor = colors.nordicBlue;

const timestampToLabel = (usecs, index, array) => {
    const microseconds = Math.abs(usecs);
    const sign = usecs < 0 ? '-' : '';
    if (!array) {
        return `${sign}${Number(microseconds / 1e3).toFixed(3)} ms`;
    }
    if (index > 0 && index < array.length - 1) {
        const first = array[0];
        const last = array[array.length - 1];
        const range = last - first;
        if (usecs - first < range / 8 || last - usecs < range / 8) {
            return undefined;
        }
    }

    const d = new Date(microseconds / 1e3);
    const h = d.getUTCHours().toString().padStart(2, '0');
    const m = d.getUTCMinutes().toString().padStart(2, '0');
    const s = d.getUTCSeconds().toString().padStart(2, '0');

    const time = `${sign}${h}:${m}:${s}`;
    const subsecond = `${Number((microseconds / 1e3) % 1e3).toFixed(
        3
    )}`.padStart(7, '0');

    return [time, subsecond];
};

const formatCurrent = uA =>
    unit(uA, 'uA')
        .format({ notation: 'auto', precision: 4 })
        .replace('u', '\u00B5');

const ChartContainer = ({
    setLen,
    setChartAreaWidth,
    step,
    chartRef,
    cursorData: { begin, end },
    lineData,
    mappedIndex,
}) => {
    const dispatch = useDispatch();
    const {
        triggerLevel,
        triggerRunning,
        triggerSingleWaiting,
        externalTrigger,
    } = useSelector(triggerState);
    const {
        windowBegin,
        windowEnd,
        cursorBegin,
        cursorEnd,
        yMin,
        yMax,
        timestampsVisible,
    } = useSelector(chartState);
    const { samplingRunning } = useSelector(appState);
    const currentPane = useSelector(currentPaneSelector);
    const sendTriggerLevel = level => dispatch(updateTriggerLevel(level));
    const live =
        windowBegin === 0 &&
        windowEnd === 0 &&
        (samplingRunning || triggerRunning || triggerSingleWaiting);
    const snapping = step <= 0.16 && !live;

    const pointRadius = step <= 0.08 ? 4 : 2;
    const chartData = {
        datasets: [
            {
                borderColor: dataColor,
                borderWidth: step > 2 ? 1 : 1.5,
                fill: false,
                data: lineData.slice(0, mappedIndex),
                pointRadius: snapping ? pointRadius : 0,
                pointHoverRadius: snapping ? pointRadius : 0,
                pointHitRadius: snapping ? pointRadius : 0,
                pointBackgroundColor: colors.white,
                pointHoverBackgroundColor: dataColor,
                pointBorderWidth: 1.5,
                pointHoverBorderWidth: 1.5,
                pointBorderColor: dataColor,
                pointHoverBorderColor: dataColor,
                lineTension: snapping ? 0.2 : 0,
                label: 'Current',
                yAxisID: 'yScale',
                labelCallback: ({ y }) => formatCurrent(y),
            },
        ],
    };

    const chartOptions = {
        scales: {
            xAxes: [
                {
                    id: 'xScale',
                    type: 'linear',
                    display: true,
                    ticks: {
                        display: timestampsVisible,
                        minRotation: 0,
                        maxRotation: 0,
                        autoSkipPadding: 25,
                        min: begin,
                        max: end,
                        callback: timestampToLabel,
                        maxTicksLimit: 7,
                    },
                    gridLines: {
                        display: true,
                        drawBorder: true,
                        drawOnChartArea: true,
                    },
                    cursor: { cursorBegin, cursorEnd },
                afterFit: scale => { scale.paddingRight = rightMargin; }, // eslint-disable-line
                },
            ],
            yAxes: [
                {
                    id: 'yScale',
                    type: 'linear',
                    ticks: {
                        minRotation: 0,
                        maxRotation: 0,
                        min: yMin === null ? valueRange.min : yMin,
                        max: yMax === null ? valueRange.max : yMax,
                        maxTicksLimit: 7,
                        padding: 0,
                        callback: uA => (uA < 0 ? '' : formatCurrent(uA)),
                    },
                    gridLines: {
                        display: true,
                        drawBorder: true,
                        drawOnChartArea: true,
                    },
                    afterFit: scale => { scale.width = yAxisWidth; }, // eslint-disable-line
                },
            ],
        },
        redraw: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        hover: { animationDuration: 0 },
        responsiveAnimationDuration: 0,
        tooltips: { enabled: false },
        legend: { display: false },
        formatX: timestampToLabel,
        formatY: formatCurrent,
        triggerLevel,
        triggerActive: triggerRunning || triggerSingleWaiting,
        sendTriggerLevel,
        snapping,
        live,
        triggerHandleVisible: currentPane === 0 && !externalTrigger,
    };
    return (
        <div className="chart-container">
            <Line
                ref={chartRef}
                data={chartData}
                options={chartOptions}
                plugins={[
                    dragSelectPlugin,
                    zoomPanPlugin,
                    triggerLevelPlugin,
                    crossHairPlugin,
                    {
                        id: 'notifier',
                        afterLayout(chart) {
                            const { chartArea, width } = chart;
                            chartArea.right = width - rightMargin;
                            const { left, right } = chart.chartArea;
                            const w = Math.trunc(right - left);
                            setLen(Math.min(w, 2000));
                            setChartAreaWidth(w);
                        },
                    },
                ]}
            />
        </div>
    );
};

export default ChartContainer;

ChartContainer.propTypes = {
    setLen: func.isRequired,
    setChartAreaWidth: func.isRequired,
    step: number.isRequired,
    chartRef: shape({}).isRequired,
    cursorData: shape({
        begin: number.isRequired,
        end: number.isRequired,
    }).isRequired,
    lineData: arrayOf(
        shape({
            x: number,
            y: number,
        })
    ),
    mappedIndex: number.isRequired,
};
