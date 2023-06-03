import React from 'react';
import {Grid} from '@material-ui/core';
import {changeTimeZone} from "../../../utilities/Utils";

export default function LicenseOptions(params) {
    const {formState} = params;
    const features = formState?.licenseInfo?.features;
    const licFeatures = features?.join('.');

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>

                {formState?.licenseInfo &&
                <>
                    <ul>
                        <li title={licFeatures}>
                            License ID: {formState.licenseInfo.license_id}
                        </li>

                        <li>
                            Issued to: {formState.licenseInfo.issued_to}
                        </li>

                        {formState.licenseInfo?.expires_text ?
                            <li>
                                Expires at: {formState.licenseInfo?.expires_text}
                            </li>
                            :
                            <>
                                {formState?.licenseInfo?.expires_at &&
                                <li>Expires at: {changeTimeZone(formState.licenseInfo.expires_at * 1000)}</li>
                                }
                                <li>Days
                                    remaining: {Math.ceil((formState.licenseInfo.expires_at - (new Date() / 1000)) / 3600 / 24)}</li>
                            </>
                        }

                        <li>
                            Hardware licence:
                            {formState.licenseInfo.hardware_available ?
                                <span> Connected</span>
                                :
                                <span> Not available</span>
                            }
                        </li>

                        {formState?.licenseInfo?.features?.includes('chn') &&
                            <li>
                                License challenge in {formState?.licenseInfo?.challengeRemainingDays} days
                            </li>
                        }

                    </ul>
                </>
                }
            </Grid>
        </Grid>
    );
}
