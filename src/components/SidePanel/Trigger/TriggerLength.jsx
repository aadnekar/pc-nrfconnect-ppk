/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useDispatch, useSelector } from 'react-redux';
import { NumberInlineInput, Slider } from 'pc-nrfconnect-shared';

import { triggerLengthUpdate } from '../../../actions/deviceActions';
import { triggerState } from '../../../slices/triggerSlice';

const TriggerLength = () => {
    const dispatch = useDispatch();
    const { triggerWindowRange, triggerLength } = useSelector(triggerState);
    const range = { ...triggerWindowRange, decimals: 2 };

    const [triggerLen, setTriggerLen] = useState(triggerLength);

    return (
        <>
            <Form.Label
                title="Duration of trigger window"
                htmlFor="slider-trigger-window"
            >
                <span className="flex-fill">Length</span>
                <NumberInlineInput
                    value={triggerLen}
                    range={range}
                    onChange={setTriggerLen}
                    onChangeComplete={() =>
                        dispatch(triggerLengthUpdate(triggerLen))
                    }
                />{' '}
                ms
            </Form.Label>
            <Slider
                title="Duration of trigger window"
                id="slider-trigger-window"
                values={[triggerLen]}
                range={range}
                onChange={[value => setTriggerLen(value)]}
                onChangeComplete={() =>
                    dispatch(triggerLengthUpdate(triggerLen))
                }
            />
        </>
    );
};

export default TriggerLength;
