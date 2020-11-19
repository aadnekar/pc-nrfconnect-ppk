/* Copyright (c) 2015 - 2020, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toggle } from 'pc-nrfconnect-shared';

import DigitalChannels from './DigitalChannels';
import Group from './Group';

import {
    chartState,
    toggleDigitalChannels,
    toggleTimestamps,
    togglePreSampling,
    togglePostSampling,
} from '../../reducers/chartReducer';
import {
    currentPane as currentPaneSelector,
    appState,
} from '../../reducers/appReducer';

export default () => {
    const dispatch = useDispatch();
    const {
        digitalChannelsVisible,
        timestampsVisible,
        hasDigitalChannels,
        preSamplingOn,
        postSamplingOn,
    } = useSelector(chartState);
    const currentPane = useSelector(currentPaneSelector);
    const {
        capabilities: { prePostTriggering },
    } = useSelector(appState);

    return (
        <Group
            heading="Display options"
            collapse={{
                collapsible: true,
                defaultCollapsed: false,
            }}
        >
            <Toggle
                onToggle={() => dispatch(toggleTimestamps())}
                isToggled={timestampsVisible}
                label="Timestamps"
                variant="secondary"
            />
            {hasDigitalChannels && currentPane === 1 && (
                <>
                    <Toggle
                        onToggle={() => dispatch(toggleDigitalChannels())}
                        isToggled={digitalChannelsVisible}
                        label="Digital channels"
                        variant="secondary"
                    />
                    <DigitalChannels />
                </>
            )}
            {prePostTriggering && currentPane === 0 && (
                <>
                    <Toggle
                        onToggle={() => dispatch(togglePreSampling())}
                        isToggled={preSamplingOn}
                        label="5ms pre-sample"
                        variant="secondary"
                    />
                    <Toggle
                        onToggle={() => dispatch(togglePostSampling())}
                        isToggled={postSamplingOn}
                        label="5ms post-sample"
                        variant="secondary"
                    />
                </>
            )}
        </Group>
    );
};
