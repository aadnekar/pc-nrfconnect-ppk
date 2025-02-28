/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import { DeviceSelector, getAppFile, logger } from 'pc-nrfconnect-shared';

import { close, open } from '../actions/deviceActions';

const deviceListing = {
    nordicUsb: true,
    nordicDfu: true,
    serialPorts: true,
    jlink: true,
};

const deviceSetup = {
    dfu: {
        ppk2: {
            application: getAppFile('firmware/pca63100_ppk2_7453297.hex'),
            semver: 'power_profiler_kit_2 1.0.1-7453297',
        },
    },
    jprog: {
        nrf52_family: {
            fw: getAppFile('firmware/ppk_nrfconnect.hex'),
            fwVersion: 'ppk-fw-2.1.0',
            fwIdAddress: 0x10000,
        },
    },
};

const mapState = () => ({
    deviceListing,
    deviceSetup,
});

const mapDispatch = dispatch => ({
    onDeviceSelected: device => {
        logger.info(
            `Validating firmware for device with s/n ${device.serialNumber}`
        );
    },
    onDeviceDeselected: () => {
        logger.info('Deselecting device');
        dispatch(close());
    },
    releaseCurrentDevice: () => dispatch(close()),
    onDeviceIsReady: device => {
        logger.info(`Opening device with s/n ${device.serialNumber}`);
        dispatch(open(device));
    },
});

export default connect(mapState, mapDispatch)(DeviceSelector);
